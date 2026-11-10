import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";
import type { UserRole } from "@vitalia/shared-types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
    accessToken: string;
    refreshToken: string;
  }

  interface User {
    id: string;
    role: UserRole;
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    accessToken: string;
    refreshToken: string;
  }
}
