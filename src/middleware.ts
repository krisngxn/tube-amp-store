// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Apply to all routes except API routes and static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (Next.js internals)
     * - files with extensions (e.g., .png, .jpg, .svg)
     */
    '/((?!api|_next|.*\\..*).*)',
  ],
};
