import { getBuyersStats } from '@/lib/db/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  Clock, 
  MapPin,
  Building,
  DollarSign
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface BuyersStatsProps {
  userId: string;
}

export async function BuyersStats({ userId }: BuyersStatsProps) {
  const { stats, total } = await getBuyersStats(userId);
  
  const statusStats = stats.reduce((acc, stat) => {
    acc[stat.status] = stat.count;
    return acc;
  }, {} as Record<string, number>);

  const newLeads = statusStats.New || 0;
  const qualified = statusStats.Qualified || 0;
  const contacted = statusStats.Contacted || 0;
  const visited = statusStats.Visited || 0;
  const negotiation = statusStats.Negotiation || 0;
  const converted = statusStats.Converted || 0;
  const dropped = statusStats.Dropped || 0;
  
  const active = total - converted - dropped;
  const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0';
  const qualificationRate = total > 0 ? (((qualified + contacted + visited + negotiation + converted) / total) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">
            {newLeads} new this period
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{active}</div>
          <p className="text-xs text-muted-foreground">
            Currently in pipeline
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate}%</div>
          <p className="text-xs text-muted-foreground">
            {converted} converted leads
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Qualification Rate</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{qualificationRate}%</div>
          <p className="text-xs text-muted-foreground">
            Beyond initial stage
          </p>
        </CardContent>
      </Card>
    </div>
  );
}