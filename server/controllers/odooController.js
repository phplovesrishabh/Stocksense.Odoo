const { testConnection, syncProducts } = require('../services/odooService');
const { supabaseAdmin: supabase } = require('../config/supabase');
const AuditLog = require('../models/AuditLog');

// @desc    Test Odoo connection
// @route   POST /api/v1/odoo/test
// @access  Private (Manager only)
exports.testConnection = async (req, res, next) => {
  try {
    const { host, port, db, username, password } = req.body;
    
    const result = await testConnection(host, port, db, username, password);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger Odoo product sync
// @route   POST /api/v1/odoo/sync
// @access  Private (Manager only)
exports.syncProducts = async (req, res, next) => {
  try {
    const { host, port, db, username, password } = req.body;
    
    const result = await syncProducts(supabase, host, port, db, username, password);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    // Log sync to MongoDB
    await AuditLog.create({
      actionType: 'ODOO_SYNC',
      performedBy: {
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
      details: {
        syncedCount: result.synced_count,
        errors: result.errors
      }
    });
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
