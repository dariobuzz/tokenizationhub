import type { NextAuthOptions } from "next-auth";

export const authConfig = {
  providers: [
    // Add your authentication providers here
    // Example:
    // CredentialsProvider({...})
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        
        // Check if the user email is the admin email
        if (user.email === "dariobalmas77@gmail.com") {
          token.isAdmin = true;
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token?.id) {
        session.user.id = token.id;
      }
      
      // Pass the admin flag to the session
      session.user.isAdmin = !!token.isAdmin;
      
      return session;
    },
  },
} satisfies NextAuthOptions;