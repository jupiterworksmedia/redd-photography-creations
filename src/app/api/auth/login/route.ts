import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log(`[AUTH] Login attempt received for: ${email}`);

    if (!email || !password) {
      console.warn('[AUTH] Login failed: Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const authResult = await authenticateAdmin(email, password);
    if (!authResult.success) {
      console.warn(`[AUTH] Authentication rejected: ${authResult.error}`);
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      email: email.trim().toLowerCase(),
      name: 'REDD Director',
      role: 'admin',
    });

    console.log(`[AUTH] Authentication successful for: ${email.trim().toLowerCase()}`);

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        email: email.trim().toLowerCase(),
        name: 'REDD Director',
      },
    });

    // Only mark secure if actually on HTTPS
    const isHttps =
      request.headers.get('x-forwarded-proto') === 'https' ||
      request.nextUrl.protocol === 'https:';

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: isHttps,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('[AUTH] Login server error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred' },
      { status: 500 }
    );
  }
}
