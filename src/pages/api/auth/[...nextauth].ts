import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { env } from "../../../env/server.mjs";
import Credentials from "next-auth/providers/credentials";
import crpyto from "crypto";

const waAuthRoute = "http://localhost:5500/auth/phone";

export const authOptions: NextAuthOptions = {
    // Include user.id on session
    callbacks: {
        session({ session, user, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.phone = token.phone as string;
            }
            return session;
        },
        jwt({ token, user }) {
            if (user) {
                token.phone = user.phone;
                token.id = user.id;
            }

            return token;
        },
    },
    session: {
        strategy: "jwt",
    },
    // Configure one or more authentication providers
    adapter: PrismaAdapter(prisma),
    providers: [
        DiscordProvider({
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
        }),
        Credentials({
            name: "WhatsApp",
            credentials: {
                phone: { label: "Phone", type: "text", placeholder: "05XXXXXXXX" },
            },
            async authorize(credentials, req) {
                const phone = credentials?.phone;
                if (!phone) return null;

                const result = await fetch(waAuthRoute, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ phone }),
                });

                if (result.status === 200) {
                    const j = await result.json();
                    return j.user;
                }

                return null;
            },
        }),
    ],
};

export default NextAuth(authOptions);
