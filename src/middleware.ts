// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale } from './config/locales';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Set default locale cookie if not present (for root route)
  const localeCookie = request.cookies.get('NEXT_LOCALE');
  if (!localeCookie && request.nextUrl.pathname === '/') {
    response.cookies.set('NEXT_LOCALE', defaultLocale, { 
      path: '/', 
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }
  
  return response;
}

// Apply to all routes except API routes and static files
export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ],
};
