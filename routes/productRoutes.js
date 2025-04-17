const express = require('express');
const productController = require('../controllers/productController');
const router = express.Router();

// Route to get all products
router.get('/', productController.getAllProducts);

//  Route to get a product by ID
router.get('/:id', productController.getProductById);

module.exports = router;