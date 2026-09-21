import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { DatabaseSchema, PhotoItem, InquiryItem, SiteSettings, AdminUser, CategoryItem, HeroSlideItem, SeoAnalyticsSettings, AboutPageSettings, ServicesPageSettings } from './types';
import { initialSeedData, INITIAL_ADMIN_PASSWORD, initialAboutData, initialServicesData } from './seedData';

// Determine writable data directory (use /tmp on Vercel / AWS Lambda)
const IS_VERCEL = Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
const BUNDLED_DB_FILE = path.join(process.cwd(), 'data', 'db.json');
const DATA_DIR = IS_VERCEL ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// In-memory cache for serverless function lifecycles
let memoryCache: DatabaseSchema | null = null;

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[DB] Warning: Could not create DATA_DIR:', err);
  }
}

function getDatabase(): DatabaseSchema {
  // If we already have an active in-memory cache, return it immediately
  if (memoryCache) {
    return memoryCache;
  }

  ensureDataDir();

  // On Vercel, if /tmp/data/db.json doesn't exist yet, try to copy from bundled db.json
  if (IS_VERCEL && !fs.existsSync(DB_FILE)) {
    try {
      if (fs.existsSync(BUNDLED_DB_FILE)) {
        const bundledRaw = fs.readFileSync(BUNDLED_DB_FILE, 'utf-8');
        fs.writeFileSync(DB_FILE, bundledRaw, 'utf-8');
      }
    } catch (err) {
      console.warn('[DB] Could not copy bundled DB to /tmp, will read directly:', err);
    }
  }

  // Check if DB file exists (either in /tmp/data or process.cwd()/data)
  let targetFile = DB_FILE;
  if (!fs.existsSync(targetFile)) {
    if (fs.existsSync(BUNDLED_DB_FILE)) {
      targetFile = BUNDLED_DB_FILE;
    }
  }

  if (!fs.existsSync(targetFile)) {
    // Hash the initial password for the admin
    const passwordHash = bcrypt.hashSync(INITIAL_ADMIN_PASSWORD, 10);
    const initialDb: DatabaseSchema = {
      ...initialSeedData,
      admin: {
        ...initialSeedData.admin,
        passwordHash,
      },
    };
    memoryCache = initialDb;
    saveDatabase(initialDb);
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(targetFile, 'utf-8');
    const parsed: DatabaseSchema = JSON.parse(raw);

    let needsSave = false;

    // Auto-migrate if categories is missing in existing database
    if (!parsed.categories || !Array.isArray(parsed.categories)) {
      parsed.categories = [...initialSeedData.categories];
      needsSave = true;
    }

    // Auto-migrate if heroSlides is missing in existing database
    if (!parsed.heroSlides || !Array.isArray(parsed.heroSlides)) {
      parsed.heroSlides = [...initialSeedData.heroSlides];
      needsSave = true;
    }

    // Auto-migrate if seo is missing in existing database
    if (!parsed.seo || typeof parsed.seo !== 'object') {
      parsed.seo = { ...initialSeedData.seo };
      needsSave = true;
    }

    // Auto-migrate if headerNav or footer settings missing in existing database
    if (!parsed.settings.headerNav || !Array.isArray(parsed.settings.headerNav)) {
      parsed.settings = {
        ...initialSeedData.settings,
        ...parsed.settings,
        headerNav: [...initialSeedData.settings.headerNav],
      };
      needsSave = true;
    }

    // Auto-migrate if about page settings missing in existing database
    if (!parsed.about || typeof parsed.about !== 'object') {
      parsed.about = { ...initialAboutData };
      needsSave = true;
    }

    // Auto-migrate if services page settings missing in existing database
    if (!parsed.services || typeof parsed.services !== 'object') {
      parsed.services = { ...initialServicesData };
      needsSave = true;
    }

    memoryCache = parsed;

    if (needsSave) {
      saveDatabase(parsed);
    }

    return parsed;
  } catch (err) {
    console.error('Error reading database file, using fallback seed:', err);
    const passwordHash = bcrypt.hashSync(INITIAL_ADMIN_PASSWORD, 10);
    const fallbackDb: DatabaseSchema = {
      ...initialSeedData,
      admin: {
        ...initialSeedData.admin,
        passwordHash,
      },
    };
    memoryCache = fallbackDb;
    saveDatabase(fallbackDb);
    return fallbackDb;
  }
}
import { uploadFileToGitHub } from './githubSync';

const GITHUB_DB_PATH = 'data/db.json';

/**
 * Persists the current or passed database schema to the GitHub repository.
 * Can be awaited by API routes to guarantee commits finish before serverless teardown.
 */
