const API_URL = 'http://localhost:3001/api/v1';

async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer SEED_TOKEN' },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error: ${res.status} ${text}`);
  }
  return res.json();
}

async function seed() {
  console.log('Fetching products and warehouses...');
  const productsRes = await request('GET', '/products');
  const warehousesRes = await request('GET', '/warehouses');
  
  const products = productsRes.data;
  const warehouses = warehousesRes.data;

  if (products.length === 0 || warehouses.length === 0) {
    console.error('No products or warehouses found. Cannot seed. Please run initial seed first.');
    return;
  }

  const warehouse = warehouses[0];
  
  const p1 = products[0];
  const p2 = products[1 % products.length];
  const p3 = products[2 % products.length];
  const p4 = products[3 % products.length] || p1;

  console.log('Creating Receipts...');
  const rec1 = await request('POST', '/receipts', {
    warehouse_id: warehouse.id,
    supplier_name: 'Tech Data Corp',
    expected_date: new Date().toISOString(),
    notes: 'Quarterly Restock',
    items: [
      { product_id: p1.id, quantity: 150 },
      { product_id: p2.id, quantity: 75 }
    ]
  });
  console.log('Receipt 1 created:', rec1.data.id);
  await request('PUT', `/receipts/${rec1.data.id}/status`, { status: 'ready' });
  await request('POST', `/receipts/${rec1.data.id}/validate`);
  console.log('Receipt 1 validated.');

  const rec2 = await request('POST', '/receipts', {
    warehouse_id: warehouse.id,
    supplier_name: 'Ingram Micro',
    expected_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    notes: 'Special Order',
    items: [
      { product_id: p3.id, quantity: 40 },
      { product_id: p4.id, quantity: 200 }
    ]
  });
  console.log('Receipt 2 created:', rec2.data.id);
  await request('PUT', `/receipts/${rec2.data.id}/status`, { status: 'waiting' });
  console.log('Receipt 2 marked as waiting.');

  const rec3 = await request('POST', '/receipts', {
    warehouse_id: warehouse.id,
    supplier_name: 'Samsung Electronics',
    expected_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    notes: 'Holiday stock',
    items: [
      { product_id: p1.id, quantity: 500 }
    ]
  });
  console.log('Receipt 3 created (draft):', rec3.data.id);


  console.log('\nCreating Deliveries...');
  const del1 = await request('POST', '/deliveries', {
    warehouse_id: warehouse.id,
    customer_ref: 'AMZ-FBA-9921',
    scheduled_date: new Date().toISOString(),
    notes: 'Amazon FBA restock',
    items: [
      { product_id: p1.id, quantity: 15 },
      { product_id: p2.id, quantity: 5 }
    ]
  });
  console.log('Delivery 1 created:', del1.data.id);
  await request('PUT', `/deliveries/${del1.data.id}/status`, { status: 'ready' });
  await request('POST', `/deliveries/${del1.data.id}/validate`);
  console.log('Delivery 1 validated.');

  const del2 = await request('POST', '/deliveries', {
    warehouse_id: warehouse.id,
    customer_ref: 'BESTBUY-RET-01',
    scheduled_date: new Date(Date.now() + 86400000).toISOString(),
    notes: 'BestBuy Retail Order',
    items: [
      { product_id: p1.id, quantity: 10 }
    ]
  });
  console.log('Delivery 2 created:', del2.data.id);
  await request('PUT', `/deliveries/${del2.data.id}/status`, { status: 'ready' });
  console.log('Delivery 2 marked as ready.');

  const del3 = await request('POST', '/deliveries', {
    warehouse_id: warehouse.id,
    customer_ref: 'WALMART-WHS',
    scheduled_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    notes: 'Walmart distribution',
    items: [
      { product_id: p2.id, quantity: 50 }
    ]
  });
  console.log('Delivery 3 created (draft):', del3.data.id);


  console.log('\nCreating Adjustments...');
  const adj1 = await request('POST', '/adjustments', {
    product_id: p1.id,
    warehouse_id: warehouse.id,
    physical_qty: 145,
    reason: 'Water damage in aisle 4'
  });
  console.log('Adjustment 1 created:', adj1.data.id);
  await request('POST', `/adjustments/${adj1.data.id}/approve`);
  console.log('Adjustment 1 approved.');

  const adj2 = await request('POST', '/adjustments', {
    product_id: p2.id,
    warehouse_id: warehouse.id,
    physical_qty: 82,
    reason: 'Found extra inventory during audit cycle count'
  });
  console.log('Adjustment 2 created (pending):', adj2.data.id);

  console.log('\n✅ Seeding completed successfully! Open your app to see the realtime updates.');
}

seed().catch(err => {
  console.error('Error during seeding:', err.message);
});
