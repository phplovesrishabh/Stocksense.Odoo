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

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function startTraffic() {
  console.log('Fetching base data...');
  const productsRes = await request('GET', '/products');
  const warehousesRes = await request('GET', '/warehouses');
  
  const products = productsRes.data;
  const warehouses = warehousesRes.data;

  if (products.length === 0 || warehouses.length === 0) {
    console.error('No products or warehouses. Exiting.');
    return;
  }

  const warehouse = warehouses[0];

  console.log('🚀 Starting Live Traffic Simulation...');
  console.log('Keep your Dashboard open to watch it update automatically!');

  setInterval(async () => {
    try {
      const action = randomInt(1, 3);
      const product = products[randomInt(0, products.length - 1)];
      const qty = randomInt(1, 20);

      if (action === 1) {
        // Create and validate a receipt
        const rec = await request('POST', '/receipts', {
          warehouse_id: warehouse.id,
          supplier_name: `Automated Supplier ${randomInt(1,100)}`,
          expected_date: new Date().toISOString(),
          notes: 'Auto generated receipt',
          items: [{ product_id: product.id, quantity: qty }]
        });
        await request('PUT', `/receipts/${rec.data.id}/status`, { status: 'ready' });
        await request('POST', `/receipts/${rec.data.id}/validate`);
        console.log(`[+] Received ${qty}x ${product.name}`);
      } 
      else if (action === 2) {
        // Create and validate a delivery (ensure stock first, or it might fail, which is fine)
        const del = await request('POST', '/deliveries', {
          warehouse_id: warehouse.id,
          customer_ref: `CUST-AUTO-${randomInt(1000,9999)}`,
          scheduled_date: new Date().toISOString(),
          notes: 'Auto generated delivery',
          items: [{ product_id: product.id, quantity: 1 }] // just 1 to avoid stockout errors
        });
        await request('PUT', `/deliveries/${del.data.id}/status`, { status: 'ready' });
        try {
          await request('POST', `/deliveries/${del.data.id}/validate`);
          console.log(`[-] Delivered 1x ${product.name}`);
        } catch (e) {
          // might be out of stock, ignore
        }
      }
      else {
        // Create an adjustment
        const adj = await request('POST', '/adjustments', {
          product_id: product.id,
          warehouse_id: warehouse.id,
          physical_qty: randomInt(0, 100),
          reason: 'Automated cycle count'
        });
        await request('POST', `/adjustments/${adj.data.id}/approve`);
        console.log(`[~] Adjusted ${product.name} stock`);
      }
    } catch (err) {
      console.error('Traffic Error:', err.message);
    }
  }, 5000); // Every 5 seconds
}

startTraffic();
