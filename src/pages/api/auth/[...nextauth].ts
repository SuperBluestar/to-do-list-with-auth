import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { verify } from "argon2";
import { env } from "../../../env/server.mjs";
import { User } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.id) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      return token;
    },
    session({ session, user, token }) {
      if (user) {
        session.user = user;
      } else if (token) {
        session.user = {
          //@ts-ignore
          id: token.id,
          email: token.email,
          name: token.name,
        }
      }
      return session;
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "temp@xyz.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email && credentials.password) {
          let existing: User | null | undefined;
          try {
            existing = await prisma.user.findUnique({ where: { email: credentials.email }})
            if (!existing) return null;
          } catch (err: any) {
            return null;
          }
          try {
            const isValidCredential = await verify(existing.password, credentials.password);
            if (!isValidCredential) return null;
          } catch (err: any) {
            return null;
          }
          return {
            id: existing.id,
            email: existing.email,
            name: existing.name,
          } as User;
        } else {
          return null;
        }
      },
    })
    // DiscordProvider({
    //   clientId: env.DISCORD_CLIENT_ID,
    //   clientSecret: env.DISCORD_CLIENT_SECRET,
    // }),
    // ...add more providers here
  ],
  jwt: {
    secret: env.NEXTAUTH_SECRET,
    maxAge: 15 * 24 * 30 * 60, // 15 days
  },
  session: {
    strategy: 'jwt',
  },
};

export default NextAuth(authOptions);
