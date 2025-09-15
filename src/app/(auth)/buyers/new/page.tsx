import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { BuyerForm } from '@/components/buyers/buyer-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewBuyerPage() {
  // Get session using your helper
  const session = await getServerSession();

  // Redirect if no session or user
  if (!session || !session.user) {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/buyers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Lead</h1>
          <p className="text-muted-foreground">
            Create a new buyer lead entry
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <BuyerForm userId={session.user.id} />
      </div>
    </div>
  );
}
