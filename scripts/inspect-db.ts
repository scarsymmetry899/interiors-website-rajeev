import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function inspect() {
  console.log('--- DB INSPECTION START ---');
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ Missing credentials in .env.local');
    console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!SUPABASE_URL);
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!SUPABASE_SERVICE_ROLE_KEY);
    return;
  }

  // We are using service role just for inspection purposes
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    // Check if leads table exists
    const { data: leads, error: leadsErr } = await supabase.from('leads').select('id').limit(1);
    const { data: entries, error: entriesErr } = await supabase.from('portfolio_entries').select('id').limit(1);

    console.log('Tables check:');
    if (leadsErr && leadsErr.code === '42P01') {
      console.log('  - "leads" table does NOT exist.');
    } else if (!leadsErr) {
      console.log('  - "leads" table exists.');
    }

    if (entriesErr && entriesErr.code === '42P01') {
      console.log('  - "portfolio_entries" table does NOT exist.');
    } else if (!entriesErr) {
      console.log('  - "portfolio_entries" table exists.');
    }
    
    console.log('\n--- DB INSPECTION COMPLETE ---');
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

inspect();
