import { getBuyers } from '@/lib/db/queries';
import { buyerFiltersSchema } from '@/lib/validations/buyer';
import { BuyersTableClient } from './buyers-table-client';
import { Pagination } from '@/components/ui/pagination';

interface BuyersTableProps {
  searchParams: any;
  userId: string;
}

export async function BuyersTable({ searchParams, userId }: BuyersTableProps) {
  const filters = buyerFiltersSchema.parse({
    search: searchParams.search,
    city: searchParams.city,
    propertyType: searchParams.propertyType,
    status: searchParams.status,
    timeline: searchParams.timeline,
    page: parseInt(searchParams.page || '1'),
    limit: parseInt(searchParams.limit || '10'),
    sortBy: searchParams.sortBy || 'updatedAt',
    sortOrder: searchParams.sortOrder || 'desc',
  });

  const result = await getBuyers(filters);

  return (
    <div className="space-y-4">
      <BuyersTableClient data={result.data} userId={userId} />
      <Pagination
        currentPage={result.page}
        totalPages={result.totalPages}
        totalItems={result.total}
      />
    </div>
  );
}