const express = require('express');
const { getAuditLogs } = require('../controllers/ledgerController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

router.use(authenticate);
router.use(requireRole(['manager']));

router.route('/')
  .get(getAuditLogs);

module.exports = router;
