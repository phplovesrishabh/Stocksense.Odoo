const express = require('express');
const { getDeliveries, getDeliveryById, createDelivery, updateDeliveryStatus, validateDelivery } = require('../controllers/deliveryController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.route('/')
  .get(getDeliveries)
  .post(createDelivery);

router.route('/:id')
  .get(getDeliveryById);

router.route('/:id/status')
  .put(updateDeliveryStatus);

router.route('/:id/validate')
  .post(validateDelivery);

module.exports = router;
