// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'user' | 'admin';
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role: 'user' | 'admin';
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}
