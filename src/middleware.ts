// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next();
    
    // Set default locale cookie if not present (for root route)
    const localeCookie = request.cookies.get('NEXT_LOCALE');
    if (!localeCookie && request.nextUrl.pathname === '/') {
      response.cookies.set('NEXT_LOCALE', 'vi', { 
        path: '/', 
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
    }
    
    return response;
  } catch (error) {
    // If anything fails, just return a basic response
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// Apply to all routes except API routes and static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (e.g., .png, .jpg, .svg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
