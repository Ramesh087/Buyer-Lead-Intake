// components/buyers/csv-import-dialog.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CSVImportDialogProps {
  children: React.ReactNode;
}

export function CSVImportDialog({ children }: CSVImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please select a valid CSV file');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/buyers/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          imported: data.imported,
        });
        router.refresh();
        
        // Close dialog after successful import
        setTimeout(() => {
          setOpen(false);
          setFile(null);
          setResult(null);
        }, 2000);
      } else {
        setError(data.error || 'Import failed');
        if (data.results?.invalid) {
          setResult({
            success: false,
            invalid: data.results.invalid,
          });
        }
      }
    } catch (err) {
      setError('Failed to import CSV. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = `Full Name,Email,Phone,City,Property Type,BHK,Purpose,Budget Min,Budget Max,Timeline,Source,Notes,Tags
John Doe,john@example.com,9876543210,Chandigarh,Apartment,3,Buy,5000000,7000000,0-3m,Website,"Looking for 3BHK","urgent,premium"
Jane Smith,,9876543211,Mohali,Villa,4,Buy,8000000,12000000,3-6m,Referral,"Wants garden","family,spacious"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buyers-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Buyers from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import buyer leads. Maximum 200 rows per import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Need a template?</p>
                <p className="text-xs text-muted-foreground">
                  Download our CSV template with the correct format
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
              >
                <FileText className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={importing}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* CSV Format Requirements */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>CSV Requirements:</strong>
              <ul className="mt-2 ml-4 list-disc text-sm">
                <li>Required fields: Full Name, Phone, City, Property Type, Purpose, Timeline, Source</li>
                <li>BHK is required for Apartment and Villa properties</li>
                <li>Phone must be 10-15 digits</li>
                <li>Tags should be comma-separated</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {result?.success && (
            <Alert variant="success" className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Successfully imported {result.imported} buyer lead{result.imported > 1 ? 's' : ''}!
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Errors */}
          {result?.invalid && result.invalid.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Validation errors found:</strong>
                <div className="mt-2 max-h-40 overflow-y-auto">
                  {result.invalid.slice(0, 5).map((item: any, idx: number) => (
                    <div key={idx} className="mb-2 text-sm">
                      <strong>Row {item.row}:</strong>
                      <ul className="ml-4 list-disc">
                        {item.errors.map((err: string, errIdx: number) => (
                          <li key={errIdx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {result.invalid.length > 5 && (
                    <p className="text-sm font-medium">
                      ... and {result.invalid.length - 5} more errors
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={importing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={!file || importing}
            >
              {importing ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}