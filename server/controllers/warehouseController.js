const supabase = require('../config/supabase');
const AuditLog = require('../models/AuditLog');

// @desc    Get all warehouses
// @route   GET /api/v1/warehouses
// @access  Private (All)
exports.getWarehouses = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('warehouses').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new warehouse
// @route   POST /api/v1/warehouses
// @access  Private (Manager only)
exports.createWarehouse = async (req, res, next) => {
  try {
    const { name, location } = req.body;

    if (!name || !location) {
      return res.status(400).json({ success: false, error: 'Name and Location are required.' });
    }

    const { data: newWarehouse, error } = await supabase
      .from('warehouses')
      .insert([{ name, location }])
      .select()
      .single();

    if (error) throw error;

    // Log to MongoDB
    await AuditLog.create({
      actionType: 'WAREHOUSE_CREATED',
      performedBy: {
        userId: req.user.id,
        email:  req.user.email,
        role:   req.user.role,
      },
      details: {
        warehouseId: newWarehouse.id,
        name: newWarehouse.name,
      }
    });

    res.status(201).json({ success: true, data: newWarehouse });
  } catch (error) {
    next(error);
  }
};
