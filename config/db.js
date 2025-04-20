const { Pool } = require('pg');
require('dotenv').config(); // Ensure environment variables are loaded

// Create a new pool instance using the connection string from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Optional: Add SSL configuration for production environments if needed
  // ssl: {
  //   rejectUnauthorized: false // Example setting, adjust based on your hosting provider
  // }
});

// Test the connection (optional, but good for verification)
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release(); // Release the client back to the pool
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log('Successfully connected to PostgreSQL database:', result.rows[0].now);
  });
});

// Export the query function or the pool itself for use in models/controllers
module.exports = {
  query: (text, params) => pool.query(text, params),
  // or you could just export the pool:
  // pool: pool
};