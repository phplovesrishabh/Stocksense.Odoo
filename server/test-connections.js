require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const mongoose = require('mongoose');

async function testConnections() {
  console.log('--- 🧪 Testing Connections ---');
  let hasErrors = false;

  // 1. Test Supabase
  console.log('\n🔵 Testing Supabase Connection...');
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    hasErrors = true;
  } else {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      // Just test if we can hit the server by querying the time or a basic health check
      // For Supabase, doing a basic query on an arbitrary table (even if it doesn't exist) is enough to check auth and URL.
      // But a cleaner way is just attempting to get auth session or a nonexistent table and expecting a specific error (not network error).
      const { data, error } = await supabase.from('_non_existent_table').select('*').limit(1);
      
      // If error is PGRST116 or similar (relation does not exist), the connection is fine!
      if (error && error.code !== 'PGRST205' && error.code !== '42P01') { 
        console.error('❌ Supabase connection failed:', error.message);
        hasErrors = true;
      } else {
        console.log('✅ Supabase connected successfully!');
      }
    } catch (err) {
      console.error('❌ Supabase connection threw an error:', err.message);
      hasErrors = true;
    }
  }

  // 2. Test MongoDB
  console.log('\n🟢 Testing MongoDB Connection...');
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ Missing MONGODB_URI in .env');
    hasErrors = true;
  } else {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ MongoDB connected successfully!');
      await mongoose.disconnect();
    } catch (err) {
      console.error('❌ MongoDB connection failed:', err.message);
      hasErrors = true;
    }
  }

  console.log('\n------------------------------');
  if (hasErrors) {
    console.log('⚠️  Some connections failed. Please check your credentials.');
    process.exit(1);
  } else {
    console.log('🎉 All databases connected perfectly!');
    process.exit(0);
  }
}

testConnections();
