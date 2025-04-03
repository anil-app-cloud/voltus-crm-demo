import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { RefreshCw } from 'lucide-react';
import { Customer } from '../../../types';

interface CustomerListCardProps {
  className?: string;
  customers: Customer[];
  error?: string | null;
  onRetry?: () => void;
}

const CustomerListCard: React.FC<CustomerListCardProps> = ({
  className,
  customers,
  error,
  onRetry
}) => {
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
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
      <CardHeader>
        <CardTitle>Recent Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customers.map(customer => (
            <div key={customer.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{customer.company_name}</p>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerListCard; 