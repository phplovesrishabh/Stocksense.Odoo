const supabase = require('../config/supabase');
const AuditLog = require('../models/AuditLog');

// @desc    Process a stock delivery (decrease stock)
// @route   POST /api/v1/deliveries
// @access  Private (All)
exports.createDelivery = async (req, res, next) => {
  try {
    const { warehouse_id, customer, items } = req.body;

    if (!warehouse_id || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Warehouse ID and items are required.' });
    }

    // 1. Check stock availability first (prevent negative stock)
    for (let item of items) {
      const { data: stock } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('product_id', item.product_id)
        .eq('warehouse_id', warehouse_id)
        .single();

      if (!stock || stock.quantity < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          error: `Insufficient stock for product ID: ${item.product_id}` 
        });
      }
    }

    // 2. Insert the delivery record
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .insert([{ warehouse_id, customer, status: 'completed', created_by: req.user.id }])
      .select()
      .single();

    if (deliveryError) throw deliveryError;

    // 3. Insert delivery items and update stock levels
    for (let item of items) {
      await supabase.from('delivery_items').insert([{
        delivery_id: delivery.id,
        product_id: item.product_id,
        quantity: item.quantity,
        sale_price: item.sale_price
      }]);

      const { data: existingStock } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('product_id', item.product_id)
        .eq('warehouse_id', warehouse_id)
        .single();

      await supabase
        .from('stock_levels')
        .update({ quantity: existingStock.quantity - item.quantity })
        .eq('id', existingStock.id);
    }

    // 4. Log to MongoDB
    await AuditLog.create({
      actionType: 'STOCK_DELIVERY',
      performedBy: {
        userId: req.user.id,
        email:  req.user.email,
        role:   req.user.role,
      },
      details: {
        deliveryId: delivery.id,
        warehouseId: warehouse_id,
        customer: customer,
        itemsCount: items.length
      }
    });

    res.status(201).json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};
