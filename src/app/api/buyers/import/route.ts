import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createBuyer } from '@/lib/db/queries';
import { csvBuyerSchema } from '@/lib/validations/buyer';
import Papa from 'papaparse';

const MAX_ROWS = 200;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep as strings for validation
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV parsing failed', details: parseResult.errors },
        { status: 400 }
      );
    }

    const rows = parseResult.data as any[];
    
    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `Too many rows. Maximum ${MAX_ROWS} allowed.` },
        { status: 400 }
      );
    }

    const results = {
      valid: [] as any[],
      invalid: [] as any[],
    };

    // Validate each row
    rows.forEach((row, index) => {
      const validation = csvBuyerSchema.safeParse(row);
      
      if (validation.success) {
        results.valid.push(validation.data);
      } else {
        results.invalid.push({
          row: index + 1,
          data: row,
          errors: validation.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ),
        });
      }
    });

    // If there are validation errors, return them without importing
    if (results.invalid.length > 0) {
      return NextResponse.json({
        error: 'Validation errors found',
        results,
      }, { status: 400 });
    }

    // Import all valid rows in a transaction
    const importedBuyers = [];
    for (const buyerData of results.valid) {
      try {
        const buyer = await createBuyer(buyerData, session.user.id);
        importedBuyers.push(buyer);
      } catch (error) {
        console.error('Error importing buyer:', error);
        // In a real transaction, this would rollback all changes
        return NextResponse.json(
          { error: 'Import failed during database operation' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedBuyers.length,
      buyers: importedBuyers,
    });

  } catch (error) {
    console.error('Error importing CSV:', error);
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}