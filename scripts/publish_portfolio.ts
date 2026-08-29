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

  // 1. Fetch Portfolio Entry & Project
  const { data: entry, error: entryErr } = await supabase.from('portfolio_entries')
    .select('id, status, project_id, projects!inner(publication_consent_status)')
    .eq('slug', slug).single();

  if (entryErr || !entry) {
    console.error('❌ Portfolio entry not found.');
    return;
  }
  
  if (entry.status === 'published') {
    console.log('⚠️ Portfolio is already published.');
    return;
  }

  // 2. Enforce Publication Consent
  const consent = (entry.projects as any)?.publication_consent_status;
  if (consent !== 'granted') {
    console.error(`❌ BLOCKED: Portfolio publication consent not recorded (Current status: ${consent || 'missing'})`);
    return;
  }

  console.log('1. Validated portfolio status and explicit publication consent.');

  // 3. Identify required assets for the public rendering
  const { data: linkedAssets } = await supabase.from('portfolio_entry_assets')
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
    console.log(`2. Identified ${assetIdsToPromote.size} required portfolio assets.`);
    
    // Fetch the actual master project_assets records
    const { data: assets } = await supabase.from('project_assets')
      .select('*')
      .in('id', Array.from(assetIdsToPromote));
    
    // Validate Publication Intent (No internal-only assets allowed)
    const unauthorizedAssets = (assets || []).filter(a => a.publication_intent !== 'portfolio_candidate');
    if (unauthorizedAssets.length > 0) {
      console.error(`❌ BLOCKED: Public sections reference internal-only assets.`);
      unauthorizedAssets.forEach(a => console.error(`   - Asset ID ${a.id} (${a.file_name}) is marked as ${a.publication_intent}`));
      console.error(`   You must either remove them from the public section or update their publication_intent to 'portfolio_candidate'.`);
      return;
    }

    console.log('3. All referenced assets are authorized for public promotion.');

    // 4. Create Public Derivatives
    for (const asset of (assets || [])) {
      if (asset.bucket_id === 'studio-internal') {
        console.log(`   -> Generating public derivative for: ${asset.file_path}`);
        
        // Download Master
        const { data: fileData, error: dlErr } = await supabase.storage.from('studio-internal').download(asset.file_path);
        if (dlErr || !fileData) {
          console.error(`      ❌ Failed to download master from internal storage:`, dlErr);
          return; // Fail safe
        }

        const derivativePath = `${slug}/public-derivatives/${asset.id}-${asset.file_name}`;

        // Upload Derivative
        const { error: ulErr } = await supabase.storage.from('portfolio-public').upload(derivativePath, fileData, {
          contentType: asset.mime_type,
          upsert: true
        });

        if (ulErr) {
          console.error(`      ❌ Failed to upload derivative to public storage:`, ulErr);
          return; // Fail safe
        }

        // Create new project_assets record for the derivative, linking back to the master
        const { data: derivativeAsset, error: newAssetErr } = await supabase.from('project_assets').insert({
          organization_id: asset.organization_id,
          project_id: asset.project_id,
          room_id: asset.room_id,
          file_path: derivativePath,
          bucket_id: 'portfolio-public',
          file_name: asset.file_name,
          file_size: asset.file_size,
          mime_type: asset.mime_type,
          width: asset.width,
          height: asset.height,
          asset_type: asset.asset_type,
          visibility: 'public', // Derivative is public
          publication_intent: 'portfolio_candidate',
          alt_text: asset.alt_text,
          caption: asset.caption,
          source_asset_id: asset.id // LINEAGE: Master reference
        }).select('id').single();

        if (newAssetErr) {
          console.error(`      ❌ Failed to create derivative database record:`, newAssetErr);
          return; // Fail safe
        }

        // 5. Update references in portfolio_entry_assets to point to the derivative
        await supabase.from('portfolio_entry_assets')
          .update({ asset_id: derivativeAsset.id })
          .eq('portfolio_entry_id', entry.id)
          .eq('asset_id', asset.id);

        // Update references in before/after pairs
        await supabase.from('project_asset_pairs')
          .update({ before_asset_id: derivativeAsset.id })
          .eq('project_id', entry.project_id)
          .eq('before_asset_id', asset.id);
          
        await supabase.from('project_asset_pairs')
          .update({ after_asset_id: derivativeAsset.id })
          .eq('project_id', entry.project_id)
          .eq('after_asset_id', asset.id);

        console.log(`      ✅ Derivative created and relationships updated (Master remains untouched).`);
      }
    }
  }

  // 6. Change portfolio status
  await supabase.from('portfolio_entries').update({ status: 'published' }).eq('id', entry.id);
  
  console.log(`\n🎉 Successfully published portfolio entry: ${slug}`);
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
