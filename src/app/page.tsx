import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth'; // use your custom helper
import { SignInButton } from '@/components/auth/signin-button';

export default async function HomePage() {
  const session = await getServerSession();

  // Redirect if user is already signed in
  if (session && session.user) {
    redirect('/buyers');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Buyer Lead Intake
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Manage your real estate leads efficiently
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <SignInButton />
        </div>
      </div>
    </div>
  );
}
