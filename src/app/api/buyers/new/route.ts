import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createBuyer } from '@/lib/db/queries';
import { createBuyerSchema } from '@/lib/validations/buyer';
import { z } from 'zod';

// Rate limiting storage (in production, use Redis)
const rateLimitMap = new Map();

// Simple rate limiting function
function rateLimit(identifier: string, limit: number = 10, windowMs: number = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, []);
  }
  
  const requests = rateLimitMap.get(identifier);
  
  // Remove old requests outside the window
  const validRequests = requests.filter((time: number) => time > windowStart);
  rateLimitMap.set(identifier, validRequests);
  
  if (validRequests.length >= limit) {
    return false;
  }
  
  validRequests.push(now);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = session.user.id || session.user.email || 'unknown';
    if (!rateLimit(identifier, 10, 60000)) { // 10 requests per minute
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate the request body
    const validatedData = createBuyerSchema.parse(body);
    
    // Create the buyer
    const buyer = await createBuyer(validatedData, session.user.id);
    
    return NextResponse.json(buyer, { status: 201 });
  } catch (error) {
    console.error('Error creating buyer:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('unique constraint')) {
        return NextResponse.json(
          { error: 'A lead with this email or phone already exists.' },
          { status: 409 }
        );
      }
      
      if (error.message.includes('foreign key constraint')) {
        return NextResponse.json(
          { error: 'Invalid user reference.' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create buyer lead. Please try again.' },
      { status: 500 }
    );
  }
}

// Allow only POST method
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}