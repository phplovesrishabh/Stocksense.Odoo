require('dotenv').config();
const { supabaseAdmin: supabase } = require('./config/supabase');
const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');

async function seedData() {
  try {
    console.log('🌱 Starting Seed Process...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Create Users
    console.log('Creating Users...');
    const users = [
      { email: 'manager@demo.com', password: 'Password@1234', role: 'manager', full_name: 'Jane Manager' },
      { email: 'staff@demo.com', password: 'Password@1234', role: 'staff', full_name: 'Bob Staff' }
    ];

    const createdUsers = {};
    for (const u of users) {
      // Create auth user
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { role: u.role, full_name: u.full_name }
      });

      if (authErr && !authErr.message.includes('already registered')) {
        console.error(`Failed to create ${u.email}:`, authErr);
      } else if (authData?.user) {
        createdUsers[u.role] = authData.user;
      } else {
        const { data: profile } = await supabase.from('user_profiles').select('id, role').eq('role', u.role).limit(1).single();
        if (profile) createdUsers[u.role] = { id: profile.id, ...profile };
      }
    }
    
    // Ensure we have users
    if (!createdUsers.manager || !createdUsers.staff) {
      const { data: profiles } = await supabase.from('user_profiles').select('*');
      const manager = profiles.find(p => p.role === 'manager');
      const staff = profiles.find(p => p.role === 'staff');
      if (manager) createdUsers.manager = manager;
      if (staff) createdUsers.staff = staff;
    }

    const managerId = createdUsers.manager?.id;
    const staffId = createdUsers.staff?.id;
    
    if (!managerId || !staffId) {
      throw new Error('Could not resolve manager and staff users');
    }
    console.log('✅ Users prepared');

    // Clean existing data first
    console.log('Cleaning existing demo data...');
    await supabase.from('adjustments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('receipt_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('delivery_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('receipts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('deliveries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('stock_levels').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('warehouses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await AuditLog.deleteMany({});

    // 2. Create Warehouses
    console.log('Creating Warehouses...');
    const warehousesToCreate = [
      { name: 'WH-Main', location: 'Mumbai', created_by: managerId },
      { name: 'WH-East', location: 'Delhi', created_by: managerId }
    ];
    
    const { data: warehouses, error: whErr } = await supabase
      .from('warehouses')
      .insert(warehousesToCreate)
      .select();
    if (whErr) throw whErr;
    
    const whMain = warehouses.find(w => w.name === 'WH-Main');
    const whEast = warehouses.find(w => w.name === 'WH-East');
    console.log('✅ Warehouses created');

    // 3. Create Products
    console.log('Creating Products...');
    const productsToCreate = [
      { name: 'Widget A', sku: 'WGT-001', category: 'Electronics', unit_of_measure: 'pcs', reorder_threshold: 20, created_by: managerId },
      { name: 'Widget B', sku: 'WGT-002', category: 'Hardware', unit_of_measure: 'pcs', reorder_threshold: 30, created_by: managerId },
      { name: 'Widget C', sku: 'WGT-003', category: 'Hardware', unit_of_measure: 'pcs', reorder_threshold: 10, created_by: managerId },
      { name: 'Sensor Module X', sku: 'SEN-101', category: 'Sensors', unit_of_measure: 'pcs', reorder_threshold: 50, created_by: managerId },
      { name: 'Aluminum Bracket', sku: 'BKT-044', category: 'Mechanical', unit_of_measure: 'box', reorder_threshold: 15, created_by: managerId },
      { name: 'Copper Wire 2mm', sku: 'WIR-200', category: 'Electrical', unit_of_measure: 'meters', reorder_threshold: 500, created_by: managerId },
      { name: 'Steel Bearings', sku: 'BRG-090', category: 'Mechanical', unit_of_measure: 'pack', reorder_threshold: 100, created_by: managerId },
      { name: 'LCD Display 5inch', sku: 'DIS-050', category: 'Electronics', unit_of_measure: 'pcs', reorder_threshold: 25, created_by: managerId },
      { name: 'Power Supply 12V', sku: 'PWR-120', category: 'Electronics', unit_of_measure: 'pcs', reorder_threshold: 40, created_by: managerId },
      { name: 'Industrial Glue', sku: 'GLU-999', category: 'Consumables', unit_of_measure: 'liters', reorder_threshold: 5, created_by: managerId }
    ];

    const { data: products, error: pErr } = await supabase
      .from('products')
      .insert(productsToCreate)
      .select();
    if (pErr) throw pErr;
    console.log('✅ Products created');

    // 4. Create Stock Levels
    console.log('Initializing Stock Levels...');
    const stockToCreate = [
      { product_id: products[0].id, warehouse_id: whMain.id, quantity: 150 },
      { product_id: products[0].id, warehouse_id: whEast.id, quantity: 80 },
      { product_id: products[1].id, warehouse_id: whMain.id, quantity: 28 }, // Low
      { product_id: products[2].id, warehouse_id: whMain.id, quantity: 0 }, // Out
      { product_id: products[3].id, warehouse_id: whMain.id, quantity: 200 },
      { product_id: products[4].id, warehouse_id: whEast.id, quantity: 45 },
      { product_id: products[5].id, warehouse_id: whMain.id, quantity: 1200 },
      { product_id: products[6].id, warehouse_id: whEast.id, quantity: 300 },
      { product_id: products[7].id, warehouse_id: whMain.id, quantity: 100 },
      { product_id: products[8].id, warehouse_id: whMain.id, quantity: 85 }
    ];

    const { error: stockErr } = await supabase.from('stock_levels').insert(stockToCreate);
    if (stockErr) throw stockErr;
    console.log('✅ Stock initialized');

    // 5. Create Receipts
    console.log('Creating Receipts...');
    const receiptsData = [
      { warehouse_id: whMain.id, supplier_name: 'Alpha Electronics', status: 'done', created_by: managerId, validated_by: managerId, validated_at: new Date() },
      { warehouse_id: whEast.id, supplier_name: 'Beta Hardware', status: 'done', created_by: managerId, validated_by: managerId, validated_at: new Date() },
      { warehouse_id: whMain.id, supplier_name: 'Gamma Suppliers', status: 'ready', created_by: staffId },
      { warehouse_id: whEast.id, supplier_name: 'Delta Co', status: 'draft', created_by: staffId }
    ];
    
    for (const r of receiptsData) {
      const { data: receipt, error: rErr } = await supabase.from('receipts').insert([r]).select().single();
      if (rErr) throw rErr;
      await supabase.from('receipt_items').insert([
        { receipt_id: receipt.id, product_id: products[0].id, quantity: 50 },
        { receipt_id: receipt.id, product_id: products[1].id, quantity: 100 }
      ]);
      if (r.status === 'done') {
        await AuditLog.create({
          actionType: 'STOCK_RECEIPT',
          performedBy: { userId: managerId, email: 'manager@demo.com', role: 'manager' },
          details: { receiptId: receipt.id, warehouseId: receipt.warehouse_id, productName: products[0].name, quantityDelta: 50 }
        });
      }
    }
    console.log('✅ Receipts created');

    // 6. Create Deliveries
    console.log('Creating Deliveries...');
    const deliveriesData = [
      { warehouse_id: whMain.id, customer_ref: 'CUST-001', status: 'done', created_by: managerId, validated_by: managerId, validated_at: new Date() },
      { warehouse_id: whEast.id, customer_ref: 'CUST-002', status: 'done', created_by: managerId, validated_by: managerId, validated_at: new Date() },
      { warehouse_id: whMain.id, customer_ref: 'CUST-003', status: 'ready', created_by: staffId }
    ];

    for (const d of deliveriesData) {
      const { data: delivery, error: dErr } = await supabase.from('deliveries').insert([d]).select().single();
      if (dErr) throw dErr;
      await supabase.from('delivery_items').insert([
        { delivery_id: delivery.id, product_id: products[0].id, quantity: 10 },
        { delivery_id: delivery.id, product_id: products[3].id, quantity: 5 }
      ]);
      if (d.status === 'done') {
        await AuditLog.create({
          actionType: 'STOCK_DELIVERY',
          performedBy: { userId: managerId, email: 'manager@demo.com', role: 'manager' },
          details: { deliveryId: delivery.id, warehouseId: delivery.warehouse_id, productName: products[0].name, quantityDelta: -10 }
        });
      }
    }
    console.log('✅ Deliveries created');

    // 7. Create Adjustments
    console.log('Creating Adjustments...');
    const adjData = [
      { product_id: products[0].id, warehouse_id: whMain.id, recorded_qty: 150, physical_qty: 148, reason: 'Damaged item', status: 'pending_approval', submitted_by: staffId }
    ];
    
    const { error: adjErr } = await supabase.from('adjustments').insert(adjData);
    if (adjErr) throw adjErr;
    console.log('✅ Adjustments created');

    console.log('🎉 DB Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedData();
