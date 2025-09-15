import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, buyers } from './schema';

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client); // No schema object needed here

async function seed() {
  console.log('Seeding database...');

  // Insert test user
  const [testUser] = await db
    .insert(users)
    .values({
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    })
    .returning();

  // Sample buyers
  const sampleBuyers = [
    {
      fullName: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '9876543210',
      city: 'Chandigarh' as const,
      propertyType: 'Apartment' as const,
      bhk: '3' as const,
      purpose: 'Buy' as const,
      budgetMin: 5000000,
      budgetMax: 7000000,
      timeline: '0-3m' as const,
      source: 'Website' as const,
      status: 'New' as const,
      notes: 'Looking for a 3BHK apartment in sector 22',
      tags: ['urgent', 'high-budget'],
      ownerId: testUser.id,
    },
    {
      fullName: 'Priya Sharma',
      phone: '9876543211',
      city: 'Mohali' as const,
      propertyType: 'Villa' as const,
      bhk: '4' as const,
      purpose: 'Buy' as const,
      budgetMin: 8000000,
      budgetMax: 12000000,
      timeline: '3-6m' as const,
      source: 'Referral' as const,
      status: 'Qualified' as const,
      notes: 'Referred by existing client. Wants independent villa.',
      tags: ['referral', 'qualified'],
      ownerId: testUser.id,
    },
    {
      fullName: 'Amit Singh',
      email: 'amit@example.com',
      phone: '9876543212',
      city: 'Zirakpur' as const,
      propertyType: 'Plot' as const,
      purpose: 'Buy' as const,
      budgetMin: 2000000,
      budgetMax: 3000000,
      timeline: '>6m' as const,
      source: 'Walk-in' as const,
      status: 'Contacted' as const,
      notes: 'Interested in residential plot for future construction',
      tags: ['plot', 'future-construction'],
      ownerId: testUser.id,
    },
    {
      fullName: 'Neha Gupta',
      email: 'neha@example.com',
      phone: '9876543213',
      city: 'Panchkula' as const,
      propertyType: 'Office' as const,
      purpose: 'Rent' as const,
      budgetMin: 50000,
      budgetMax: 80000,
      timeline: '0-3m' as const,
      source: 'Call' as const,
      status: 'Visited' as const,
      notes: 'Needs office space for IT startup',
      tags: ['commercial', 'startup'],
      ownerId: testUser.id,
    },
  ];

  await db.insert(buyers).values(sampleBuyers);

  console.log('Seeding completed! ✅');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
