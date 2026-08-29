import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

export async function createBuckets() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing credentials');
    return;
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  console.log('Creating studio-internal (Private)...');
  const { data: b1, error: e1 } = await supabase.storage.createBucket('studio-internal', {
    public: false,
    fileSizeLimit: 52428800, // 50MB
  });
  if (e1) console.error('Error:', e1.message);
  else console.log('✅ Created studio-internal');

  console.log('Creating portfolio-public (Public)...');
  const { data: b2, error: e2 } = await supabase.storage.createBucket('portfolio-public', {
    public: true,
    fileSizeLimit: 52428800,
  });
  if (e2) console.error('Error:', e2.message);
  else console.log('✅ Created portfolio-public');
}

createBuckets();
