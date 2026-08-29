import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

export async function revokeConsent(slug: string) {
  console.log(`\n--- REVOKING PUBLICATION CONSENT: ${slug} ---`);
  
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase Admin credentials');
    return;
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1. Fetch Portfolio Entry
  const { data: entry, error: entryErr } = await supabase.from('portfolio_entries')
    .select('id, project_id, organization_id')
    .eq('slug', slug).single();

  if (entryErr || !entry) {
    console.error('❌ Portfolio entry not found.');
    return;
  }

  // 2. Set Portfolio Status to Draft
  await supabase.from('portfolio_entries').update({ status: 'draft' }).eq('id', entry.id);

  // 3. Delete Public Derivatives
  const { data: publicDerivatives } = await supabase.from('project_assets')
    .select('id, file_path')
    .eq('project_id', entry.project_id)
    .eq('bucket_id', 'portfolio-public')
    .eq('visibility', 'public');

  if (publicDerivatives && publicDerivatives.length > 0) {
    const filePaths = publicDerivatives.map(d => d.file_path);
    const ids = publicDerivatives.map(d => d.id);

    // Physically delete from Storage
    const { error: storageErr } = await supabase.storage.from('portfolio-public').remove(filePaths);
    if (storageErr) console.error('⚠️ Failed to physically delete some public assets from storage:', storageErr);
    
    // Delete database records
    await supabase.from('project_assets').delete().in('id', ids);
    console.log(`✅ Deleted ${ids.length} public derivatives from Storage and Database.`);
  }

  // 4. Update Consent Record to Revoked (Audit Trail)
  await supabase.from('consents').insert({
    organization_id: entry.organization_id,
    project_id: entry.project_id,
    subject_type: 'client',
    consent_type: 'portfolio_publication',
    status: 'revoked',
    revoked_at: new Date().toISOString(),
    notes: 'Consent revoked via CLI. Public derivatives deleted.'
  });
  
  console.log(`✅ Consent effectively revoked.`);
  console.log(`   Portfolio is offline, public derivatives are destroyed, original internal masters are intact.`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error('Usage: npx tsx scripts/revoke_consent.ts <portfolio-slug>');
    process.exit(1);
  }
  revokeConsent(args[0]);
}
