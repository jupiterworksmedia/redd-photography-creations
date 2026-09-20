import { NextRequest, NextResponse } from 'next/server';
import { getPhotos, createPhoto } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth';
import { CategoryType } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const featured = searchParams.get('featured') === 'true';

    const photos = getPhotos(category, featured);
    return NextResponse.json({ success: true, count: photos.length, photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ error: 'Failed to retrieve photos' }, { status: 500 });
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
      category,
      imageUrl,
      thumbnailUrl,
      aspectRatio,
      client,
      story,
      year,
      location,
      camera,
      lens,
      aperture,
      shutterSpeed,
      iso,
      featured,
      order,
    } = body;

    if (!title || !category || !imageUrl) {
      return NextResponse.json(
        { error: 'Title, category, and image URL are required' },
        { status: 400 }
      );
    }

    const validCategories: CategoryType[] = ['fashion', 'boudoir', 'portraits', 'events', 'commercial'];
    if (!validCategories.includes(category.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    const created = createPhoto({
      title: title.trim(),
      category: category.toLowerCase() as CategoryType,
      imageUrl: imageUrl.trim(),
      thumbnailUrl: thumbnailUrl?.trim() || imageUrl.trim(),
      aspectRatio: aspectRatio || 'tall',
      client: client?.trim() || '',
      story: story?.trim() || '',
      year: year?.trim() || new Date().getFullYear().toString(),
      location: location?.trim() || '',
      camera: camera?.trim() || '',
      lens: lens?.trim() || '',
      aperture: aperture?.trim() || '',
      shutterSpeed: shutterSpeed?.trim() || '',
      iso: iso?.trim() || '',
      featured: Boolean(featured),
      order: typeof order === 'number' ? order : 99,
    });

    return NextResponse.json({ success: true, photo: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating photo:', error);
    return NextResponse.json({ error: 'Failed to create photo' }, { status: 500 });
  }
}
