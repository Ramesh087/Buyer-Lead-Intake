import { getServerSession as nextAuthGetServerSession } from 'next-auth/next';
import { Token } from "nodemailer/lib/xoauth2";
import { type AuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter"; 
import { db } from "@/lib/db";


export type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

// Define your Session type
export type Session = {
  user: AuthUser;
  expires: string;
};


export const authOptions: AuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({
      session,
      token,
    }: {
      session: Session;
      token: any;
    }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.name = token.name!;
        session.user.email = token.email!;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        (token as any).role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
    verifyRequest: "/auth/verify",
  },
};


export async function getServerSession(): Promise<Session | null> {
  const session = await nextAuthGetServerSession(authOptions);
  if (!session?.user) return null;
  if (!session.user.role) session.user.role = 'user';
  return session as Session;
 }