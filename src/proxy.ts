import { NextRequest, NextResponse } from "next/server";
import { readVerifiedSession } from "./server/session";
/** Early denial prevents streaming a protected shell before a layout redirect.
 * Layout and data access repeat authorization; never rely on this alone. */
export async function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/wireframes") &&
    process.env.NODE_ENV !== "development"
  ) {
    return new NextResponse(null, { status: 404 });
  }
  if (
    request.nextUrl.pathname === "/area" ||
    request.nextUrl.pathname.startsWith("/area/")
  ) {
    if (!(await readVerifiedSession()))
      return NextResponse.redirect(new URL("/entrar?expirado=1", request.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ["/area/:path*", "/wireframes/:path*"] };