export async function persistDatabase(data?: DatabaseSchema): Promise<void> {
  const targetData = data || memoryCache || getDatabase();
  const buffer = Buffer.from(JSON.stringify(targetData, null, 2), 'utf-8');
  await uploadFileToGitHub(
    GITHUB_DB_PATH,
    buffer,
    'CMS Auto-sync: Update data/db.json from administrative portal'
  );
}

function saveDatabase(data: DatabaseSchema): void {
  // Always update in-memory cache first
  memoryCache = data;

  try {
    ensureDataDir();
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.warn('[DB] Warning: File system write failed (operating in memory mode):', err);
  }

  // Trigger GitHub persistence immediately
  persistDatabase(data).catch((err) => {
    console.warn('[DB] Background GitHub persist failed:', err);
  });
}

// ----------------- PHOTOS API -----------------

export function getPhotos(
  category?: string,
  featuredOnly?: boolean,
  includeDisabledCategories = false
): PhotoItem[] {
  const db = getDatabase();
  let photos = [...db.photos];

  // If not explicitly including disabled categories, filter out photos of disabled categories
  if (!includeDisabledCategories && db.categories) {
    const disabledSlugs = db.categories
      .filter((c) => !c.enabled)
      .map((c) => c.slug.toLowerCase());
    if (disabledSlugs.length > 0) {
      photos = photos.filter((p) => !disabledSlugs.includes(p.category.toLowerCase()));
    }
  }

  if (category && category !== 'all') {
    photos = photos.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (featuredOnly) {
    photos = photos.filter((p) => p.featured);
  }

  // Sort by order ascending, then by date descending
  return photos.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getPhotoById(id: string): PhotoItem | undefined {
  const db = getDatabase();
  return db.photos.find((p) => p.id === id);
}

export function createPhoto(item: Omit<PhotoItem, 'id' | 'createdAt'>): PhotoItem {
  const db = getDatabase();
  const newPhoto: PhotoItem = {
    ...item,
    id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  db.photos.unshift(newPhoto);
  saveDatabase(db);
  return newPhoto;
}

export function updatePhoto(id: string, updates: Partial<PhotoItem>): PhotoItem | null {
  const db = getDatabase();
  const index = db.photos.findIndex((p) => p.id === id);
  if (index === -1) return null;

  db.photos[index] = {
    ...db.photos[index],
    ...updates,
    id: db.photos[index].id, // preserve ID
  };

  saveDatabase(db);
  return db.photos[index];
}

export function deletePhoto(id: string): boolean {
  const db = getDatabase();
  const initialLength = db.photos.length;
  db.photos = db.photos.filter((p) => p.id !== id);
  if (db.photos.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// ----------------- INQUIRIES API -----------------

export function getInquiries(status?: string): InquiryItem[] {
  const db = getDatabase();
  let inquiries = [...db.inquiries];

  if (status && status !== 'all') {
    inquiries = inquiries.filter((i) => i.status === status);
  }

  return inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getInquiryById(id: string): InquiryItem | undefined {
  const db = getDatabase();
  return db.inquiries.find((i) => i.id === id);
}

export function createInquiry(item: Omit<InquiryItem, 'id' | 'createdAt' | 'status'>): InquiryItem {
  const db = getDatabase();
  const newInquiry: InquiryItem = {
    ...item,
    id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  db.inquiries.unshift(newInquiry);
  saveDatabase(db);
  return newInquiry;
}

export function updateInquiry(id: string, updates: Partial<InquiryItem>): InquiryItem | null {
  const db = getDatabase();
  const index = db.inquiries.findIndex((i) => i.id === id);
  if (index === -1) return null;

  db.inquiries[index] = {
    ...db.inquiries[index],
    ...updates,
    id: db.inquiries[index].id,
  };

  saveDatabase(db);
  return db.inquiries[index];
}

export function deleteInquiry(id: string): boolean {
  const db = getDatabase();
  const initialLength = db.inquiries.length;
  db.inquiries = db.inquiries.filter((i) => i.id !== id);
  if (db.inquiries.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// ----------------- SETTINGS API -----------------

export function getSettings(): SiteSettings {
  const db = getDatabase();
  return db.settings;
}

export function updateSettings(updates: Partial<SiteSettings>): SiteSettings {
  const db = getDatabase();
  db.settings = {
    ...db.settings,
    ...updates,
  };
  saveDatabase(db);
  return db.settings;
}

// ----------------- ADMIN USER API -----------------

export function getAdminUser(): AdminUser {
  const db = getDatabase();
  return db.admin;
}

export function updateAdminLastLogin(): void {
  const db = getDatabase();
  db.admin.lastLogin = new Date().toISOString();
  saveDatabase(db);
}

export function updateAdminPassword(newPasswordHash: string): boolean {
  const db = getDatabase();
  db.admin.passwordHash = newPasswordHash;
  saveDatabase(db);
  return true;
}

// ----------------- CATEGORIES API -----------------

export function getCategories(includeDisabled = false): CategoryItem[] {
  const db = getDatabase();
  let categories = [...(db.categories || [])];
  if (!includeDisabled) {
    categories = categories.filter((c) => c.enabled);
  }
  return categories.sort((a, b) => a.order - b.order);
}

export function getCategoryById(id: string): CategoryItem | undefined {
  const db = getDatabase();
  return (db.categories || []).find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): CategoryItem | undefined {
  const db = getDatabase();
  return (db.categories || []).find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}

export function createCategory(item: Omit<CategoryItem, 'id' | 'createdAt'>): CategoryItem {
  const db = getDatabase();
  if (!db.categories) db.categories = [];

  const cleanSlug = item.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const newCategory: CategoryItem = {
    ...item,
    slug: cleanSlug,
    id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  db.categories.push(newCategory);
  saveDatabase(db);
  return newCategory;
}

export function updateCategory(id: string, updates: Partial<CategoryItem>): CategoryItem | null {
  const db = getDatabase();
  if (!db.categories) db.categories = [];

  const index = db.categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  if (updates.slug) {
    updates.slug = updates.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  }

  db.categories[index] = {
    ...db.categories[index],
    ...updates,
    id: db.categories[index].id,
  };

  saveDatabase(db);
  return db.categories[index];
}

export function deleteCategory(id: string): boolean {
  const db = getDatabase();
  if (!db.categories) return false;

  const initialLength = db.categories.length;
  db.categories = db.categories.filter((c) => c.id !== id);
  if (db.categories.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// ----------------- HERO SLIDES API -----------------

export function getHeroSlides(includeDisabled = false): HeroSlideItem[] {
  const db = getDatabase();
  let slides = [...(db.heroSlides || [])];
  if (!includeDisabled) {
    slides = slides.filter((s) => s.enabled);
  }
  return slides.sort((a, b) => a.order - b.order);
}

export function getHeroSlideById(id: string): HeroSlideItem | undefined {
  const db = getDatabase();
  return (db.heroSlides || []).find((s) => s.id === id);
}

export function createHeroSlide(item: Omit<HeroSlideItem, 'id' | 'createdAt'>): HeroSlideItem {
  const db = getDatabase();
  if (!db.heroSlides) db.heroSlides = [];

  const newSlide: HeroSlideItem = {
    ...item,
    id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  db.heroSlides.push(newSlide);
  saveDatabase(db);
  return newSlide;
}

export function updateHeroSlide(id: string, updates: Partial<HeroSlideItem>): HeroSlideItem | null {
  const db = getDatabase();
  if (!db.heroSlides) db.heroSlides = [];

  const index = db.heroSlides.findIndex((s) => s.id === id);
  if (index === -1) return null;

  db.heroSlides[index] = {
    ...db.heroSlides[index],
    ...updates,
    id: db.heroSlides[index].id,
  };

  saveDatabase(db);
  return db.heroSlides[index];
}

export function deleteHeroSlide(id: string): boolean {
  const db = getDatabase();
  if (!db.heroSlides) return false;

  const initialLength = db.heroSlides.length;
  db.heroSlides = db.heroSlides.filter((s) => s.id !== id);
  if (db.heroSlides.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// ----------------- SEO & ANALYTICS API -----------------

export function getSeoSettings(): SeoAnalyticsSettings {
  const db = getDatabase();
  return db.seo || initialSeedData.seo;
}

export function updateSeoSettings(updates: Partial<SeoAnalyticsSettings>): SeoAnalyticsSettings {
  const db = getDatabase();
  db.seo = {
    ...getSeoSettings(),
    ...updates,
  };
  saveDatabase(db);
  return db.seo;
}

// ----------------- ABOUT PAGE API -----------------

export function getAboutSettings(): AboutPageSettings {
  const db = getDatabase();
  return db.about || initialAboutData;
}

export function updateAboutSettings(updates: Partial<AboutPageSettings>): AboutPageSettings {
  const db = getDatabase();
  db.about = {
    ...getAboutSettings(),
    ...updates,
  };
  saveDatabase(db);
  return db.about;
}

// ----------------- SERVICES PAGE API -----------------

export function getServicesSettings(): ServicesPageSettings {
  const db = getDatabase();
  return db.services || initialServicesData;
}

export function updateServicesSettings(updates: Partial<ServicesPageSettings>): ServicesPageSettings {
  const db = getDatabase();
  db.services = {
    ...getServicesSettings(),
    ...updates,
  };
  saveDatabase(db);
  return db.services;
}



