import { formatDate, formatDateTime, camelCaseToTitle } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Edit3 } from 'lucide-react';

interface BuyerHistoryProps {
  history: any[];
}

export function BuyerHistory({ history }: BuyerHistoryProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Change History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div className="space-y-2">
              <Edit3 className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="font-medium">No changes recorded</h3>
              <p className="text-sm text-muted-foreground">
                Changes to this lead will appear here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatChangeValue = (value: any): string => {
    if (value === null || value === undefined) return 'None';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ') || 'None';
    if (typeof value === 'object' && value.toString() === '[object Object]') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Change History
          <Badge variant="secondary">{history.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {history.map((entry, index) => (
            <div key={entry.id} className="relative">
              {/* Timeline line */}
              {index < history.length - 1 && (
                <div className="absolute left-4 top-8 h-full w-px bg-border" />
              )}
              
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {entry.changedBy?.name || entry.changedBy?.email || 'System'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {Object.keys(entry.diff).length} change{Object.keys(entry.diff).length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {formatDateTime(entry.changedAt)}
                    </time>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(entry.diff).map(([field, change]: [string, any]) => (
                      <div key={field} className="rounded-lg bg-muted/50 p-3">
                        <div className="mb-2 text-sm font-medium">
                          {camelCaseToTitle(field)}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          {change.old !== null && change.old !== undefined && (
                            <>
                              <Badge variant="outline" className="text-xs">
                                {formatChangeValue(change.old)}
                              </Badge>
                              <span className="text-muted-foreground">→</span>
                            </>
                          )}
                          <Badge 
                            variant={change.old === null ? "default" : "secondary"} 
                            className="text-xs"
                          >
                            {formatChangeValue(change.new)}
                          </Badge>
                        </div>
                        
                        {field === 'status' && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Status updated in lead pipeline
                          </div>
                        )}
                        
                        {(field === 'budgetMin' || field === 'budgetMax') && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Budget range modified
                          </div>
                        )}
                        
                        {field === 'notes' && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Notes updated
                          </div>
                        )}
                        
                        {field === 'tags' && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Tags modified
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}