import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory, getCategoryBySlug, persistDatabase } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDisabled = searchParams.get('all') === 'true';

    // If requesting disabled categories, check admin session
    if (includeDisabled) {
      const session = await getCurrentAdminSession();
      if (!session) {
        // Fall back to enabled only if unauthorized
        const categories = getCategories(false);
        return NextResponse.json({ success: true, count: categories.length, categories });
      }
    }

    const categories = getCategories(includeDisabled);
    return NextResponse.json({ success: true, count: categories.length, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to retrieve categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    const { label, slug, description, enabled = true, order = 10 } = body;

    if (!label) {
      return NextResponse.json({ error: 'Category label is required' }, { status: 400 });
    }

    // Generate or clean slug
    const cleanSlug = (slug || label)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-');

    if (!cleanSlug) {
      return NextResponse.json({ error: 'Valid category identifier (slug) is required' }, { status: 400 });
    }

    // Check for duplicate slug
    const existing = getCategoryBySlug(cleanSlug);
    if (existing) {
      return NextResponse.json(
        { error: `Category with slug "${cleanSlug}" already exists.` },
        { status: 409 }
      );
    }

    const newCategory = createCategory({
      label: label.trim(),
      slug: cleanSlug,
      description: description?.trim() || '',
      enabled: Boolean(enabled),
      order: typeof order === 'number' ? order : 10,
    });

    await persistDatabase().catch(() => {});
    try {
      revalidatePath('/', 'layout');
    } catch {}

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
