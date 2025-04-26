const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10; // Cost factor for bcrypt hashing

// --- Signup Function ---

const signup = async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' }); // Changed email field to message
  }

  try {
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const insertQuery = `
    INSERT INTO users (email, password_hash, name)
    VALUES ($1, $2, $3)
    RETURNING id, email, name, role, created_at;
    `;
    const newUserResult = await db.query(insertQuery, [email, password_hash, name]);
    const newUser = newUserResult.rows[0];

    // --- CORRECTED JWT Generation ---
    const token = jwt.sign(
      { userID: newUser.id, email: newUser.email, role: newUser.role }, // Use newUser properties
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Or your preferred duration
    );

    // 5. Send success response with token and user info
    res.status(201).json({
      message: 'User created successfully!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        created_at: newUser.created_at,
      }
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal server error during signup' });
  }
};

// --- Login Function ---
const login = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // 1. Find user by email
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // User not found (use a generic message for security)
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const user = userResult.rows[0];

    // 2. Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // Passwords don't match (use a generic message)
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 3. Password match - Generate JWT token
    const token = jwt.sign(
      { userID: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 4. Send success response with tojen and user info (excluding hash)
    res.status(200).json({
      message: 'Login successful!',
      token, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
};

// --- Get current user Function ---
const getCurrentUser = async (req, res) => {
  const userIdFromToken = req.user.id; // Get ID from middleware's req.user object
  console.log(`Backend Controller: Received user ID from token: ${userIdFromToken}, Type: ${typeof userIdFromToken}`); // <-- Log type

  // --- Explicitly parse the ID to an integer ---
  const userId = parseInt(userIdFromToken, 10);
  console.log(`Backend Controller: Parsed user ID for query: ${userId}, Type: ${typeof userId}`); // <-- Log parsed type

  // --- Check if parsing failed ---
  if (isNaN(userId)) {
      console.error('Backend Controller: Failed to parse user ID from token:', userIdFromToken);
      return res.status(400).json({ message: 'Invalid user identifier in token.' });
  }

  try {
    const queryText = 'SELECT id, email, name, role, created_at FROM users WHERE id = $1';
    // Use the parsed integer userId in the query parameters
    const result = await db.query(queryText, [userId]);
    console.log(`Backend: DB query executed. Row count: ${result.rows.length}`);

    if (result.rows.length === 0) {
      console.log(`Backend: User ID ${userId} (type: ${typeof userId}) not found in DB.`); // <-- Updated log
      return res.status(404).json({ message: 'User not found in DB despite valid token.' }); // Keep 404 for not found
    }

    const userProfileData = result.rows[0];
    console.log('Backend: User data being sent to frontend:', JSON.stringify(userProfileData, null, 2));
    res.status(200).json(userProfileData);

  } catch (error) {
    console.error('Backend: Error fetching current user data:', error);
    res.status(500).json({ message: 'Error retrieving user profile.' });
  }
};

module.exports = {
  signup,
  login,
  getCurrentUser,
};