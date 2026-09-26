const { supabaseAdmin: supabase } = require('../config/supabase');
const AuditLog = require('../models/AuditLog');

// @desc    Get all adjustments
// @route   GET /api/v1/adjustments
// @access  Private
exports.getAdjustments = async (req, res, next) => {
  try {
    const { status, warehouse_id } = req.query;
    let query = supabase.from('adjustments').select(`
      *,
      warehouse:warehouses(name),
      product:products(name, sku),
      submitted_by_user:user_profiles!adjustments_submitted_by_fkey(full_name),
      reviewed_by_user:user_profiles!adjustments_reviewed_by_fkey(full_name)
    `).order('submitted_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (warehouse_id) query = query.eq('warehouse_id', warehouse_id);

    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json({ success: true, count: data?.length || 0, data: data || [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single adjustment
// @route   GET /api/v1/adjustments/:id
// @access  Private
exports.getAdjustment = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('adjustments').select(`
      *,
      warehouse:warehouses(name),
      product:products(name, sku),
      submitted_by_user:user_profiles!adjustments_submitted_by_fkey(full_name),
      reviewed_by_user:user_profiles!adjustments_reviewed_by_fkey(full_name)
    `).eq('id', req.params.id).single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a manual stock adjustment for approval
// @route   POST /api/v1/adjustments
// @access  Private
exports.createAdjustment = async (req, res, next) => {
  try {
    const { warehouse_id, product_id, physical_qty, reason } = req.body;

    if (!warehouse_id || !product_id || physical_qty === undefined) {
      return res.status(400).json({ success: false, error: 'Warehouse ID, Product ID, and Physical Quantity are required.' });
    }

    // 1. Get current stock
    const { data: currentStock } = await supabase
      .from('stock_levels')
      .select('quantity')
      .eq('product_id', product_id)
      .eq('warehouse_id', warehouse_id)
      .single();

    const recorded_qty = currentStock ? currentStock.quantity : 0;

    // 2. Insert pending adjustment record
    const { data: adjustment, error: adjustmentError } = await supabase
      .from('adjustments')
      .insert([{ 
        warehouse_id, 
        product_id, 
        recorded_qty, 
        physical_qty, 
        reason,
        status: 'pending_approval',
        submitted_by: req.user.id 
      }])
      .select()
      .single();

    if (adjustmentError) throw adjustmentError;

    res.status(201).json({ success: true, data: adjustment });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve an adjustment
// @route   POST /api/v1/adjustments/:id/approve
// @access  Private (Manager only)
exports.approveAdjustment = async (req, res, next) => {
  try {
    const { data: adj, error: fetchErr } = await supabase
      .from('adjustments')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !adj) return res.status(404).json({ success: false, error: 'Adjustment not found' });
    if (adj.status !== 'pending_approval') return res.status(400).json({ success: false, error: 'Adjustment is not pending' });

    // 1. Upsert stock level
    const { data: currentStock } = await supabase
      .from('stock_levels')
      .select('id')
      .eq('product_id', adj.product_id)
      .eq('warehouse_id', adj.warehouse_id)
      .single();

    if (currentStock) {
      await supabase.from('stock_levels').update({ quantity: adj.physical_qty, updated_at: new Date() }).eq('id', currentStock.id);
    } else {
      await supabase.from('stock_levels').insert([{ product_id: adj.product_id, warehouse_id: adj.warehouse_id, quantity: adj.physical_qty }]);
    }

    // 2. Update adjustment status
    const { data: updatedAdj, error: updErr } = await supabase
      .from('adjustments')
      .update({ status: 'approved', reviewed_by: req.user.id, reviewed_at: new Date() })
      .eq('id', adj.id)
      .select()
      .single();

    if (updErr) throw updErr;

    // 3. Log to MongoDB
    await AuditLog.create({
      actionType: 'STOCK_ADJUSTMENT_APPROVED',
      performedBy: {
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
      details: {
        adjustmentId: adj.id,
        warehouseId: adj.warehouse_id,
        productId: adj.product_id,
        delta: adj.physical_qty - adj.recorded_qty
      }
    });

    res.status(200).json({ success: true, data: updatedAdj });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject an adjustment
// @route   POST /api/v1/adjustments/:id/reject
// @access  Private (Manager only)
exports.rejectAdjustment = async (req, res, next) => {
  try {
    const { data: adj, error: fetchErr } = await supabase
      .from('adjustments')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !adj) return res.status(404).json({ success: false, error: 'Adjustment not found' });
    if (adj.status !== 'pending_approval') return res.status(400).json({ success: false, error: 'Adjustment is not pending' });

    const { data: updatedAdj, error: updErr } = await supabase
      .from('adjustments')
      .update({ status: 'rejected', reviewed_by: req.user.id, reviewed_at: new Date() })
      .eq('id', adj.id)
      .select()
      .single();

    if (updErr) throw updErr;

    res.status(200).json({ success: true, data: updatedAdj });
  } catch (error) {
    next(error);
  }
};
