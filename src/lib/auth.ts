import { getServerSession as nextAuthGetServerSession } from 'next-auth/next';
import { type AuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter"; 
import { db } from "@/lib/db";
import * as schema from '@/lib/db/schema';


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
  session: { strategy: 'jwt' },
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_HOST || 'localhost',
        port: Number(process.env.EMAIL_PORT || 1025),
        auth: {
          user: process.env.EMAIL_USER || 'user',
          pass: process.env.EMAIL_PASS || 'pass',
        },
      },
      from: process.env.EMAIL_FROM || 'test@example.com',
    }),
  ],
  callbacks: {
    async session({ session, token }: any) {
      if (session?.user) {
        if (token?.sub) session.user.id = token.sub as string;
        if (token?.name) session.user.name = token.name as string;
        if (token?.email) session.user.email = token.email as string;
        (session.user as any).role = (token as any)?.role ?? (session.user as any)?.role ?? 'user';
      }
      return session as Session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = (user as any).role ?? 'user';
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