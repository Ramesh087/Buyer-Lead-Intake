import { validateBuyer, validateCSVBuyer } from '@/lib/validations/buyer';

describe('Buyer Validation', () => {
  it('should validate a valid buyer', () => {
    const validBuyer = {
      fullName: 'John Doe',
      phone: '9876543210',
      city: 'Chandigarh',
      propertyType: 'Apartment',
      bhk: '3',
      purpose: 'Buy',
      timeline: '0-3m',
      source: 'Website',
      status: 'New',
      tags: [],
    };

    const result = validateBuyer(validBuyer);
    expect(result.success).toBe(true);
  });

  it('should require BHK for residential properties', () => {
    const invalidBuyer = {
      fullName: 'John Doe',
      phone: '9876543210',
      city: 'Chandigarh',
      propertyType: 'Apartment',
      // bhk missing
      purpose: 'Buy',
      timeline: '0-3m',
      source: 'Website',
      status: 'New',
      tags: [],
    };

    const result = validateBuyer(invalidBuyer);
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].path).toContain('bhk');
  });

  it('should validate budget constraints', () => {
    const invalidBuyer = {
      fullName: 'John Doe',
      phone: '9876543210',
      city: 'Chandigarh',
      propertyType: 'Plot',
      purpose: 'Buy',
      budgetMin: 1000000,
      budgetMax: 500000, // Max less than min
      timeline: '0-3m',
      source: 'Website',
      status: 'New',
      tags: [],
    };

    const result = validateBuyer(invalidBuyer);
    expect(result.success).toBe(false);
  });

  it('should validate phone number format', () => {
    const invalidBuyer = {
      fullName: 'John Doe',
      phone: '123', // Too short
      city: 'Chandigarh',
      propertyType: 'Plot',
      purpose: 'Buy',
      timeline: '0-3m',
      source: 'Website',
      status: 'New',
      tags: [],
    };

    const result = validateBuyer(invalidBuyer);
    expect(result.success).toBe(false);
  });

  it('should validate CSV buyer data', () => {
    const csvData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      city: 'Chandigarh',
      propertyType: 'Apartment',
      bhk: '3',
      purpose: 'Buy',
      budgetMin: '1000000',
      budgetMax: '2000000',
      timeline: '0-3m',
      source: 'Website',
      notes: 'Test notes',
      tags: 'urgent,qualified',
      status: 'New',
    };

    const result = validateCSVBuyer(csvData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.budgetMin).toBe(1000000);
      expect(result.data.tags).toEqual(['urgent', 'qualified']);
    }
  });
});