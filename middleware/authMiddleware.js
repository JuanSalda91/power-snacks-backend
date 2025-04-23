const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
  let token;
  console.log('--- Protect Middleware Running ---'); // <-- Add log
  console.log('Headers received:', JSON.stringify(req.headers, null, 2)); // <-- Add log to see all headers clearly

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ') // Make sure there's a space after Bearer here!
  ) {
    console.log('Authorization header found and starts with "Bearer ".'); // <-- Add log
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted:', token ? 'Yes' : 'No'); // <-- Add log
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified successfully.'); // <-- Add log
      req.user = {
        id: decoded.userID,
        email: decoded.email,
        role: decoded.role
      };
      console.log('Protect Middleware: Attaching req.user:', JSON.stringify(req.user, null, 2));

      next();
      return;

    } catch (error) {
      console.error('Authentication Error inside try/catch:', error.message); // <-- Modify log
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  } else {
    console.log('Authorization header NOT found or invalid format.'); // <-- Add log
  }

  // This block should only run if the first `if` was false OR if token extraction/verification failed WITHOUT throwing an error that was caught (unlikely)
  if (!token) {
    console.log('No valid token processed. Sending 401 "no token" response.'); // <-- Add log
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
};

// ... admin middleware ...

module.exports = { protect };