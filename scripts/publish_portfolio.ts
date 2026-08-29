import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

export async function publishPortfolio(slug: string) {
  console.log(`\n--- PUBLISHING PORTFOLIO: ${slug} ---`);
  
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase Admin credentials');
    return;
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1. Fetch Portfolio Entry
  const { data: entry, error: entryErr } = await supabase.from('portfolio_entries')
    .select('id, status, project_id')
    .eq('slug', slug).single();

  if (entryErr || !entry) {
    console.error('❌ Portfolio entry not found.');
    return;
  }
  if (entry.status === 'published') {
    console.log('⚠️ Portfolio is already published.');
    return;
  }

  console.log('1. Validated portfolio status (Draft/Review).');

  // 2. Identify candidate assets (those linked via portfolio_entry_assets, hero_asset_id, etc.)
  // For Phase 1 script, we'll fetch all private assets associated with the project and promote the ones 
  // currently linked to this portfolio entry.
  
  const { data: linkedAssets, error: linkErr } = await supabase.from('portfolio_entry_assets')
    .select('asset_id')
    .eq('portfolio_entry_id', entry.id);

  const assetIdsToPromote = new Set<string>();
  linkedAssets?.forEach(a => assetIdsToPromote.add(a.asset_id));

  // Add before/after assets from project pairs
  const { data: pairs } = await supabase.from('project_asset_pairs').select('before_asset_id, after_asset_id').eq('project_id', entry.project_id);
  pairs?.forEach(p => {
    assetIdsToPromote.add(p.before_asset_id);
    assetIdsToPromote.add(p.after_asset_id);
  });

  if (assetIdsToPromote.size > 0) {
    console.log(`2. Identified ${assetIdsToPromote.size} approved portfolio candidate assets.`);
    
    // Fetch the actual project_assets records
    const { data: assets } = await supabase.from('project_assets').select('*').in('id', Array.from(assetIdsToPromote));
    
    for (const asset of (assets || [])) {
      if (asset.bucket_id === 'studio-internal') {
        console.log(`   -> Promoting asset: ${asset.file_path}`);
        
        // 3. Promote to portfolio-public Storage
        // Supabase storage JS client doesn't support cross-bucket copy, so we download & upload
        const { data: fileData, error: dlErr } = await supabase.storage.from('studio-internal').download(asset.file_path);
        if (dlErr || !fileData) {
          console.error(`      ❌ Failed to download from internal storage:`, dlErr);
          continue;
        }

        const { error: ulErr } = await supabase.storage.from('portfolio-public').upload(asset.file_path, fileData, {
          contentType: asset.mime_type,
          upsert: true
        });

        if (ulErr) {
          console.error(`      ❌ Failed to upload to public storage:`, ulErr);
          continue;
        }

        // 4. Update asset relationship in DB
        await supabase.from('project_assets').update({
          bucket_id: 'portfolio-public',
          visibility: 'public'
        }).eq('id', asset.id);
      }
    }
  }

  // 5. Change portfolio status
  await supabase.from('portfolio_entries').update({ status: 'published' }).eq('id', entry.id);
  
  console.log(`\n✅ Successfully published portfolio entry: ${slug}`);
}

// CLI Execution Support
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error('Usage: npx tsx scripts/publish_portfolio.ts <portfolio-slug>');
    process.exit(1);
  }
  publishPortfolio(args[0]);
}
