const express = require('express');
const { getReceipts, getReceiptById, createReceipt, updateReceiptStatus, validateReceipt } = require('../controllers/receiptController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.route('/')
  .get(getReceipts)
  .post(createReceipt);

router.route('/:id')
  .get(getReceiptById);

router.route('/:id/status')
  .put(updateReceiptStatus);

router.route('/:id/validate')
  .post(validateReceipt);

module.exports = router;
