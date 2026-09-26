const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './server/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function setupBucket() {
  console.log('Checking for avatars bucket...');
  const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
  if (bucketsErr) throw bucketsErr;

  const hasAvatars = buckets.some(b => b.name === 'avatars');
  if (!hasAvatars) {
    console.log('Creating avatars bucket...');
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });
    if (error) throw error;
    console.log('Bucket created successfully.');
  } else {
    console.log('avatars bucket already exists.');
  }
}

setupBucket().catch(console.error);
