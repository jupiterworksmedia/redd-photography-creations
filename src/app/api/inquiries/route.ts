import { NextRequest, NextResponse } from 'next/server';
import { getInquiries, createInquiry } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth';
import { CategoryType } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const inquiries = getInquiries(status);
    return NextResponse.json({ success: true, count: inquiries.length, inquiries });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json({ error: 'Failed to retrieve inquiries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, category, preferredDate, location, budgetRange, message } = body;

    if (!name || !email || !category || !message) {
      return NextResponse.json(
        { error: 'Name, email, category, and message are required' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const created = createInquiry({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      category: (category.toLowerCase() as CategoryType) || 'portraits',
      preferredDate: preferredDate?.trim() || '',
      location: location?.trim() || '',
      budgetRange: budgetRange?.trim() || '',
      message: message.trim(),
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully. REDD Studio will be in touch shortly.',
      inquiryId: created.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}
