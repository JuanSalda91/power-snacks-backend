require('dotenv').config(); // Load environment variables from .env file
require('./config/db'); // Connect to the database (make sure this file exists)
const express = require('express');
const cors = require('cors');

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5001; // Use port from .env or default to 5001

// Middleware (we'll add more later)
app.use(cors());
app.use(express.json()); // Allows parsing of JSON request bodies

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Power Snacks Backend is running!');
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);


// SERVER LISTENER
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});