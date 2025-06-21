import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Extend the session type to include id
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

const prisma = new PrismaClient();

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      // In the authorize function of your CredentialsProvider
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
      
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
      
        if (!user || !user.password) {
          return null;
        }
      
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
      
        if (!isPasswordValid) {
          return null;
        }
      
        // Map fullName to name for NextAuth
        return {
          id: user.id,
          email: user.email,
          name: user.fullName // This maps fullName from your DB to name in NextAuth
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login", // Error code passed in query string as ?error=
  },
  callbacks: {
    async jwt({ token, user }) {
      // When signing in, pass user data to token
      if (user) {
        token.id = user.id;
        token.name = user.name; // This will be the fullName from your DB
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.name = token.name as string; // Ensure name is passed to session
      }
      return session;
    },
    async redirect({ url, baseUrl }): Promise<string> {
      // Redirect to dashboard after sign in
      return url.startsWith(baseUrl) ? url : `${baseUrl}/dashboard`;
    }
  }
});

export { handler as GET, handler as POST };