const express = require('express');
const { createReceipt } = require('../controllers/receiptController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.route('/')
  .post(createReceipt);

module.exports = router;
