import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginWithApi } from "@/lib/api/server-auth";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
        mfaCode: { label: "Código MFA", type: "text" },
      },
      authorize: async (raw) => {
        const email = String(raw?.email ?? "").trim().toLowerCase();
        const password = String(raw?.password ?? "");
        const mfaCode = raw?.mfaCode ? String(raw?.mfaCode) : undefined;

        if (!email || !password) return null;

        const result = await loginWithApi({ email, password, mfaCode });
        if (!result) return null;

        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.full_name,
          role: result.user.role,
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
