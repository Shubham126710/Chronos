import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.svg (svg favicon)
     * - images (static images)
     * - auth (legacy auth paths)
     * - login (login page)
     * - signup (signup page)
     * - / (landing page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|images|auth|login|signup|$).*)",
  ],
};
