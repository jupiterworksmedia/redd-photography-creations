import { getSettings, getCategories, getAboutSettings } from '@/lib/db';
import AboutClient from '@/components/AboutClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'About The Director & Studio | REDD Photography Creations',
  description:
    'International modernist photography studio directed by Kiran Redd. Biography, philosophy, and optical arsenal.',
};

export default function AboutPage() {
  const settings = getSettings();
  const categories = getCategories(false);
  const about = getAboutSettings();

  return <AboutClient initialAbout={about} settings={settings} categories={categories} />;
}
