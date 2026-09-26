const supabase = require('../config/supabase');
const AuditLog = require('../models/AuditLog');

// @desc    Process a stock receipt (increase stock)
// @route   POST /api/v1/receipts
// @access  Private (All)
exports.createReceipt = async (req, res, next) => {
  try {
    const { warehouse_id, vendor, items } = req.body;
    // items is an array of { product_id, quantity, unit_cost }

    if (!warehouse_id || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Warehouse ID and items are required.' });
    }

    // 1. Insert the receipt record
    const { data: receipt, error: receiptError } = await supabase
      .from('receipts')
      .insert([{ warehouse_id, vendor, status: 'completed', created_by: req.user.id }])
      .select()
      .single();

    if (receiptError) throw receiptError;

    // 2. Insert receipt items and update stock_levels using Postgres RPC (Stored Procedure)
    // Note: Since we are using Supabase JS directly from a Node backend using the service_role key,
    // we should ideally use a stored procedure to make the update atomic.
    // However, since we haven't written the RPC yet, we will do it sequentially for now in dev phase.
    
    for (let item of items) {
      await supabase.from('receipt_items').insert([{
        receipt_id: receipt.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost
      }]);

      // Upsert stock_level (this requires proper locking or RPC in production)
      const { data: existingStock } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('product_id', item.product_id)
        .eq('warehouse_id', warehouse_id)
        .single();

      if (existingStock) {
        await supabase
          .from('stock_levels')
          .update({ quantity: existingStock.quantity + item.quantity })
          .eq('id', existingStock.id);
      } else {
        await supabase
          .from('stock_levels')
          .insert([{ product_id: item.product_id, warehouse_id, quantity: item.quantity }]);
      }
    }

    // 3. Log to MongoDB
    await AuditLog.create({
      actionType: 'STOCK_RECEIPT',
      performedBy: {
        userId: req.user.id,
        email:  req.user.email,
        role:   req.user.role,
      },
      details: {
        receiptId: receipt.id,
        warehouseId: warehouse_id,
        vendor: vendor,
        itemsCount: items.length
      }
    });

    res.status(201).json({ success: true, data: receipt });
  } catch (error) {
    next(error);
  }
};
