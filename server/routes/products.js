const express = require('express');
const { getProducts, createProduct } = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(authenticate);

router.route('/')
  .get(getProducts)
  // Only managers can create products
  .post(requireRole(['manager']), createProduct);

module.exports = router;
