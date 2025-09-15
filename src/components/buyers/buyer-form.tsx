'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { buyerSchema, type BuyerFormData } from '@/lib/validations/buyer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BuyerFormProps {
  buyer?: any;
  userId: string;
  isEditing?: boolean;
  readOnly?: boolean;
}

export function BuyerForm({ buyer, userId, isEditing = false, readOnly = false }: BuyerFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const router = useRouter();

  const form = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: buyer ? {
      fullName: buyer.fullName,
      email: buyer.email || '',
      phone: buyer.phone,
      city: buyer.city,
      propertyType: buyer.propertyType,
      bhk: buyer.bhk || undefined,
      purpose: buyer.purpose,
      budgetMin: buyer.budgetMin || undefined,
      budgetMax: buyer.budgetMax || undefined,
      timeline: buyer.timeline,
      source: buyer.source,
      status: buyer.status || 'New',
      notes: buyer.notes || '',
      tags: buyer.tags || [],
    } : {
      status: 'New',
      tags: [],
    },
  });

  const watchedPropertyType = form.watch('propertyType');
  const watchedTags = form.watch('tags');

  const onSubmit = async (data: BuyerFormData) => {
    setError(null);

    startTransition(async () => {
      try {
        const url = isEditing ? `/api/buyers/${buyer.id}` : '/api/buyers';
        const method = isEditing ? 'PUT' : 'POST';
        
        const payload = isEditing 
          ? { ...data, id: buyer.id, updatedAt: buyer.updatedAt.toISOString() }
          : data;

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save buyer');
        }

        router.push('/buyers');
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    });
  };

  const addTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
      form.setValue('tags', [...watchedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const shouldShowBHK = ['Apartment', 'Villa'].includes(watchedPropertyType);

  if (readOnly) {
    return (
      <div className="space-y-6">
        {/* Read-only view would go here - simplified for brevity */}
        <p>Read-only view not implemented in this example</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Buyer Lead' : 'Add New Buyer Lead'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                {...form.register('fullName')}
                disabled={isPending}
              />
              {form.formState.errors.fullName && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                {...form.register('phone')}
                disabled={isPending}
                placeholder="10-15 digits"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                disabled={isPending}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Select
                value={form.watch('city')}
                onValueChange={(value) => form.setValue('city', value as any)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                  <SelectItem value="Mohali">Mohali</SelectItem>
                  <SelectItem value="Zirakpur">Zirakpur</SelectItem>
                  <SelectItem value="Panchkula">Panchkula</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.city && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.city.message}
                </p>
              )}
            </div>
          </div>

          {/* Property Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="propertyType">Property Type *</Label>
              <Select
                value={form.watch('propertyType')}
                onValueChange={(value) => form.setValue('propertyType', value as any)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Plot">Plot</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.propertyType && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.propertyType.message}
                </p>
              )}
            </div>

            {shouldShowBHK && (
              <div>
                <Label htmlFor="bhk">BHK *</Label>
                <Select
                  value={form.watch('bhk') || ''}
                  onValueChange={(value) => form.setValue('bhk', value as any)}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select BHK" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 BHK</SelectItem>
                    <SelectItem value="2">2 BHK</SelectItem>
                    <SelectItem value="3">3 BHK</SelectItem>
                    <SelectItem value="4">4 BHK</SelectItem>
                    <SelectItem value="Studio">Studio</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.bhk && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.bhk.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="purpose">Purpose *</Label>
              <Select
                value={form.watch('purpose')}
                onValueChange={(value) => form.setValue('purpose', value as any)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Buy or Rent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buy">Buy</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.purpose && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.purpose.message}
                </p>
              )}
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budgetMin">Budget Min (₹)</Label>
              <Input
                id="budgetMin"
                type="number"
                {...form.register('budgetMin', { valueAsNumber: true })}
                disabled={isPending}
                placeholder="Minimum budget"
              />
              {form.formState.errors.budgetMin && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.budgetMin.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="budgetMax">Budget Max (₹)</Label>
              <Input
                id="budgetMax"
                type="number"
                {...form.register('budgetMax', { valueAsNumber: true })}
                disabled={isPending}
                placeholder="Maximum budget"
              />
              {form.formState.errors.budgetMax && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.budgetMax.message}
                </p>
              )}
            </div>
          </div>

          {/* Timeline, Source, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="timeline">Timeline *</Label>
              <Select
                value={form.watch('timeline')}
                onValueChange={(value) => form.setValue('timeline', value as any)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-3m">0-3 months</SelectItem>
                  <SelectItem value="3-6m">3-6 months</SelectItem>
                  <SelectItem value=">6m">6+ months</SelectItem>
                  <SelectItem value="Exploring">Just exploring</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.timeline && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.timeline.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="source">Source *</Label>
              <Select
                value={form.watch('source')}
                onValueChange={(value) => form.setValue('source', value as any)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Walk-in">Walk-in</SelectItem>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.source && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.source.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value) => form.setValue('status', value as any)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Visited">Visited</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Converted">Converted</SelectItem>
                  <SelectItem value="Dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                disabled={isPending}
              />
              <Button type="button" variant="outline" onClick={addTag} disabled={!newTag.trim() || isPending}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {watchedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    disabled={isPending}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              disabled={isPending}
              placeholder="Additional notes about the buyer..."
              rows={3}
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.notes.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEditing ? 'Update Lead' : 'Create Lead'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}