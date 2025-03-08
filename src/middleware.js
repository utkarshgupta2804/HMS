import { NextResponse } from "next/server";
import * as jose from 'jose';

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // Don't protect the signin pages
  if (path === '/signin') {
    const token = request.cookies.get('token')?.value;
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        // Only redirect to dashboard if not an admin
        if (!['admin', 'superadmin'].includes(payload.role)) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/admin', request.url));
      } catch (error) {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Handle /admin/signin separately - always allow access
  if (path === '/admin/signin') {
    return NextResponse.next();
  }

  // Protect admin routes
  if (path.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/signin', request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      
      // Verify admin role
      if (!['admin', 'superadmin'].includes(payload.role)) {
        return NextResponse.redirect(new URL('/admin/signin', request.url));
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('user', JSON.stringify(payload));
      requestHeaders.set('userId', payload.userId);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/signin', request.url));
    }
  }

  // Protect dashboard route
  if (path === '/dashboard') {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('user', JSON.stringify(payload));
      requestHeaders.set('userId', payload._id);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/signin', '/admin/:path*']
};
