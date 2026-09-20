import { NextRequest, NextResponse } from 'next/server';
import { getHeroSlides, createHeroSlide } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDisabled = searchParams.get('all') === 'true';

    // If requesting disabled slides, check admin session
    if (includeDisabled) {
      const session = await getCurrentAdminSession();
      if (!session) {
        // Fall back to enabled only if unauthorized
        const slides = getHeroSlides(false);
        return NextResponse.json({ success: true, count: slides.length, slides });
      }
    }

    const slides = getHeroSlides(includeDisabled);
    return NextResponse.json({ success: true, count: slides.length, slides });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return NextResponse.json({ error: 'Failed to retrieve hero slides' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      subtitle,
      tagline,
      description,
      imageUrl,
      category,
      buttonText = 'Explore Series',
      buttonLink = '#work',
      secondaryButtonText,
      secondaryButtonLink,
      textAlignment = 'left',
      fontStyle = 'editorial-serif',
      titleCase = 'uppercase',
      accentColor = 'crimson',
      overlayOpacity = 0.55,
      order = 1,
      enabled = true,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Slide title is required' }, { status: 400 });
    }

    if (!imageUrl || !imageUrl.trim()) {
      return NextResponse.json({ error: 'Slide image URL or upload is required' }, { status: 400 });
    }

    const newSlide = createHeroSlide({
      title: title.trim(),
      subtitle: subtitle?.trim() || '',
      tagline: tagline?.trim() || '',
      description: description?.trim() || '',
      imageUrl: imageUrl.trim(),
      category: category?.trim() || 'fashion',
      buttonText: buttonText?.trim() || 'Explore Series',
      buttonLink: buttonLink?.trim() || '#work',
      secondaryButtonText: secondaryButtonText?.trim() || '',
      secondaryButtonLink: secondaryButtonLink?.trim() || '',
      textAlignment: ['left', 'center', 'right'].includes(textAlignment) ? textAlignment : 'left',
      fontStyle: ['editorial-serif', 'modern-sans'].includes(fontStyle) ? fontStyle : 'editorial-serif',
      titleCase: ['uppercase', 'titlecase'].includes(titleCase) ? titleCase : 'uppercase',
      accentColor: ['crimson', 'red', 'white', 'gold'].includes(accentColor) ? accentColor : 'crimson',
      overlayOpacity: typeof overlayOpacity === 'number' ? overlayOpacity : 0.55,
      order: typeof order === 'number' ? order : 1,
      enabled: Boolean(enabled),
    });

    return NextResponse.json({ success: true, slide: newSlide }, { status: 201 });
  } catch (error) {
    console.error('Error creating hero slide:', error);
    return NextResponse.json({ error: 'Failed to create hero slide' }, { status: 500 });
  }
}
