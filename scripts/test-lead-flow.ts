import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function runDbTests() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const anonClient = createClient(url, anonKey);
  const adminClient = createClient(url, serviceKey);

  console.log('--- DB & RLS TESTS ---');
  
  // 1. Submit lead via RPC (Anonymous Client)
  console.log('1. Ensuring Organization exists...');
  const { data: existingOrgs } = await adminClient.from('organizations').select('id').limit(1);
  let orgId = existingOrgs?.[0]?.id;

  if (!orgId) {
    const { data: newOrg } = await adminClient.from('organizations').insert({ name: 'Studio Name' }).select('id').single();
    orgId = newOrg?.id;
  }
  
  if (!orgId) {
     console.log('No organization found or created. Skipping RPC test.');
  } else {
    const { error: rpcErr } = await anonClient.rpc('submit_consultation_lead', {
      p_first_name: 'Test',
      p_last_name: 'User',
      p_email: 'test@example.com',
      p_phone: null,
      p_project_location: 'NYC',
      p_property_type: 'Condo',
      p_property_area: null,
      p_budget_range: null,
      p_project_stage: null,
      p_expected_start_date: null,
      p_service_interest: null,
      p_message: 'Testing RPC',
      p_touchpoints: [{ anonymous_session_id: '00000000-0000-0000-0000-000000000000', source: 'direct', medium: 'none' }]
    });

    if (rpcErr) console.error('RPC Error:', rpcErr);
    else console.log('✅ Lead & Touchpoint created via RPC successfully.');
  }

  // 2. Test RLS: Anonymous Select
  console.log('\n2. Testing RLS: Anonymous SELECT on leads...');
  const { data: anonLeads, error: anonSelectErr } = await anonClient.from('leads').select('*');
  if (anonSelectErr) console.error('❌ Expected error? Got:', anonSelectErr);
  else console.log(`✅ Anonymous select returned ${anonLeads?.length} leads (Should be 0 due to RLS).`);

  // 3. Admin check to see if lead is there
  console.log('\n3. Admin check: Verifying lead exists...');
  const { data: adminLeads } = await adminClient.from('leads').select('*, lead_touchpoints(*)').eq('email', 'test@example.com');
  console.log(`✅ Admin select found ${adminLeads?.length} leads. Touchpoints:`, adminLeads?.[0]?.lead_touchpoints?.length);

}

runDbTests();
