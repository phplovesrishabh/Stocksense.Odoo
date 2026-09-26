const express = require('express');
const { getAdjustments, getAdjustment, createAdjustment, approveAdjustment, rejectAdjustment } = require('../controllers/adjustmentController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

router.use(authenticate);

router.route('/')
  .get(getAdjustments)
  .post(createAdjustment);

router.route('/:id')
  .get(getAdjustment);

router.route('/:id/approve')
  .post(requireRole(['manager']), approveAdjustment);

router.route('/:id/reject')
  .post(requireRole(['manager']), rejectAdjustment);

module.exports = router;
