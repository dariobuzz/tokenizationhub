import NextAuth from "next-auth";
import { authConfig } from '@/auth.config';

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  jwt: {
    // Remove the encryption property as it's not supported
    // JWT encryption is handled automatically by NextAuth
  },
});