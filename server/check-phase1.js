require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkPhase1() {
  console.log('--- 🔍 Checking Phase 1 (Database Schema) ---');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const tablesToCheck = ['user_profiles', 'warehouses', 'products', 'stock_levels', 'receipts', 'receipt_items', 'deliveries', 'delivery_items', 'adjustments'];
  let allGood = true;

  for (const table of tablesToCheck) {
    const { error } = await supabase.from(table).select('id').limit(1);
    
    // PGRST116: the result contains 0 rows (table exists, just empty)
    // 42P01: relation does not exist
    if (error && error.code === '42P01') {
      console.log(`❌ Table missing: ${table}`);
      allGood = false;
    } else if (error && error.code !== 'PGRST116') {
      // It might complain about 'id' missing on linking tables
      if (error.message.includes("Could not find the 'id' column")) {
         console.log(`✅ Table exists: ${table} (No 'id' column, which is expected for junction tables)`);
      } else {
         console.log(`⚠️  Warning on ${table}: ${error.message}`);
      }
    } else {
      console.log(`✅ Table exists: ${table}`);
    }
  }

  console.log('-------------------------------------------');
  if (allGood) {
    console.log('🎉 Phase 1 is complete! All tables exist in Supabase.');
  } else {
    console.log('⚠️  Phase 1 is NOT complete. Please run the SQL schema in Supabase.');
  }
}

checkPhase1();
