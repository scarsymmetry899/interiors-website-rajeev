import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { z } from 'zod';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Schema definitions
const AssetSchema = z.object({
  id: z.string(), // Stable reference for idempotency
  url: z.string(), // Allowing relative paths like /images/project1.jpg for Phase 1
  width: z.number().optional(),
  height: z.number().optional(),
  alt_text: z.string().optional(),
});

const SectionSchema = z.object({
  id: z.string(), // Stable reference for idempotency
  section_type: z.enum(['intro', 'full_bleed_image', 'image_grid', 'room', 'before_after', 'text', 'quote', 'materials', 'floor_plan', 'video', 'render_vs_built', 'gallery', 'testimonial']),
  display_order: z.number(),
  title: z.string().optional(),
  body: z.string().optional(),
  configuration: z.any().optional(),
  assets: z.array(AssetSchema).optional(),
});

const PortfolioImportSchema = z.object({
  projects: z.array(z.object({
    slug: z.string(), // Deterministic key
    title: z.string(),
    subtitle: z.string().optional(),
    location_display: z.string().optional(),
    property_type: z.string().optional(),
    style: z.string().optional(),
    area_display: z.string().optional(),
    completion_year: z.number().optional(),
    scope_display: z.string().optional(),
    featured: z.boolean().default(false),
    status: z.enum(['draft', 'review', 'published', 'archived']),
    index_layout_variant: z.enum(['feature_landscape', 'portrait_left', 'portrait_right', 'full_bleed', 'paired', 'editorial_standard']).optional(),
    seo_title: z.string().optional(),
    seo_description: z.string().optional(),
    hero_asset: AssetSchema.optional(),
    sections: z.array(SectionSchema).optional(),
    credits: z.record(z.string(), z.string()).optional(),
  }))
});

export async function ingestPortfolio(jsonPayload: any, isDryRun: boolean = false) {
  console.log(`Validating payload... ${isDryRun ? '(DRY RUN)' : ''}`);
  const parsed = PortfolioImportSchema.safeParse(jsonPayload);
  
  if (!parsed.success) {
    console.error('❌ Validation Failed: Invalid JSON Structure', JSON.stringify(parsed.error.format(), null, 2));
    return;
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase Admin credentials in .env.local');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  let created = 0, updated = 0, failed = 0;

  for (const project of parsed.data.projects) {
    try {
      console.log(`Processing project: ${project.slug}...`);
      
      if (isDryRun) {
        console.log(`✅ [DRY RUN] Would upsert project: ${project.slug}`);
        updated++;
        continue;
      }

      // 1. Upsert Project
      const { error: projErr } = await supabase.from('portfolio_entries').upsert({
        slug: project.slug,
        title: project.title,
        subtitle: project.subtitle,
        location_display: project.location_display,
        property_type: project.property_type,
        style: project.style,
        area_display: project.area_display,
        completion_year: project.completion_year,
        scope_display: project.scope_display,
        featured: project.featured,
        status: project.status,
        index_layout_variant: project.index_layout_variant,
        seo_title: project.seo_title,
        seo_description: project.seo_description,
        credits: project.credits,
      }, { onConflict: 'slug' });

      if (projErr) throw projErr;

      // Log success
      updated++;
      console.log(`✅ Upserted project: ${project.slug}`);

    } catch (error) {
      console.error(`❌ Failed to process project ${project.slug}:`, error);
      failed++;
    }
  }

  console.log(`\nIngestion Summary:\nCreated/Updated: ${updated}\nFailed: ${failed}`);
}

// CLI Execution Support
if (require.main === module) {
  const fs = require('fs');
  const path = require('path');
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const fileArg = args.find(a => !a.startsWith('--'));

  if (!fileArg) {
    console.error('Usage: npx tsx scripts/ingest_portfolio.ts <path-to-json> [--dry-run]');
    process.exit(1);
  }

  const payload = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), fileArg), 'utf-8'));
  ingestPortfolio(payload, isDryRun);
}
