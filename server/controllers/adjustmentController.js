const supabase = require('../config/supabase');
const AuditLog = require('../models/AuditLog');

// @desc    Process a manual stock adjustment
// @route   POST /api/v1/adjustments
// @access  Private (Manager only)
exports.createAdjustment = async (req, res, next) => {
  try {
    const { warehouse_id, product_id, new_quantity, reason } = req.body;

    if (!warehouse_id || !product_id || new_quantity === undefined || !reason) {
      return res.status(400).json({ success: false, error: 'Warehouse ID, Product ID, New Quantity, and Reason are required.' });
    }

    // 1. Get current stock
    const { data: currentStock } = await supabase
      .from('stock_levels')
      .select('*')
      .eq('product_id', product_id)
      .eq('warehouse_id', warehouse_id)
      .single();

    const old_quantity = currentStock ? currentStock.quantity : 0;
    const difference = new_quantity - old_quantity;

    // 2. Insert adjustment record
    const { data: adjustment, error: adjustmentError } = await supabase
      .from('adjustments')
      .insert([{ 
        warehouse_id, 
        product_id, 
        old_quantity, 
        new_quantity, 
        reason,
        created_by: req.user.id 
      }])
      .select()
      .single();

    if (adjustmentError) throw adjustmentError;

    // 3. Upsert stock level
    if (currentStock) {
      await supabase
        .from('stock_levels')
        .update({ quantity: new_quantity })
        .eq('id', currentStock.id);
    } else {
      await supabase
        .from('stock_levels')
        .insert([{ product_id, warehouse_id, quantity: new_quantity }]);
    }

    // 4. Log to MongoDB
    await AuditLog.create({
      actionType: 'STOCK_ADJUSTMENT',
      performedBy: {
        userId: req.user.id,
        email:  req.user.email,
        role:   req.user.role,
      },
      details: {
        adjustmentId: adjustment.id,
        warehouseId: warehouse_id,
        productId: product_id,
        difference,
        reason
      }
    });

    res.status(201).json({ success: true, data: adjustment });
  } catch (error) {
    next(error);
  }
};
