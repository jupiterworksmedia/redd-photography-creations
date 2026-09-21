export type CategoryType = string;

export interface CategoryItem {
  id: string;
  slug: string; // url-friendly identifier e.g. 'fashion', 'boudoir', 'automotive'
  label: string; // display name e.g. 'Haute Couture & Fashion'
  description?: string;
  enabled: boolean; // toggle option to enable / disable visibility
  order: number;
  createdAt: string;
}

export interface PhotoItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  thumbnailUrl?: string;
  aspectRatio: 'tall' | 'wide' | 'square';
  client?: string;
  story?: string;
  year?: string;
  location?: string;
  camera?: string;
  lens?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  featured: boolean;
  order: number;
  createdAt: string;
}

export interface InquiryItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  preferredDate?: string;
  location?: string;
  budgetRange?: string;
  message: string;
  status: 'new' | 'contacted' | 'booked' | 'archived';
  notes?: string;
  createdAt: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
  order: number;
  enabled: boolean;
}

export interface SiteSettings {
  brandName: string;
  artistName: string;
  email: string;
  phone: string;
  location: string;
  heroTagline: string;
  heroSubtitle: string;
  bio: string;
  artistPhilosophy: string;
  yearsExperience: number;
  exhibitionsCount: number;
  awardsCount: number;

  // Logo & Branding
  logoUrl?: string; // Uploaded custom logo image or URL
  logoHeight?: number; // Height in px (e.g. 24 to 64)
  logoText?: string; // Brand wordmark text (default "REDD")
  logoSubtitle?: string; // Tagline text under logo (default "Photography Creations")

  // Header Menu Navigation
  headerNav: NavItem[];
  headerCtaText?: string; // e.g. "Book Session"
  headerCtaLink?: string; // e.g. "/contact"
  headerCtaEnabled?: boolean;

  // Footer Configuration
  footerBio?: string;
  footerHeadquarters?: string;
  footerInquiriesTitle?: string;
  footerInquiriesText?: string;
  footerInquiriesEmail?: string;
  footerInquiriesPhone?: string;
  footerCtaText?: string;
  footerCtaLink?: string;
  footerCopyright?: string;
  footerQuickLinks?: NavItem[];
  showAdminInFooter?: boolean;

  gearKit: {
    cameras: string[];
    lenses: string[];
    lighting: string[];
  };
  socials: {
    instagram: string;
    behance: string;
    vimeo: string;
    linkedin: string;
    twitter?: string;
    youtube?: string;
    pinterest?: string;
  };
}

export interface HeroSlideItem {
  id: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  description?: string;
  imageUrl: string;
  category?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  textAlignment: 'left' | 'center' | 'right';
  fontStyle: 'editorial-serif' | 'modern-sans';
  titleCase: 'uppercase' | 'titlecase';
  accentColor: 'crimson' | 'red' | 'white' | 'gold';
  overlayOpacity: number; // e.g. 0.2 to 0.85
  order: number;
  enabled: boolean;
  createdAt: string;
}

export interface SeoAnalyticsSettings {
  // General SEO
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;

  // Meta & Social OpenGraph
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  metaPixelId?: string; // Facebook & Instagram Pixel ID
  metaDomainVerification?: string; // facebook-domain-verification
  facebookAppId?: string;

  // Twitter / X
  twitterCardType: 'summary_large_image' | 'summary';
  twitterHandle?: string;

  // Google Platform
  googleAnalyticsId?: string; // GA4 ID e.g. G-XXXXXXXXXX
  googleTagManagerId?: string; // GTM ID e.g. GTM-XXXXXXX
  googleSiteVerification?: string; // google-site-verification
  enableSchemaOrg: boolean;
  schemaType: 'Photographer' | 'LocalBusiness' | 'ProfessionalService';

  // AI Platforms & Bots (GEO - Generative Engine Optimization)
  allowGptBot: boolean; // OpenAI ChatGPT & Search
  allowClaudeBot: boolean; // Anthropic Claude
  allowPerplexityBot: boolean; // Perplexity AI Search
  allowGoogleExtended: boolean; // Google Gemini & AI Overviews
  allowAppleBot: boolean; // Apple Intelligence
  allowCommonCrawl: boolean; // CCBot / Common Crawl
  aiStudioSynopsis?: string; // Structured semantic synopsis for LLM citations
}

// ----------------- ABOUT PAGE SETTINGS -----------------

export interface MilestoneItem {
  id: string;
  value: string; // e.g. "12+"
  label: string; // e.g. "Years Behind Lens"
  order?: number;
}

export interface HonorItem {
  id: string;
  title: string; // e.g. "VOGUE"
  subtitle: string; // e.g. "Scandinavia & Italia"
  order?: number;
}

export interface AboutPageSettings {
  eyebrow: string; // e.g. "About The Director & Studio"
  headline: string; // e.g. "A relentless pursuit of visual purity."
  headlineItalic: string; // e.g. "visual purity"
  portraitImageUrl: string;
  directorName: string;
  directorRole: string; // e.g. "Creative Director"
  directorSubRole: string; // e.g. "Founding Principal, REDD Studio"
  bioParagraph1: string;
  bioQuote: string;
  bioParagraph2: string;
  milestones: MilestoneItem[];
  honorsEyebrow: string;
  honorsTitle: string;
  honorsList: HonorItem[];
  gearTitleEyebrow: string;
  gearTitle: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonLink: string;
}

// ----------------- SERVICES PAGE SETTINGS -----------------

export interface ServiceOfferingItem {
  id: string;
  category: string; // e.g. 'fashion', 'boudoir', 'portraits', etc.
  eyebrow: string; // e.g. 'Editorial Campaigns & Lookbooks'
  title: string; // e.g. 'Haute Couture & Editorial Fashion'
  description: string;
  features: string[]; // List of included deliverables/elements
  idealFor: string;
  investment: string; // e.g. 'From $6,500'
  buttonText: string; // e.g. 'Inquire About This Service'
  buttonLink: string; // e.g. '/contact?category=fashion'
  enabled: boolean;
  order: number;
}

export interface ProductionJourneyStep {
  id: string;
  stepNumber: string; // e.g. 'STEP 01'
  title: string; // e.g. 'Vision Consultation'
  description: string;
}

export interface ServicesPageSettings {
  eyebrow: string; // e.g. "Bespoke Production Services"
  headline: string; // e.g. "Disciplines & Commissions"
  headlineItalic: string; // e.g. "Commissions"
  introText: string;
  offerings: ServiceOfferingItem[];
  journeyEyebrow: string; // e.g. "The Experience"
  journeyTitle: string; // e.g. "From Concept to Master Print"
  journeySteps: ProductionJourneyStep[];
  ctaTitle?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
}

export interface AdminUser {
  email: string;
  passwordHash: string;
  name: string;
  lastLogin?: string;
}

export interface DatabaseSchema {
  photos: PhotoItem[];
  inquiries: InquiryItem[];
  settings: SiteSettings;
  admin: AdminUser;
  categories: CategoryItem[];
  heroSlides: HeroSlideItem[];
  seo: SeoAnalyticsSettings;
  about?: AboutPageSettings;
  services?: ServicesPageSettings;
}



