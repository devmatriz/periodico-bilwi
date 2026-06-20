import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { validateAdminCredentials } from "@/lib/admin-auth-store";

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "bilwi-noticias-dev-secret";

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  secret: AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Administrador",
      credentials: {
        email: { label: "Correo electronico", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString();
        return validateAdminCredentials(email, password);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "admin";
        token.name = user.name;
        token.email = user.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name || session.user.name;
        session.user.email = token.email || session.user.email;
        session.user.role = token.role || "admin";
      }

      return session;
    },
  },
});
