const { supabaseAdmin: supabase } = require('../config/supabase');
const AuditLog = require('../models/AuditLog');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Private (All)
exports.getProducts = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('products').select(`
      *,
      stock_levels (
        quantity,
        warehouse_id
      )
    `).order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ success: true, count: data?.length || 0, data: data || [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private (Manager only)
exports.createProduct = async (req, res, next) => {
  try {
    const { sku, name, category, uom, min_threshold } = req.body;

    if (!sku || !name) {
      return res.status(400).json({ success: false, error: 'SKU and Name are required.' });
    }

    // Insert into Postgres via Supabase
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert([{ sku, name, category, unit_of_measure: uom, reorder_threshold: min_threshold }])
      .select()
      .single();

    if (error) throw error;

    // Log to MongoDB
    await AuditLog.create({
      actionType: 'PRODUCT_CREATED',
      performedBy: {
        userId: req.user.id,
        email:  req.user.email,
        role:   req.user.role,
      },
      details: {
        productId: newProduct.id,
        sku: newProduct.sku,
        name: newProduct.name,
      }
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    next(error);
  }
};
