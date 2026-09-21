import { NextRequest, NextResponse } from 'next/server';
import { getServicesSettings, updateServicesSettings, persistDatabase } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_request: NextRequest) {
  try {
    const services = getServicesSettings();
    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error('Error fetching services page settings:', error);
    return NextResponse.json({ error: 'Failed to retrieve services page settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    const updates = body.updates || body.servicesUpdates || body;

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
    }

    const updated = updateServicesSettings(updates);

    await persistDatabase().catch((err) => {
      console.warn('[Services API] Background GitHub persist failed:', err);
    });

    try {
      revalidatePath('/services');
      revalidatePath('/');
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Services page settings updated successfully',
      services: updated,
    });
  } catch (error) {
    console.error('Error updating services page settings:', error);
    return NextResponse.json({ error: 'Failed to update services page settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return PUT(request);
}

export async function PATCH(request: NextRequest) {
  return PUT(request);
}
