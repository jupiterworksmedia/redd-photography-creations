import { NextRequest, NextResponse } from 'next/server';
import { getCategoryById, updateCategory, deleteCategory, getPhotos, persistDatabase } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = getCategoryById(params.id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const updates = await request.json();
    const updated = updateCategory(params.id, updates);

    if (!updated) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await persistDatabase().catch(() => {});
    try {
      revalidatePath('/', 'layout');
    } catch {}

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const cat = getCategoryById(params.id);
    if (!cat) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if photos are assigned to this category
    const allPhotos = getPhotos(undefined, undefined, true);
    const inUseCount = allPhotos.filter(
      (p) => p.category.toLowerCase() === cat.slug.toLowerCase()
    ).length;

    if (inUseCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete "${cat.label}". There are ${inUseCount} photo(s) currently assigned to this category. You can disable it instead!`,
        },
        { status: 400 }
      );
    }

    const deleted = deleteCategory(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Category not found or already deleted' }, { status: 404 });
    }

    await persistDatabase().catch(() => {});
    try {
      revalidatePath('/', 'layout');
    } catch {}

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
