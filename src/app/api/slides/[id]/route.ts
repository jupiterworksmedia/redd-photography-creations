import { NextRequest, NextResponse } from 'next/server';
import { getHeroSlideById, updateHeroSlide, deleteHeroSlide } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const slide = getHeroSlideById(params.id);
    if (!slide) {
      return NextResponse.json({ error: 'Hero slide not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, slide });
  } catch (error) {
    console.error('Error fetching hero slide:', error);
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
    const updated = updateHeroSlide(params.id, updates);

    if (!updated) {
      return NextResponse.json({ error: 'Hero slide not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, slide: updated });
  } catch (error) {
    console.error('Error updating hero slide:', error);
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

    const slide = getHeroSlideById(params.id);
    if (!slide) {
      return NextResponse.json({ error: 'Hero slide not found' }, { status: 404 });
    }

    const deleted = deleteHeroSlide(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Hero slide not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Hero slide deleted successfully' });
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
