const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  actionType: {
    type: String,
    required: true,
  },
  performedBy: {
    userId: { type: String, required: true },
    email:  { type: String, required: true },
    role:   { type: String, required: true },
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // flexible payload depending on action
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
