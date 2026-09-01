import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Uses the edge-safe partial config (no Credentials/Prisma) so this can run
// on the Edge runtime — see src/lib/auth.config.ts for why it's split out.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/dashboard/:path*", "/servers/:path*", "/tools/:path*", "/admin/:path*"],
};
