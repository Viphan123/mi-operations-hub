import { NextRequest, NextResponse } from "next/server";

const legacyBasePath = "/mi-operations-hub";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname !== legacyBasePath && !pathname.startsWith(`${legacyBasePath}/`)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname.slice(legacyBasePath.length) || "/";
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/mi-operations-hub/:path*"],
};
