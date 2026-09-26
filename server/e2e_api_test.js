require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for testing to bypass email confirm if needed, or anon key. Wait, anon key is standard for login.
const SUPABASE_ANON_KEY = process.env.SUPABASE_URL ? process.env.SUPABASE_SERVICE_ROLE_KEY : ''; // Just fallback

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BASE_URL = 'http://localhost:3001/api/v1';

async function fetchJSON(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function run() {
  try {
    console.log('--- STARTING E2E API TESTS ---');

    // 1. Auth via Supabase
    console.log('1. Testing Auth...');
    
    // First try to sign in
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'manager@demo.com',
      password: 'Password123!'
    });

    if (authError || !authData.session) {
      console.log('Login failed, attempting to create user via admin api...');
      // Use admin API to create auto-confirmed user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'manager@demo.com',
        password: 'Password123!',
        email_confirm: true,
        user_metadata: { full_name: 'Manager User' }
      });
      
      if (createError && !createError.message.includes('already exists')) {
        console.error('Failed to create user:', createError);
        return;
      }
      
      // Try login again
      const retryAuth = await supabase.auth.signInWithPassword({
        email: 'manager@demo.com',
        password: 'Password123!'
      });
      authData = retryAuth.data;
      authError = retryAuth.error;
    }
    
    if (authError || !authData.session) {
      console.error('Could not authenticate:', authError);
      return;
    }

    const token = authData.session.access_token;
    console.log('✅ Auth successful. Token acquired.');
    
    const headers = { 'Authorization': `Bearer ${token}` };

    // 1b. Assign Manager Role via our API is tricky if we aren't already a manager, but let's assume triggers handled it or we can just proceed.
    // Wait, the trigger defaults to 'staff'. Let's set it to manager directly in DB.
    await supabase.from('user_profiles').update({ role: 'manager' }).eq('id', authData.user.id);
    console.log('✅ User role set to manager.');

    // 2. Create Warehouse
    console.log('2. Creating Warehouse...');
    const whRes = await fetchJSON('/warehouses', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'E2E Warehouse', location: 'Test Location' })
    });
    
    if (whRes.status !== 201 && whRes.status !== 200) {
      console.error('Failed to create warehouse', whRes.data);
      return;
    }
    const warehouse = whRes.data.data?.[0] || whRes.data.data;
    const warehouseId = warehouse?.id;
    console.log('✅ Warehouse created:', warehouseId);

    // 3. Create Product
    console.log('3. Creating Product...');
    const prodRes = await fetchJSON('/products', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sku: 'E2E-' + Date.now(),
        name: 'E2E Test Product',
        category: 'Test',
        uom: 'Units',
        initial_stock: 0,
        min_threshold: 10,
        warehouse_id: warehouseId
      })
    });
    if (prodRes.status !== 201 && prodRes.status !== 200) {
      console.error('Failed to create product', prodRes.data);
      return;
    }
    const product = prodRes.data.data;
    const productId = product?.id;
    console.log('✅ Product created:', productId);

    // 4. Create Receipt
    console.log('4. Creating Receipt...');
    const recRes = await fetchJSON('/receipts', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        supplier_name: 'E2E Vendor',
        warehouse_id: warehouseId,
        items: [{ product_id: productId, quantity: 50 }]
      })
    });
    if (recRes.status !== 201 && recRes.status !== 200) {
      console.error('Failed to create receipt', recRes.data);
      return;
    }
    const receipt = recRes.data.data?.[0] || recRes.data.data;
    const receiptId = receipt?.id;
    console.log('✅ Receipt created:', receiptId);

    // 5. Progress Receipt Status
    console.log('5. Progressing Receipt...');
    await fetchJSON(`/receipts/${receiptId}/status`, { method: 'PUT', headers, body: JSON.stringify({ status: 'waiting' }) });
    await fetchJSON(`/receipts/${receiptId}/status`, { method: 'PUT', headers, body: JSON.stringify({ status: 'ready' }) });
    const doneRes = await fetchJSON(`/receipts/${receiptId}/validate`, { method: 'POST', headers });
    if (doneRes.status !== 200) {
      console.error('Failed to validate receipt:', doneRes.data);
      return;
    }
    console.log('✅ Receipt validated (Done)');

    // 6. Verify Stock
    console.log('6. Verifying Product Stock...');
    const checkProd = await fetchJSON(`/products`, { headers });
    const productDetails = checkProd.data.data.find(p => p.id === productId);
    const newStock = productDetails?.stock_levels?.find(s => s.warehouse_id === warehouseId)?.quantity || 0;
    
    if (newStock === 50) {
      console.log('✅ Stock verification passed: Quantity is 50');
    } else {
      console.error(`❌ Stock verification failed: Expected 50, got ${newStock}`);
    }

    // 7. Verify Ledger
    console.log('7. Verifying Ledger...');
    const ledgerRes = await fetchJSON('/ledger', { headers });
    const logs = ledgerRes.data.data || [];
    const hasLog = logs.some(l => l.actionType === 'STOCK_RECEIPT' && l.details?.receiptId === receiptId);
    if (hasLog) {
      console.log('✅ Ledger verification passed: Record found');
    } else {
      console.error('❌ Ledger verification failed: Record not found');
    }

    console.log('--- E2E API TESTS COMPLETE ---');

  } catch (err) {
    console.error('Test execution error:', err);
  }
}

run();
