const express = require('express');
const { getWarehouses, createWarehouse } = require('../controllers/warehouseController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

router.use(authenticate);

router.route('/')
  .get(getWarehouses)
  .post(requireRole(['manager']), createWarehouse);

module.exports = router;
