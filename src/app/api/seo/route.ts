import { NextRequest, NextResponse } from 'next/server';
import { getSeoSettings, updateSeoSettings, persistDatabase } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_request: NextRequest) {
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

    await persistDatabase().catch(() => {});
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/robots.txt');
      revalidatePath('/sitemap.xml');
      revalidatePath('/llms.txt');
    } catch {}

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

export async function POST(request: NextRequest) {
  return PUT(request);
}

export async function PATCH(request: NextRequest) {
  return PUT(request);
}
