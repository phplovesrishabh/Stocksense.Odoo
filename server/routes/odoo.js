const express = require('express');
const { testConnection, syncProducts } = require('../controllers/odooController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

router.use(authenticate);

router.route('/test')
  .post(requireRole(['manager']), testConnection);

router.route('/sync')
  .post(requireRole(['manager']), syncProducts);

module.exports = router;
