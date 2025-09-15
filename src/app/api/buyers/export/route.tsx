import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBuyers } from '@/lib/db/queries';
import { buyerFiltersSchema } from '@/lib/validations/buyer';
import Papa from 'papaparse';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      search: searchParams.get('search') || undefined,
      city: searchParams.get('city') || undefined,
      propertyType: searchParams.get('propertyType') || undefined,
      status: searchParams.get('status') || undefined,
      timeline: searchParams.get('timeline') || undefined,
      page: 1, // Export all matching records
      limit: 1000, // Set a reasonable max limit
      sortBy: searchParams.get('sortBy') || 'updatedAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedFilters = buyerFiltersSchema.parse(filters);
    const result = await getBuyers(validatedFilters);

    // Transform data for CSV export
    const csvData = result.data.map((buyer: { fullName: any; email: any; phone: any; city: any; propertyType: any; bhk: any; purpose: any; budgetMin: any; budgetMax: any; timeline: any; source: any; status: any; tags: any[]; notes: any; createdAt: string | number | Date; updatedAt: string | number | Date; }) => ({
      'Full Name': buyer.fullName,
      'Email': buyer.email || '',
      'Phone': buyer.phone,
      'City': buyer.city,
      'Property Type': buyer.propertyType,
      'BHK': buyer.bhk || '',
      'Purpose': buyer.purpose,
      'Budget Min': buyer.budgetMin || '',
      'Budget Max': buyer.budgetMax || '',
      'Timeline': buyer.timeline,
      'Source': buyer.source,
      'Status': buyer.status,
      'Tags': buyer.tags?.join(', ') || '',
      'Notes': buyer.notes || '',
      'Created Date': new Date(buyer.createdAt).toLocaleDateString(),
      'Updated Date': new Date(buyer.updatedAt).toLocaleDateString(),
    }));

    const csv = Papa.unparse(csvData);
    
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="buyers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting buyers:', error);
    return NextResponse.json(
      { error: 'Failed to export buyers' },
      { status: 500 }
    );
  }
}