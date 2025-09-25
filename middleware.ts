import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = [/^\/(?!api|access|_next|favicon\.ico).*/];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hasCookie = req.cookies.get("ml_preview")?.value === "ok";

  const needsGuard = PROTECTED.some((re) => re.test(url.pathname));
  if (needsGuard && !hasCookie) {
    url.pathname = "/access";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|favicon.ico).*)"] };
