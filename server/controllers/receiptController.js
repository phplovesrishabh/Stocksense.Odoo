const supabase = require('../config/supabase');
const AuditLog = require('../models/AuditLog');

// @desc    Get all receipts
// @route   GET /api/v1/receipts
// @access  Private
exports.getReceipts = async (req, res, next) => {
  try {
    const { status, warehouse_id } = req.query;
    
    let query = supabase.from('receipts').select(`
      *,
      warehouse:warehouses(name),
      created_by_user:user_profiles!receipts_created_by_fkey(full_name),
      receipt_items(count)
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

// @desc    Get single receipt
// @route   GET /api/v1/receipts/:id
// @access  Private
exports.getReceiptById = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('receipts')
      .select(`
        *,
        warehouse:warehouses(name),
        created_by_user:user_profiles!receipts_created_by_fkey(full_name),
        receipt_items(
          *,
          product:products(name, sku, unit_of_measure)
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Receipt not found' });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a receipt
// @route   POST /api/v1/receipts
// @access  Private
exports.createReceipt = async (req, res, next) => {
  try {
    const { warehouse_id, supplier_name, items } = req.body;

    if (!warehouse_id || !supplier_name || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Warehouse ID, Supplier, and items are required.' });
    }

    // 1. Insert the receipt record
    const { data: receipt, error: receiptError } = await supabase
      .from('receipts')
      .insert([{ warehouse_id, supplier_name, status: 'draft', created_by: req.user.id }])
      .select()
      .single();

    if (receiptError) throw receiptError;

    // 2. Insert receipt items
    const itemsToInsert = items.map(item => ({
      receipt_id: receipt.id,
      product_id: item.product_id,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase.from('receipt_items').insert(itemsToInsert);
    if (itemsError) throw itemsError;

    res.status(201).json({ success: true, data: receipt });
  } catch (error) {
    next(error);
  }
};

// @desc    Update receipt status
// @route   PUT /api/v1/receipts/:id/status
// @access  Private
exports.updateReceiptStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['draft', 'waiting', 'ready', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status update.' });
    }

    const { data, error } = await supabase
      .from('receipts')
      .update({ status })
      .eq('id', req.params.id)
      .neq('status', 'done') // cannot revert if done
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate a receipt (process stock)
// @route   POST /api/v1/receipts/:id/validate
// @access  Private
exports.validateReceipt = async (req, res, next) => {
  try {
    // 1. Get receipt and check status
    const { data: receipt, error: receiptError } = await supabase
      .from('receipts')
      .select('*, receipt_items(*, product:products(name, sku))')
      .eq('id', req.params.id)
      .single();

    if (receiptError) throw receiptError;
    if (!receipt) return res.status(404).json({ success: false, error: 'Receipt not found' });
    if (receipt.status !== 'ready') return res.status(400).json({ success: false, error: 'Receipt must be in ready status to validate.' });

    // 2. Process stock changes using RPC if possible. We will use the increment_stock RPC.
    for (let item of receipt.receipt_items) {
      const { error: stockError } = await supabase.rpc('increment_stock', {
        p_product_id: item.product_id,
        p_warehouse_id: receipt.warehouse_id,
        p_qty: item.quantity
      });
      if (stockError) throw stockError;
    }

    // 3. Update receipt status to done
    const { data: updatedReceipt, error: updateError } = await supabase
      .from('receipts')
      .update({ status: 'done', validated_at: new Date(), validated_by: req.user.id })
      .eq('id', receipt.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 4. Log to MongoDB Ledger
    const ledgerEntries = receipt.receipt_items.map(item => ({
      actionType: 'STOCK_RECEIPT',
      performedBy: {
        userId: req.user.id,
        email:  req.user.email || 'unknown',
        role:   req.user.role,
      },
      details: {
        receiptId: receipt.id,
        warehouseId: receipt.warehouse_id,
        supplierName: receipt.supplier_name,
        productId: item.product_id,
        productSku: item.product.sku,
        productName: item.product.name,
        quantityDelta: item.quantity
      }
    }));
    await AuditLog.insertMany(ledgerEntries);

    res.status(200).json({ success: true, data: updatedReceipt });
  } catch (error) {
    next(error);
  }
};
