const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs (Mongo)
// @route   GET /api/v1/ledger
// @access  Private (Manager only)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};
