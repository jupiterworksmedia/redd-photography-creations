import { getSettings, getCategories, getServicesSettings } from '@/lib/db';
import ServicesClient from '@/components/ServicesClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Bespoke Production Services | REDD Photography Creations',
  description:
    'Haute Couture & Fashion, Fine-Art Boudoir, Cinematic Portraits, High-Society Events, and Luxury Commercial Advertising.',
};

export default function ServicesPage() {
  const settings = getSettings();
  const categories = getCategories(false);
  const services = getServicesSettings();

  return <ServicesClient initialServices={services} settings={settings} categories={categories} />;
}
