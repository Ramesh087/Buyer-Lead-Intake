import { z } from 'zod';

// ---------------- Enums ----------------
export const citySchema = z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']);
export const propertyTypeSchema = z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']);
export const bhkSchema = z.enum(['1', '2', '3', '4', 'Studio']);
export const purposeSchema = z.enum(['Buy', 'Rent']);
export const timelineSchema = z.enum(['0-3m', '3-6m', '>6m', 'Exploring']);
export const sourceSchema = z.enum(['Website', 'Referral', 'Walk-in', 'Call', 'Other']);
export const statusSchema = z.enum(['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped']);

// ---------------- Regex ----------------
const phoneRegex = /^\d{10,15}$/;

// ---------------- Base Schema (before refinements) ----------------
const baseBuyerSchema = z.object({
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be at most 80 characters')
    .trim(),

  email: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().email('Invalid email format').optional()
  ),

  phone: z.string()
    .regex(phoneRegex, 'Phone must be 10-15 digits')
    .transform((val) => val.replace(/\D/g, '')),

  city: citySchema,
  propertyType: propertyTypeSchema,
  bhk: bhkSchema.optional(),
  purpose: purposeSchema,

  budgetMin: z.preprocess(
    (val) => (val === '' || val === null || typeof val === 'undefined' ? undefined : Number(val)),
    z.number().int().positive('Budget must be positive').optional()
  ),

  budgetMax: z.preprocess(
    (val) => (val === '' || val === null || typeof val === 'undefined' ? undefined : Number(val)),
    z.number().int().positive('Budget must be positive').optional()
  ),

  timeline: timelineSchema,
  source: sourceSchema,
  status: statusSchema.default('New'),

  notes: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().max(1000, 'Notes must be at most 1000 characters').optional()
  ),

  tags: z.preprocess(
    (val) =>
      Array.isArray(val)
        ? val.filter((tag) => typeof tag === 'string' && tag.trim() !== '')
        : [],
    z.array(z.string()).optional().default([])
  ),
});

// ---------------- Buyer Schema (with refinements) ----------------
export const buyerSchema = baseBuyerSchema
  .refine(
    (data) =>
      !(['Apartment', 'Villa'].includes(data.propertyType) && !data.bhk),
    {
      message: 'BHK is required for Apartment and Villa properties',
      path: ['bhk'],
    }
  )
  .refine(
    (data) =>
      !(data.budgetMin && data.budgetMax && data.budgetMin > data.budgetMax),
    {
      message: 'Maximum budget must be greater than or equal to minimum budget',
      path: ['budgetMax'],
    }
  );

// ---------------- Create & Update Schemas ----------------
export const createBuyerSchema = buyerSchema;

export const updateBuyerSchema = baseBuyerSchema.partial().extend({
  id: z.string().uuid(),
  updatedAt: z.string().datetime().optional(),
});

// ---------------- Filters ----------------
export const buyerFiltersSchema = z.object({
  search: z.string().optional(),
  city: citySchema.optional(),
  propertyType: propertyTypeSchema.optional(),
  status: statusSchema.optional(),
  timeline: timelineSchema.optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.enum(['fullName', 'phone', 'city', 'propertyType', 'status', 'updatedAt']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ---------------- CSV Import Schema ----------------
export const csvBuyerSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().email().optional()
  ),
  phone: z.string().regex(phoneRegex),
  city: citySchema,
  propertyType: propertyTypeSchema,
  bhk: bhkSchema.optional().or(z.literal('')),
  purpose: purposeSchema,
  budgetMin: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().int().positive().optional()
  ),
  budgetMax: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().int().positive().optional()
  ),
  timeline: timelineSchema,
  source: sourceSchema,
  notes: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().max(1000).optional()
  ),
  tags: z.preprocess(
    (val) =>
      typeof val === 'string'
        ? val.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
    z.array(z.string()).optional().default([])
  ),
  status: statusSchema.default('New'),
})
  .refine(
    (data) =>
      !(['Apartment', 'Villa'].includes(data.propertyType) && !data.bhk),
    {
      message: 'BHK is required for Apartment and Villa properties',
      path: ['bhk'],
    }
  )
  .refine(
    (data) =>
      !(data.budgetMin && data.budgetMax && data.budgetMin > data.budgetMax),
    {
      message: 'Maximum budget must be greater than or equal to minimum budget',
      path: ['budgetMax'],
    }
  );

// ---------------- CSV Import Result ----------------
export const csvImportResultSchema = z.object({
  valid: z.array(z.any()),
  invalid: z.array(z.object({
    row: z.number(),
    data: z.any(),
    errors: z.array(z.string()),
  })),
});

// ---------------- Types ----------------
export type BuyerFormData = z.infer<typeof buyerSchema>;
export type CreateBuyerData = z.infer<typeof createBuyerSchema>;
export type UpdateBuyerData = z.infer<typeof updateBuyerSchema>;
export type BuyerFilters = z.infer<typeof buyerFiltersSchema>;
export type CSVBuyerData = z.infer<typeof csvBuyerSchema>;
export type CSVImportResult = z.infer<typeof csvImportResultSchema>;

// ---------------- Utilities ----------------
export function validateBuyer(data: unknown) {
  return buyerSchema.safeParse(data);
}

export function validateBuyerFilters(data: unknown) {
  return buyerFiltersSchema.safeParse(data);
}

export function validateCSVBuyer(data: unknown) {
  return csvBuyerSchema.safeParse(data);
}
