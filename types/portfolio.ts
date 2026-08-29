export type SectionType = 
  | 'intro' 
  | 'full_bleed_image' 
  | 'image_grid' 
  | 'room' 
  | 'before_after' 
  | 'text' 
  | 'quote' 
  | 'materials' 
  | 'floor_plan' 
  | 'video' 
  | 'render_vs_built' 
  | 'gallery' 
  | 'testimonial';

export interface PortfolioAsset {
  id: string;
  url: string;
  alt_text?: string;
  width?: number;
  height?: number;
}

export interface PortfolioSection {
  id: string;
  section_type: SectionType;
  title?: string;
  body?: string;
  display_order: number;
  configuration: any;
  assets?: PortfolioAsset[];
}

export interface PortfolioEntry {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  short_description?: string;
  long_description?: string;
  hero_asset?: PortfolioAsset;
  location_display?: string;
  property_type?: string;
  style?: string;
  area_display?: string;
  completion_year?: number;
  scope_display?: string;
  featured: boolean;
  status: 'draft' | 'review' | 'published' | 'archived';
  index_layout_variant?: 'feature_landscape' | 'portrait_left' | 'portrait_right' | 'full_bleed' | 'paired' | 'editorial_standard';
  seo_title?: string;
  seo_description?: string;
  sections?: PortfolioSection[];
  credits?: Record<string, string>;
  next_project?: { slug: string; title: string; location: string; hero_asset?: PortfolioAsset };
}
