import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function run() {
  const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const { data: buckets, error } = await adminClient.storage.listBuckets();
  if (error) console.error(error);
  
  if (!buckets || buckets.length === 0) {
    console.log('No buckets found.');
  }
  
  buckets?.forEach(b => console.log(`Bucket: ${b.name} | Public: ${b.public}`));
}
run();
