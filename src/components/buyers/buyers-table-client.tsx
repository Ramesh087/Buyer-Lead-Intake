'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor, getTimelineColor } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

interface BuyersTableClientProps {
  data: any[];
  userId: string;
}

export function BuyersTableClient({ data, userId }: BuyersTableClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    setDeletingId(id);
    try {
      const response = await fetch(`/api/buyers/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to delete lead');
      }
    } catch (error) {
      alert('Failed to delete lead');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSort = (column: string) => {
    const currentSortBy = searchParams.get('sortBy') || 'updatedAt';
    const currentSortOrder = searchParams.get('sortOrder') || 'desc';
    
    let newSortOrder = 'asc';
    if (currentSortBy === column && currentSortOrder === 'asc') {
      newSortOrder = 'desc';
    }
    
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', column);
    params.set('sortOrder', newSortOrder);
    params.delete('page'); // Reset to first page
    
    router.push(`?${params.toString()}`);
  };

  const getSortIcon = (column: string) => {
    const currentSortBy = searchParams.get('sortBy') || 'updatedAt';
    const currentSortOrder = searchParams.get('sortOrder') || 'desc';
    
    if (currentSortBy !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    
    return currentSortOrder === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const handleQuickStatusUpdate = async (buyerId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/buyers/${buyerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (data.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No leads found</h3>
            <p className="text-muted-foreground mb-4">
              {searchParams.toString() ? 'Try adjusting your filters.' : 'Get started by adding your first buyer lead.'}
            </p>
            <Button asChild>
              <Link href="/buyers/new">Add Lead</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('fullName')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Name
                {getSortIcon('fullName')}
              </Button>
            </TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('city')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Location
                {getSortIcon('city')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('propertyType')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Property
                {getSortIcon('propertyType')}
              </Button>
            </TableHead>
            <TableHead>Budget Range</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('timeline')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Timeline
                {getSortIcon('timeline')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('status')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Status
                {getSortIcon('status')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('updatedAt')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Updated
                {getSortIcon('updatedAt')}
              </Button>
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((buyer) => (
            <TableRow key={buyer.id} className="hover:bg-muted/50">
              <TableCell>
                <div>
                  <div className="font-medium">{buyer.fullName}</div>
                  {buyer.tags && buyer.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {buyer.tags.slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {buyer.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{buyer.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="h-3 w-3" />
                    {buyer.phone}
                  </div>
                  {buyer.email && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {buyer.email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{buyer.city}</div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="text-sm font-medium">{buyer.propertyType}</div>
                  {buyer.bhk && (
                    <div className="text-xs text-muted-foreground">
                      {buyer.bhk} BHK • {buyer.purpose}
                    </div>
                  )}
                  {!buyer.bhk && (
                    <div className="text-xs text-muted-foreground">
                      {buyer.purpose}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {buyer.budgetMin || buyer.budgetMax ? (
                  <div className="text-sm">
                    {buyer.budgetMin && formatCurrency(buyer.budgetMin)}
                    {buyer.budgetMin && buyer.budgetMax && ' - '}
                    {buyer.budgetMax && formatCurrency(buyer.budgetMax)}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Not specified</span>
                )}
              </TableCell>
              <TableCell>
                <Badge className={getTimelineColor(buyer.timeline)} variant="secondary">
                  {buyer.timeline}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge 
                      className={getStatusColor(buyer.status)} 
                      variant="secondary"
                      role="button"
                    >
                      {buyer.status}
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'].map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => handleQuickStatusUpdate(buyer.id, status)}
                        disabled={buyer.ownerId !== userId}
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell>
                <div className="text-xs text-muted-foreground">
                  {formatDate(buyer.updatedAt)}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/buyers/${buyer.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    {buyer.ownerId === userId && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href={`/buyers/${buyer.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(buyer.id)}
                          disabled={deletingId === buyer.id}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}