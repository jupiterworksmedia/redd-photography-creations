import { NextRequest, NextResponse } from 'next/server';
import { getSeoSettings, updateSeoSettings } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const seo = getSeoSettings();
    return NextResponse.json({ success: true, seo });
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    return NextResponse.json({ error: 'Failed to retrieve SEO settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    const { updates } = body;

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
    }

    // Sanitize string arrays if keywords passed
    if (updates.keywords && Array.isArray(updates.keywords)) {
      updates.keywords = updates.keywords
        .map((k: string) => String(k).trim())
        .filter((k: string) => k.length > 0);
    }

    const updated = updateSeoSettings(updates);
    return NextResponse.json({
      success: true,
      message: 'SEO & Analytics settings updated successfully',
      seo: updated,
    });
  } catch (error) {
    console.error('Error updating SEO settings:', error);
    return NextResponse.json({ error: 'Failed to update SEO settings' }, { status: 500 });
  }
}
