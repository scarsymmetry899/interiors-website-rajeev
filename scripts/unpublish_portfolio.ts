import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

export async function unpublishPortfolio(slug: string) {
  console.log(`\n--- UNPUBLISHING PORTFOLIO: ${slug} ---`);
  
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase Admin credentials');
    return;
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1. Fetch Portfolio Entry
  const { data: entry, error: entryErr } = await supabase.from('portfolio_entries')
    .select('id, status')
    .eq('slug', slug).single();

  if (entryErr || !entry) {
    console.error('❌ Portfolio entry not found.');
    return;
  }

  // 2. Unpublish (Sets to draft)
  await supabase.from('portfolio_entries').update({ status: 'draft' }).eq('id', entry.id);
  
  console.log(`✅ Successfully unpublished portfolio entry: ${slug}.`);
  console.log(`   It will immediately stop rendering publicly.`);
  console.log(`   Original internal assets remain safe and intact.`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error('Usage: npx tsx scripts/unpublish_portfolio.ts <portfolio-slug>');
    process.exit(1);
  }
  unpublishPortfolio(args[0]);
}
