// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// chỉ áp dụng cho route cần thiết
export const config = {
  matcher: ["/admin/:path*"],
};
