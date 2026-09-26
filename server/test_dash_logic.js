require('dotenv').config();
const { supabaseAdmin: supabase } = require('./config/supabase');

async function test() {
    const { count: totalProducts, error: pErr } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    console.log("totalProducts", totalProducts, pErr);

    const { data: stockData, error: sErr } = await supabase
      .from('stock_levels')
      .select('quantity, products(name, sku, reorder_threshold), warehouses(name)');
    console.log("stockData len:", stockData?.length, sErr);

    let lowStockCount = 0;
    let outOfStockCount = 0;
    if (stockData) {
      stockData.forEach(s => {
        if (s.quantity === 0) outOfStockCount++;
        else if (s.products && s.quantity <= s.products.reorder_threshold) lowStockCount++;
      });
    }

    const { count: pendingReceipts } = await supabase
      .from('receipts')
      .select('*', { count: 'exact', head: true })
      .in('status', ['draft', 'waiting', 'ready']);

    const { count: pendingDeliveries } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })
      .in('status', ['draft', 'waiting', 'ready']);
      
    console.log({
        total_products: totalProducts || 0,
        low_stock_items: lowStockCount || 0,
        out_of_stock_items: outOfStockCount || 0,
        pending_receipts: pendingReceipts || 0,
        pending_deliveries: pendingDeliveries || 0
    });
}
test();
