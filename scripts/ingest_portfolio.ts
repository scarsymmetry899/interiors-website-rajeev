import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve, join } from 'path';
import { z } from 'zod';
import * as fs from 'fs';
import sharp from 'sharp';
import mime from 'mime-types';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// ---------------------------------------------------------
// 1. SCHEMAS (Reflecting the New Contract)
// ---------------------------------------------------------

const RoomSchema = z.object({
  slug: z.string(),
  name: z.string(),
  room_type: z.string(),
  display_order: z.number().optional()
});

const AssetSchema = z.object({
  asset_key: z.string(),
  local_path: z.string(),
  asset_type: z.enum(['photo', 'before_photo', 'after_photo', 'render', 'floor_plan', 'drawing', 'moodboard', 'material_detail', 'video']).default('photo'),
  room: z.string().optional(), // room_slug
  alt_text: z.string().optional(),
  caption: z.string().optional(),
  publication_intent: z.enum(['internal', 'portfolio_candidate']).default('internal'),
  layout_role: z.enum(['hero_landscape', 'full_bleed', 'wide', 'portrait', 'diptych', 'triptych', 'detail', 'room_hero', 'before_after', 'gallery']).optional()
});

const SectionSchema = z.object({
  section_type: z.enum(['intro', 'full_bleed_image', 'image_grid', 'room', 'before_after', 'text', 'quote', 'materials', 'floor_plan', 'video', 'render_vs_built', 'gallery', 'testimonial']),
  title: z.string().optional(),
  body: z.string().optional(),
  order_index: z.number(),
  asset_keys: z.array(z.string()).optional(),
  
  // Explicit relationships
  before_asset_key: z.string().optional(),
  after_asset_key: z.string().optional(),
  comparison_mode: z.enum(['slider', 'paired']).optional(),
  render_asset_key: z.string().optional(),
  built_asset_key: z.string().optional(),
});

const ProjectSchema = z.object({
  name: z.string(),
  status: z.enum(['lead', 'proposal', 'active', 'completed', 'archived']).default('completed'),
});

const PortfolioSchema = z.object({
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  location_display: z.string().optional(),
  property_type: z.string().optional(),
  style: z.string().optional(),
  area_display: z.string().optional(),
  completion_year: z.number().optional(),
  scope_display: z.string().optional(),
  featured: z.boolean().default(false),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  hero_asset_key: z.string().optional()
  // index_layout_variant removed as requested
});

const IngestionPackageSchema = z.object({
  project: ProjectSchema,
  portfolio: PortfolioSchema,
  rooms: z.array(RoomSchema).default([]),
  assets: z.array(AssetSchema).default([]),
  sections: z.array(SectionSchema).default([])
});

// ---------------------------------------------------------
// 2. INGESTION LOGIC
// ---------------------------------------------------------

