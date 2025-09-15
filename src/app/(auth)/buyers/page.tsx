import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { BuyersTable } from '@/components/buyers/buyers-table';
import { BuyersFilters } from '@/components/buyers/buyers-filter';
import { BuyersStats } from '@/components/buyers/buyers-stats';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface SearchParams {
  search?: string;
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
  page?: string;
  sortBy?: string;
  sortOrder?: string;
}

export default async function BuyersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Get session using your helper
  const session = await getServerSession();

  // Redirect if no session or no user
  if (!session || !session.user) {
    redirect('/');
  }

  const userId = session.user.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buyer Leads</h1>
          <p className="text-muted-foreground">
            Manage and track your real estate buyer leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/buyers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <BuyersStats userId={userId} />
      </Suspense>

      <div className="space-y-4">
        <BuyersFilters />
        <Suspense fallback={<div>Loading buyers...</div>}>
          <BuyersTable searchParams={searchParams} userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}
