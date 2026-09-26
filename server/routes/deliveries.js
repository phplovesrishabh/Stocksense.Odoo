const express = require('express');
const { createDelivery } = require('../controllers/deliveryController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.route('/')
  .post(createDelivery);

module.exports = router;
