import { NextResponse } from "next/server";
import type { NextAuthConfig } from "next-auth";

// Edge-safe half of the Auth.js config: no providers here, since the
// Credentials provider (bcrypt + Prisma) needs the Node.js runtime and this
// config is also used by middleware, which runs on the Edge runtime. The
// full config (src/lib/auth.ts) adds the Credentials provider on top of this.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      email: string;
      name?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    isAdmin: boolean;
  }
}

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      if (!auth?.user) return false;
      if (request.nextUrl.pathname.startsWith("/admin") && !auth.user.isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.isAdmin = Boolean((user as { isAdmin?: boolean }).isAdmin);
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.isAdmin = token.isAdmin;
      return session;
    },
  },
} satisfies NextAuthConfig;
