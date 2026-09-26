const supabase = require('../config/supabase');
const AuditLog = require('../models/AuditLog');

// @desc    Get dashboard metrics
// @route   GET /api/v1/dashboard
// @access  Private (All)
exports.getDashboardMetrics = async (req, res, next) => {
  try {
    // 1. Total Products
    const { count: totalProducts, error: pErr } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    // 2. Low Stock Alerts (products with stock < 10 for example)
    const { data: lowStockData, error: sErr } = await supabase
      .from('stock_levels')
      .select('quantity, products(name, sku), warehouses(name)')
      .lt('quantity', 10);

    // 3. Recent Activity (From MongoDB Ledger)
    const recentActivity = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalProducts: totalProducts || 0,
        lowStockItems: lowStockData || [],
        recentActivity: recentActivity || []
      }
    });
  } catch (error) {
    next(error);
  }
};
