const { supabaseAdmin: supabase } = require('../config/supabase');
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
    
    // 2. Low Stock Alerts (products with stock < reorder_threshold)
    // For simplicity, let's fetch all stock levels and products and filter in JS since joining with conditions is tricky
    const { data: stockData, error: sErr } = await supabase
      .from('stock_levels')
      .select('quantity, products(name, sku, reorder_threshold), warehouses(name)');

    let lowStockCount = 0;
    let outOfStockCount = 0;

    if (stockData) {
      stockData.forEach(s => {
        if (s.quantity === 0) outOfStockCount++;
        else if (s.products && s.quantity <= s.products.reorder_threshold) lowStockCount++;
      });
    }

    // 3. Pending Receipts
    const { count: pendingReceipts } = await supabase
      .from('receipts')
      .select('*', { count: 'exact', head: true })
      .in('status', ['draft', 'waiting', 'ready']);

    // 4. Pending Deliveries
    const { count: pendingDeliveries } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })
      .in('status', ['draft', 'waiting', 'ready']);

    // 3. Recent Activity (From MongoDB Ledger)
    const recentActivity = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        total_products: totalProducts || 0,
        low_stock_items: lowStockCount || 0,
        out_of_stock_items: outOfStockCount || 0,
        pending_receipts: pendingReceipts || 0,
        pending_deliveries: pendingDeliveries || 0
      }
    });
  } catch (error) {
    next(error);
  }
};
