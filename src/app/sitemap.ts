import { MetadataRoute } from 'next';
import { getSeoSettings } from '@/lib/db';

export default function sitemap(): MetadataRoute.Sitemap {
  const seo = getSeoSettings();
  const baseUrl = (seo.canonicalUrl || 'https://reddphotographycreations.com').replace(/\/$/, '');
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ];
}
