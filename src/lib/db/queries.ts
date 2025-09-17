import { db } from './index';
import { buyers, buyerHistory, authUsers } from './schema';
import { eq, and, or, ilike, desc, asc, count } from 'drizzle-orm';
import type { BuyerFilters } from '@/lib/validations/buyer';

export async function getBuyers(filters: BuyerFilters, userId?: string) {
  const { search, city, propertyType, status, timeline, page, limit, sortBy, sortOrder } = filters;

  let query = db.select({
    id: buyers.id,
    fullName: buyers.fullName,
    email: buyers.email,
    phone: buyers.phone,
    city: buyers.city,
    propertyType: buyers.propertyType,
    bhk: buyers.bhk,
    purpose: buyers.purpose,
    budgetMin: buyers.budgetMin,
    budgetMax: buyers.budgetMax,
    timeline: buyers.timeline,
    source: buyers.source,
    status: buyers.status,
    notes: buyers.notes,
    tags: buyers.tags,
    ownerId: buyers.ownerId,
    createdAt: buyers.createdAt,
    updatedAt: buyers.updatedAt,
    owner: {
      id: users.id,
      name: users.name,
      email: users.email,
    },
  }).from(buyers).leftJoin(authUsers, eq(buyers.ownerId, authUsers.id)) as any;

  // Apply filters
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(buyers.fullName, `%${search}%`),
        ilike(buyers.phone, `%${search}%`),
        ilike(buyers.email, `%${search}%`),
        ilike(buyers.notes, `%${search}%`)
      )
    );
  }

  if (city) conditions.push(eq(buyers.city, city));
  if (propertyType) conditions.push(eq(buyers.propertyType, propertyType));
  if (status) conditions.push(eq(buyers.status, status));
  if (timeline) conditions.push(eq(buyers.timeline, timeline));

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  // Apply sorting
  const sortColumn = sortBy ? (buyers as any)[sortBy] : undefined;
  if (sortColumn) {
    query = query.orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn));
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  const results = await query.limit(limit).offset(offset);

  // Get total count
  let countQuery:any = db.select({ count: count() }).from(buyers);
  if (conditions.length > 0) {
    countQuery = countQuery.where(and(...conditions));
  }
  const totalResult = await countQuery;
  const total = totalResult[0]?.count || 0;

  return {
    data: results,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getBuyer(id: string) {
  const result = await db.select({
    id: buyers.id,
    fullName: buyers.fullName,
    email: buyers.email,
    phone: buyers.phone,
    city: buyers.city,
    propertyType: buyers.propertyType,
    bhk: buyers.bhk,
    purpose: buyers.purpose,
    budgetMin: buyers.budgetMin,
    budgetMax: buyers.budgetMax,
    timeline: buyers.timeline,
    source: buyers.source,
    status: buyers.status,
    notes: buyers.notes,
    tags: buyers.tags,
    ownerId: buyers.ownerId,
    createdAt: buyers.createdAt,
    updatedAt: buyers.updatedAt,
    owner: {
      id: authUsers.id,
      name: authUsers.name,
      email: authUsers.email,
    },
  })
  .from(buyers)
  .leftJoin(authUsers, eq(buyers.ownerId, authUsers.id))
  .where(eq(buyers.id, id))
  .limit(1);

  return result[0] || null;
}

export async function createBuyer(data: any, ownerId: string) {
  const [buyer] = await db.insert(buyers).values({
    ...data,
    ownerId,
    updatedAt: new Date(),
  }).returning();

  // Create history entry
  await db.insert(buyerHistory).values({
    buyerId: buyer.id,
    changedBy: ownerId,
    changedAt: new Date(),
    diff: { created: { old: null, new: data } },
  });

  return buyer;
}

export async function updateBuyer(id: string, data: any, userId: string, oldData: any) {
  const [buyer] = await db.update(buyers)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(buyers.id, id))
    .returning();

  // Calculate diff
  const diff: Record<string, { old: any; new: any }> = {};
  for (const key in data) {
    if (data[key] !== oldData[key]) {
      diff[key] = { old: oldData[key], new: data[key] };
    }
  }

  if (Object.keys(diff).length > 0) {
    await db.insert(buyerHistory).values({
      buyerId: id,
      changedBy: userId,
      changedAt: new Date(),
      diff,
    });
  }

  return buyer;
}

export async function deleteBuyer(id: string) {
  await db.delete(buyers).where(eq(buyers.id, id));
}

export async function getBuyerHistory(buyerId: string) {
  const result = await db.select({
    id: buyerHistory.id,
    changedAt: buyerHistory.changedAt,
    diff: buyerHistory.diff,
    changedBy: {
      id: authUsers.id,
      name: authUsers.name,
      email: authUsers.email,
    },
  })
  .from(buyerHistory)
  .leftJoin(authUsers, eq(buyerHistory.changedBy, authUsers.id))
  .where(eq(buyerHistory.buyerId, buyerId))
  .orderBy(desc(buyerHistory.changedAt))
  .limit(5);

  return result;
}

export async function getBuyersStats(userId?: string) {
  const conditions = userId ? [eq(buyers.ownerId, userId)] : [];
  
  const statsQuery = db.select({
    status: buyers.status,
    count: count(),
  })
  .from(buyers)
  .groupBy(buyers.status);

  if (conditions.length > 0) {
    statsQuery.where(and(...conditions));
  }

  const stats = await statsQuery;
  const total = stats.reduce((sum, stat) => sum + stat.count, 0);

  return { stats, total };
}