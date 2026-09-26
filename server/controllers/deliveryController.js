const supabase = require('../config/supabase');
const AuditLog = require('../models/AuditLog');

// @desc    Get all deliveries
// @route   GET /api/v1/deliveries
// @access  Private
exports.getDeliveries = async (req, res, next) => {
  try {
    const { status, warehouse_id } = req.query;
    
    let query = supabase.from('deliveries').select(`
      *,
      warehouse:warehouses(name),
      created_by_user:user_profiles!deliveries_created_by_fkey(full_name),
      delivery_items(count)
    `).order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (warehouse_id) query = query.eq('warehouse_id', warehouse_id);

    const { data, error } = await query;
    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single delivery
// @route   GET /api/v1/deliveries/:id
// @access  Private
exports.getDeliveryById = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        warehouse:warehouses(name),
        created_by_user:user_profiles!deliveries_created_by_fkey(full_name),
        delivery_items(
          *,
          product:products(name, sku, unit_of_measure)
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Delivery not found' });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a delivery
// @route   POST /api/v1/deliveries
// @access  Private
exports.createDelivery = async (req, res, next) => {
  try {
    const { warehouse_id, customer_ref, items } = req.body;

    if (!warehouse_id || !customer_ref || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Warehouse ID, Customer Ref, and items are required.' });
    }

    // 1. Insert the delivery record
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .insert([{ warehouse_id, customer_ref, status: 'draft', created_by: req.user.id }])
      .select()
      .single();

    if (deliveryError) throw deliveryError;

    // 2. Insert delivery items
    const itemsToInsert = items.map(item => ({
      delivery_id: delivery.id,
      product_id: item.product_id,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase.from('delivery_items').insert(itemsToInsert);
    if (itemsError) throw itemsError;

    res.status(201).json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery status
// @route   PUT /api/v1/deliveries/:id/status
// @access  Private
exports.updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['draft', 'waiting', 'ready', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status update.' });
    }

    const { data, error } = await supabase
      .from('deliveries')
      .update({ status })
      .eq('id', req.params.id)
      .neq('status', 'done')
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate a delivery (process stock)
// @route   POST /api/v1/deliveries/:id/validate
// @access  Private
exports.validateDelivery = async (req, res, next) => {
  try {
    // 1. Get delivery and check status
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .select('*, delivery_items(*, product:products(name, sku))')
      .eq('id', req.params.id)
      .single();

    if (deliveryError) throw deliveryError;
    if (!delivery) return res.status(404).json({ success: false, error: 'Delivery not found' });
    if (delivery.status !== 'ready') return res.status(400).json({ success: false, error: 'Delivery must be in ready status to validate.' });

    // 2. Check stock availability for all items first
    for (let item of delivery.delivery_items) {
      const { data: stock } = await supabase
        .from('stock_levels')
        .select('quantity')
        .eq('product_id', item.product_id)
        .eq('warehouse_id', delivery.warehouse_id)
        .single();
        
      if (!stock || stock.quantity < item.quantity) {
        return res.status(422).json({ 
          success: false, 
          error: `Insufficient stock for product ID: ${item.product_id} (${item.product.name}). Available: ${stock ? stock.quantity : 0}, Required: ${item.quantity}` 
        });
      }
    }

    // 3. Process stock changes using RPC decrement_stock
    for (let item of delivery.delivery_items) {
      const { error: stockError } = await supabase.rpc('decrement_stock', {
        p_product_id: item.product_id,
        p_warehouse_id: delivery.warehouse_id,
        p_qty: item.quantity
      });
      if (stockError) throw stockError;
    }

    // 4. Update delivery status to done
    const { data: updatedDelivery, error: updateError } = await supabase
      .from('deliveries')
      .update({ status: 'done', validated_at: new Date(), validated_by: req.user.id })
      .eq('id', delivery.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 5. Log to MongoDB Ledger
    const ledgerEntries = delivery.delivery_items.map(item => ({
      actionType: 'STOCK_DELIVERY',
      performedBy: {
        userId: req.user.id,
        email:  req.user.email || 'unknown',
        role:   req.user.role,
      },
      details: {
        deliveryId: delivery.id,
        warehouseId: delivery.warehouse_id,
        customerRef: delivery.customer_ref,
        productId: item.product_id,
        productSku: item.product.sku,
        productName: item.product.name,
        quantityDelta: -item.quantity
      }
    }));
    await AuditLog.insertMany(ledgerEntries);

    res.status(200).json({ success: true, data: updatedDelivery });
  } catch (error) {
    next(error);
  }
};
