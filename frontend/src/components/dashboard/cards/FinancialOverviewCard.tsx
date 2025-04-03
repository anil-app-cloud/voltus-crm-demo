import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { RefreshCw } from 'lucide-react';

interface FinancialOverviewCardProps {
  className?: string;
  totalRevenue: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  error?: string | null;
  onRetry?: () => void;
}

const FinancialOverviewCard: React.FC<FinancialOverviewCardProps> = ({
  className,
  totalRevenue,
  paidInvoices,
  unpaidInvoices,
  overdueInvoices,
  error,
  onRetry
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-destructive mb-4">{error}</p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 p-3">
        <div className="space-y-1 p-2 bg-slate-50 rounded-md">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <h3 className="text-xl font-bold">{formatCurrency(totalRevenue)}</h3>
        </div>
        <div className="space-y-1 p-2 bg-green-50 rounded-md">
          <p className="text-sm text-muted-foreground">Paid Invoices</p>
          <h3 className="text-xl font-bold text-green-600">{paidInvoices}</h3>
        </div>
        <div className="space-y-1 p-2 bg-yellow-50 rounded-md">
          <p className="text-sm text-muted-foreground">Unpaid Invoices</p>
          <h3 className="text-xl font-bold text-yellow-600">{unpaidInvoices}</h3>
        </div>
        <div className="space-y-1 p-2 bg-red-50 rounded-md">
          <p className="text-sm text-muted-foreground">Overdue Invoices</p>
          <h3 className="text-xl font-bold text-red-600">{overdueInvoices}</h3>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialOverviewCard; 