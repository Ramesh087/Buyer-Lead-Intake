'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from './button';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  showFirstLast?: boolean;
  showPageNumbers?: boolean;
  className?: string;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems,
  itemsPerPage = 10,
  showFirstLast = true,
  showPageNumbers = true,
  className 
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    router.push(`?${params.toString()}`);
  };

  // Calculate visible page numbers with dots
  const getVisiblePages = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Items info */}
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* First page */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => updatePage(1)}
            disabled={currentPage <= 1}
            className="h-8 w-8"
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">First page</span>
          </Button>
        )}

        {/* Previous page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => updatePage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        {/* Page numbers */}
        {showPageNumbers &&
          getVisiblePages().map((page, idx) =>
            page === '...' ? (
              <span key={idx} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={idx}
                variant={page === currentPage ? 'default' : 'outline'}
                size="icon"
                onClick={() => updatePage(page as number)}
                className="h-8 w-8"
              >
                {page}
              </Button>
            )
          )}

        {/* Next page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => updatePage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>

        {/* Last page */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => updatePage(totalPages)}
            disabled={currentPage >= totalPages}
            className="h-8 w-8"
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Last page</span>
          </Button>
        )}
      </div>
    </div>
  );
}
