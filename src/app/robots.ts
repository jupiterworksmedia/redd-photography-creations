import { MetadataRoute } from 'next';
import { getSeoSettings } from '@/lib/db';

export default function robots(): MetadataRoute.Robots {
  const seo = getSeoSettings();
  const baseUrl = seo.canonicalUrl || 'https://reddphotographycreations.com';

  const rules: MetadataRoute.Robots['rules'] = [
    {
      userAgent: '*',
      allow: seo.robotsIndex ? '/' : undefined,
      disallow: seo.robotsIndex ? ['/admin/', '/api/'] : '/',
    },
  ];

  // Specific AI bot directives based on configuration
  const aiBots = [
    { name: 'GPTBot', allowed: seo.allowGptBot },
    { name: 'ClaudeBot', allowed: seo.allowClaudeBot },
    { name: 'PerplexityBot', allowed: seo.allowPerplexityBot },
    { name: 'Google-Extended', allowed: seo.allowGoogleExtended },
    { name: 'Applebot-Extended', allowed: seo.allowAppleBot },
    { name: 'CCBot', allowed: seo.allowCommonCrawl },
  ];

  for (const bot of aiBots) {
    rules.push({
      userAgent: bot.name,
      allow: bot.allowed ? '/' : undefined,
      disallow: bot.allowed ? ['/admin/', '/api/'] : '/',
    });
  }

  return {
    rules,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
