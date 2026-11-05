import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { validateAdminCredentials } from "@/lib/user-store";
import { getAuthSecret } from "@/lib/production-env";

const AUTH_SECRET = getAuthSecret();

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  secret: AUTH_SECRET,
  // Sitio autoalojado (next start / proxy propio): Auth.js v5 rechaza el host en producción si no se declara confiable.
  trustHost: true,
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
        session.user.name = typeof token.name === "string" && token.name ? token.name : session.user.name;
        session.user.email = typeof token.email === "string" && token.email ? token.email : session.user.email;
        session.user.role = typeof token.role === "string" && token.role ? token.role : "admin";
      }

      return session;
    },
  },
});