export async function ingestPortfolio(payloadPath: string, isDryRun: boolean = false) {
  console.log(`\n--- STARTING INGESTION ${isDryRun ? '[DRY RUN]' : ''} ---`);
  
  const payloadDir = resolve(process.cwd(), payloadPath, '..');
  const jsonPayload = JSON.parse(fs.readFileSync(resolve(process.cwd(), payloadPath), 'utf-8'));
  
  const parsed = IngestionPackageSchema.safeParse(jsonPayload);
  
  if (!parsed.success) {
    console.error('❌ Validation FAILED: Invalid JSON Structure', JSON.stringify(parsed.error.format(), null, 2));
    return;
  }
  const data = parsed.data;

  console.log('✅ Payload Schema: VALID');

  let stats = {
    assets: { VALID: 0, CREATED: 0, UPDATED: 0, UNCHANGED: 0, FAILED: 0 },
    rooms: { VALID: 0, CREATED: 0, UPDATED: 0, UNCHANGED: 0, FAILED: 0 },
    sections: { VALID: 0, CREATED: 0, UPDATED: 0, UNCHANGED: 0, FAILED: 0 },
    relationships: { VALID: 0, CREATED: 0, UPDATED: 0, UNCHANGED: 0, FAILED: 0 },
  };

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase Admin credentials in .env.local');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1. Get Org ID
  const { data: orgData } = await supabase.from('organizations').select('id').limit(1).single();
  if (!orgData) {
    console.error('❌ No Organization found in the database. Cannot ingest.');
    return;
  }
  const orgId = orgData.id;

  // 2. Validate Files & Extract Metadata
  type ProcessedAsset = z.infer<typeof AssetSchema> & {
    mime_type: string; width?: number; height?: number; file_size: number;
    aspect_ratio?: number; bucket_id: string; storage_path: string; absolute_path: string;
  };
  const processedAssets: Record<string, ProcessedAsset> = {};

  for (const asset of data.assets) {
    const absolute_path = join(payloadDir, asset.local_path);
    if (!fs.existsSync(absolute_path)) {
      console.error(`❌ File not found: ${absolute_path}`);
      stats.assets.FAILED++;
      continue;
    }
    
    const stat = fs.statSync(absolute_path);
    let width, height, aspect_ratio;
    
    if (asset.asset_type === 'photo' || asset.asset_type === 'before_photo' || asset.asset_type === 'after_photo' || asset.asset_type === 'render') {
      const metadata = await sharp(absolute_path).metadata();
      width = metadata.width;
      height = metadata.height;
      if (width && height) aspect_ratio = width / height;
    }

    const mime_type = mime.lookup(absolute_path) || 'application/octet-stream';
    // ALWAYS ingest to studio-internal. Promotion to portfolio-public happens on publish.
    const bucket_id = 'studio-internal';
    const storage_path = `${data.portfolio.slug}/${asset.asset_key}`; // simple path

    processedAssets[asset.asset_key] = {
      ...asset, mime_type, width, height, file_size: stat.size, aspect_ratio, bucket_id, storage_path, absolute_path
    };
    stats.assets.VALID++;
  }

  if (isDryRun) {
    console.log('\n[DRY RUN SUMMARY]');
    console.log(`Project: ${data.project.name} (Draft)`);
    console.log(`Portfolio: ${data.portfolio.slug} (Draft)`);
    console.log(`Rooms Validated: ${data.rooms.length}`);
    console.log(`Assets Validated: ${stats.assets.VALID} / ${data.assets.length}`);
    console.log(`Sections Validated: ${data.sections.length}`);
    return;
  }

  try {
    // 3. Upsert Project (Draft/Default logic handled by DB mostly, but we enforce draft for safety if we had status)
    // Actually project status defaults to 'completed' per user request, but portfolio_entries to 'draft'.
    let project_id: string;
    
    // We try to find existing project by some unique identifier, for simplicity we insert or find by name.
    const { data: existingProj } = await supabase.from('projects').select('id').eq('name', data.project.name).single();
    if (existingProj) {
      project_id = existingProj.id;
    } else {
      const { data: newProj, error: pErr } = await supabase.from('projects').insert({
        organization_id: orgId, name: data.project.name, status: data.project.status
      }).select('id').single();
      if (pErr) throw pErr;
      project_id = newProj.id;
    }

    // 4. Upsert Rooms
    const roomMap: Record<string, string> = {};
    for (const room of data.rooms) {
      const { data: rData, error: rErr } = await supabase.from('project_rooms').upsert({
        project_id, slug: room.slug, name: room.name, room_type: room.room_type, display_order: room.display_order
      }, { onConflict: 'project_id,slug' }).select('id').single();
      if (rErr) throw rErr;
      roomMap[room.slug] = rData.id;
      stats.rooms.CREATED++; // simplification
    }

    // 5. Upload & Upsert Assets
    const assetIdMap: Record<string, string> = {};
    for (const [key, asset] of Object.entries(processedAssets)) {
      // Storage Upload
      const fileBuffer = fs.readFileSync(asset.absolute_path);
      const { error: uploadErr } = await supabase.storage.from(asset.bucket_id).upload(asset.storage_path, fileBuffer, {
        contentType: asset.mime_type,
        upsert: true
      });
      if (uploadErr) {
        console.error(`❌ Upload failed for ${key}:`, uploadErr);
        stats.assets.FAILED++;
        continue;
      }

      // Database Record
      const { data: dbAsset, error: assetErr } = await supabase.from('project_assets').upsert({
        organization_id: orgId,
        project_id,
        room_id: asset.room ? roomMap[asset.room] : null,
        file_path: asset.storage_path,
        bucket_id: asset.bucket_id,
        file_name: asset.local_path.split('/').pop(),
        file_size: asset.file_size,
        mime_type: asset.mime_type,
        width: asset.width,
        height: asset.height,
        asset_type: asset.asset_type,
        visibility: 'private', // Enforce private on ingest. Promotion changes this to public.
        alt_text: asset.alt_text,
        caption: asset.caption
      }, { onConflict: 'project_id,file_path' }).select('id').single();
      
      if (assetErr) throw assetErr;
      assetIdMap[key] = dbAsset.id;
      stats.assets.CREATED++;
    }

    // 6. Upsert Portfolio Entry (FORCE DRAFT)
    const { data: portfolioEntry, error: portErr } = await supabase.from('portfolio_entries').upsert({
      organization_id: orgId,
      project_id,
      slug: data.portfolio.slug,
      title: data.portfolio.title,
      subtitle: data.portfolio.subtitle,
      location_display: data.portfolio.location_display,
      property_type: data.portfolio.property_type,
      style: data.portfolio.style,
      area_display: data.portfolio.area_display,
      completion_year: data.portfolio.completion_year,
      scope_display: data.portfolio.scope_display,
      featured: data.portfolio.featured,
      status: 'draft', // FORCE DRAFT
      seo_title: data.portfolio.seo_title,
      seo_description: data.portfolio.seo_description,
      hero_asset_id: data.portfolio.hero_asset_key ? assetIdMap[data.portfolio.hero_asset_key] : null
    }, { onConflict: 'organization_id,slug' }).select('id').single();
    if (portErr) throw portErr;
    const portfolio_entry_id = portfolioEntry.id;

    // 7. Upsert Sections
    for (const section of data.sections) {
      const { data: secData, error: secErr } = await supabase.from('portfolio_sections').insert({
        portfolio_entry_id,
        section_type: section.section_type,
        title: section.title,
        body: section.body,
        order_index: section.order_index
      }).select('id').single();
      if (secErr) throw secErr;
      stats.sections.CREATED++;

      // Link assets to sections
      if (section.asset_keys) {
        for (const [idx, aKey] of section.asset_keys.entries()) {
           if (!assetIdMap[aKey]) continue;
           await supabase.from('portfolio_entry_assets').insert({
             portfolio_entry_id, asset_id: assetIdMap[aKey], section_id: secData.id, order_index: idx
           });
           stats.relationships.CREATED++;
        }
      }
      
      // Before/After Pairs Handling (Simplified for now - we link them globally or to the section)
      if (section.section_type === 'before_after' && section.before_asset_key && section.after_asset_key) {
         await supabase.from('project_asset_pairs').insert({
           project_id,
           before_asset_id: assetIdMap[section.before_asset_key],
           after_asset_id: assetIdMap[section.after_asset_key]
         });
         stats.relationships.CREATED++;
      }
    }

    console.log(`\n✅ INGESTION COMPLETE`);
    console.log(`Assets: ${stats.assets.CREATED} CREATED`);
    console.log(`Rooms: ${stats.rooms.CREATED} CREATED`);
    console.log(`Sections: ${stats.sections.CREATED} CREATED`);
    console.log(`Relationships: ${stats.relationships.CREATED} CREATED`);

  } catch (err) {
    console.error('❌ INGESTION FATAL ERROR:', err);
  }
}

// CLI Execution Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const fileArg = args.find(a => !a.startsWith('--'));

  if (!fileArg) {
    console.error('Usage: npx tsx scripts/ingest_portfolio.ts <path-to-json> [--dry-run]');
    process.exit(1);
  }

  ingestPortfolio(fileArg, isDryRun);
}
