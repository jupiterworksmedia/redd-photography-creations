import { NextRequest, NextResponse } from 'next/server';
import { getAboutSettings, updateAboutSettings, persistDatabase } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_request: NextRequest) {
  try {
    const about = getAboutSettings();
    return NextResponse.json({ success: true, about });
  } catch (error) {
    console.error('Error fetching about page settings:', error);
    return NextResponse.json({ error: 'Failed to retrieve about page settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    const updates = body.updates || body.aboutUpdates || body;

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
    }

    const updated = updateAboutSettings(updates);

    await persistDatabase().catch((err) => {
      console.warn('[About API] Background GitHub persist failed:', err);
    });

    try {
      revalidatePath('/about');
      revalidatePath('/');
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'About page settings updated successfully',
      about: updated,
    });
  } catch (error) {
    console.error('Error updating about page settings:', error);
    return NextResponse.json({ error: 'Failed to update about page settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return PUT(request);
}

export async function PATCH(request: NextRequest) {
  return PUT(request);
}
