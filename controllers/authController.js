const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10; // Cost factor for bcrypt hashing

// --- Signup Function ---

const signup = async (req, res) => {
  const { email, password, name } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ email: 'Email and password are required.' });
  }

  try {
    // 1. Check if user already exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    // 2. Hash the password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. insert new user into database
    const insertQuery = `
    INSERT INTO users (email, password_hash, name)
    VALUES ($1, $2, $3)
    RETURNING id, email, name, role, created_at;
    `; // RETURNING clause gets the inserted user data back

    const newUserResult = await db.query(insertQuery, [email, password_hash, name]);
    const newUser = newUserResult.rows[0];

    // 4. Generate JWT token
    const token = jwt.sign(
      { userID: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
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

// Export the functions
module.exports = {
  signup,
  login,
};