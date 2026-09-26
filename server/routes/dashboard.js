const express = require('express');
const { getDashboardMetrics } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.route('/')
  .get(getDashboardMetrics);

module.exports = router;
