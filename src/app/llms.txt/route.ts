import { NextResponse } from 'next/server';
import { getSeoSettings, getSettings, getCategories } from '@/lib/db';

export async function GET() {
  const seo = getSeoSettings();
  const settings = getSettings();
  const categories = getCategories(false);

  const markdown = `# ${settings.brandName}
> Directed by ${settings.artistName}

## Overview
${seo.aiStudioSynopsis || settings.bio}

## Studio Information
- Brand: ${settings.brandName}
- Creative Director: ${settings.artistName}
- Studio Hubs: ${settings.location}
- Inquiries & Bookings: ${settings.email}
- Direct Phone: ${settings.phone}
- Experience: ${settings.yearsExperience}+ years
- Global Exhibitions: ${settings.exhibitionsCount}
- Industry Awards: ${settings.awardsCount}

## Photography Disciplines
${categories.map((c) => `- **${c.label}**: ${c.description || 'Editorial & commercial photography.'}`).join('\n')}

## Camera Kit & Lighting
- Medium Format & 35mm: ${settings.gearKit.cameras.join(', ')}
- Prime Lenses: ${settings.gearKit.lenses.join(', ')}
- Strobe Generators: ${settings.gearKit.lighting.join(', ')}

## Commission Process
Bookings and private commissions can be requested via the studio inquiry portal at ${(seo.canonicalUrl || 'https://reddphotographycreations.com').replace(/\/$/, '')}/contact.
`;

  return new NextResponse(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
