'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CSVImportDialog } from './csv-import-dialog';
import { CSVExportButton } from './csv-export-button';
import { Upload, Download, Search, X, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useEffect, useState } from 'react';

export function BuyersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 300);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to first page
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    router.push('/buyers');
  };

  useEffect(() => {
    updateFilters('search', debouncedSearch);
  }, [debouncedSearch]);

  const activeFilters = Array.from(searchParams.entries()).filter(([key]) => 
    ['search', 'city', 'propertyType', 'status', 'timeline'].includes(key) && searchParams.get(key)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CSVImportDialog>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
          </CSVImportDialog>
          <CSVExportButton />
        </div>
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {activeFilters.length} filter{activeFilters.length > 1 ? 's' : ''} active
            </span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Select
          value={searchParams.get('city') ?? undefined}
          onValueChange={(value) => updateFilters('city', value === 'all' ? '' : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            <SelectItem value="Chandigarh">Chandigarh</SelectItem>
            <SelectItem value="Mohali">Mohali</SelectItem>
            <SelectItem value="Zirakpur">Zirakpur</SelectItem>
            <SelectItem value="Panchkula">Panchkula</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get('propertyType') ?? undefined}
          onValueChange={(value) => updateFilters('propertyType', value === 'all' ? '' : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Properties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            <SelectItem value="Apartment">Apartment</SelectItem>
            <SelectItem value="Villa">Villa</SelectItem>
            <SelectItem value="Plot">Plot</SelectItem>
            <SelectItem value="Office">Office</SelectItem>
            <SelectItem value="Retail">Retail</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get('status') ?? undefined}
          onValueChange={(value) => updateFilters('status', value === 'all' ? '' : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Qualified">Qualified</SelectItem>
            <SelectItem value="Contacted">Contacted</SelectItem>
            <SelectItem value="Visited">Visited</SelectItem>
            <SelectItem value="Negotiation">Negotiation</SelectItem>
            <SelectItem value="Converted">Converted</SelectItem>
            <SelectItem value="Dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get('timeline') ?? undefined}
          onValueChange={(value) => updateFilters('timeline', value === 'all' ? '' : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Timeline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Timeline</SelectItem>
            <SelectItem value="0-3m">0-3 months</SelectItem>
            <SelectItem value="3-6m">3-6 months</SelectItem>
            <SelectItem value=">6m">6+ months</SelectItem>
            <SelectItem value="Exploring">Just exploring</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
            >
              <Filter className="h-3 w-3" />
              <span className="capitalize">{key}:</span>
              <span className="font-medium">{value}</span>
              <button
                onClick={() => updateFilters(key, '')}
                className="ml-1 hover:bg-primary/20 rounded-sm p-0.5"
                aria-label={`Remove ${key} filter`}
                    >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}