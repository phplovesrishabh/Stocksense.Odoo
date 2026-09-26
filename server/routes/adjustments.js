const express = require('express');
const { createAdjustment } = require('../controllers/adjustmentController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

router.use(authenticate);

router.route('/')
  .post(requireRole(['manager']), createAdjustment);

module.exports = router;
