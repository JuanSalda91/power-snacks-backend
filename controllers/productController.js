const db = require('../config/db'); // Import the database connection

// Function to get all products, with filtering/searching
const getAllProducts = async (req, res) => {
  try {
    // Extract potetial query parameters
    const { type, flavor, search } = req.query;

    let queryText = ' SELECT * FROM products';
    const queryParams = [];
    const conditions = [];

    if (type) {
      queryParams.push(type);
      conditions.push(`type = $${queryParams.length}`);
    }

    if (flavor) {
      queryParams.push(flavor);
      conditions.push(`flavor = $${queryParams.length}`);
    }

    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(`(name ILIKE $${queryParams.length} OR description ILIKE $${queryParams.length})`);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ' ORDER BY id ASC';

    console.log('Executing query:', queryText, queryParams);

    const result = await db.query(queryText, queryParams);
    res.status(200).json(result.rows);

  } catch (error) {
    console.error('Error fetching products from database:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// Function to get a single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const queryText = 'SELECT * FROM products WHERE id = $1';
    const result = await db.query(queryText, [id]);

    // Check if the product was found
    if (result.rows.length === 0) {
      // No product found for this ID, send 404 Not Found
      return res.status(404).json({ message: 'Product not found' });
    }

    // Product found, send it back
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching product with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error fetching product details' });
  }
};

//Export the function so it can be used in the routes
module.exports = {
  getAllProducts,
  getProductById,
  // More functions will be added here later (getProductById, createProduct, etc.)
};