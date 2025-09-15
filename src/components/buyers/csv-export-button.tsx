'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export function CSVExportButton() {
  const [exporting, setExporting] = useState(false);
  const searchParams = useSearchParams();

  const handleExport = async () => {
    setExporting(true);
    
    try {
      // Build URL with current filters
      const params = new URLSearchParams();
      searchParams.forEach((value, key) => {
        params.append(key, value);
      });

      const response = await fetch(`/api/buyers/export?${params.toString()}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `buyers-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      // You might want to show a toast notification here
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={exporting}
    >
      {exporting ? (
        <>
          <Download className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </>
      )}
    </Button>
  );
}