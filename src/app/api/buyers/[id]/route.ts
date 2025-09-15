import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getBuyer, updateBuyer, deleteBuyer } from '@/lib/db/queries';
import { updateBuyerSchema } from '@/lib/validations/buyer';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const buyer = await getBuyer(params.id);
    
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    return NextResponse.json(buyer);
  } catch (error) {
    console.error('Error fetching buyer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buyer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const buyer = await getBuyer(params.id);
    
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Check ownership
    if (buyer.ownerId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateBuyerSchema.parse(body);
    
    // Check for concurrent updates
    if (validatedData.updatedAt && buyer.updatedAt.toISOString() !== validatedData.updatedAt) {
      return NextResponse.json(
        { error: 'Record has been modified by another user. Please refresh and try again.' },
        { status: 409 }
      );
    }

    const { id, updatedAt, ...updateData } = validatedData;
    const updatedBuyer = await updateBuyer(params.id, updateData, session.user.id, buyer);
    
    return NextResponse.json(updatedBuyer);
  } catch (error) {
    console.error('Error updating buyer:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update buyer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const buyer = await getBuyer(params.id);
    
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Check ownership
    if (buyer.ownerId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteBuyer(params.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting buyer:', error);
    return NextResponse.json(
      { error: 'Failed to delete buyer' },
      { status: 500 }
    );
  }
}