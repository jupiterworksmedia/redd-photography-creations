import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'redd-photography-creations-ultra-secret-jwt-key-2024-998811';
const secretKey = new TextEncoder().encode(JWT_SECRET);
const AUTH_COOKIE_NAME = 'redd_admin_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If already logged in and visiting /admin/login, redirect to /admin
  if (pathname === '/admin/login') {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secretKey);
        if (payload.role === 'admin') {
          const adminUrl = request.nextUrl.clone();
          adminUrl.pathname = '/admin';
          adminUrl.search = '';
          return NextResponse.redirect(adminUrl);
        }
      } catch {
        // Invalid token; let them see login page
      }
    }
    return NextResponse.next();
  }

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);
      if (payload.role !== 'admin') {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/admin/login';
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
