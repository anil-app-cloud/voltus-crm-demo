import React from 'react';
import { Customer } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';
import { Animate, FadeIn, SlideInRight } from '../ui/animate';
import Skeleton, { SkeletonText } from '../ui/skeleton';

interface CustomerListCardProps {
  className?: string;
  customers: Customer[];
  error: string | null;
  onRetry: () => void;
  children?: (customer: Customer) => React.ReactNode;
  loading?: boolean;
}

const CustomerListCard = ({ className, customers, error, onRetry, children, loading = false }: CustomerListCardProps) => {
  if (loading) {
    return (
      <Card className={className} loading>
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
          <CardDescription>Loading customers...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <SkeletonText className="h-5 w-40" style={{ animationDelay: `${i * 100}ms` }} />
                  <SkeletonText className="h-4 w-32" style={{ animationDelay: `${i * 100 + 50}ms` }} />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" style={{ animationDelay: `${i * 100 + 100}ms` }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
          <CardDescription>Error loading customers</CardDescription>
        </CardHeader>
        <CardContent>
          <FadeIn>
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={onRetry} variant="outline" size="sm" animation="bounce">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </FadeIn>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>Recent Customers</CardTitle>
        <CardDescription>Latest customer activity</CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        {customers.length === 0 ? (
          <FadeIn>
            <p className="text-center text-sm text-muted-foreground p-2">No customers found</p>
          </FadeIn>
        ) : (
          <div className="space-y-2">
            <Animate type="fade-in" staggerChildren={true} staggerDelay={100}>
              {customers.map(customer => (
                <div 
                  key={customer.id} 
                  className="flex items-center justify-between group p-2 rounded-md hover:bg-muted/30 transition-colors duration-200"
                >
                  <div>
                    <h4 className="font-medium group-hover:text-primary transition-colors duration-200">{customer.company_name}</h4>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                  {children && children(customer)}
                </div>
              ))}
            </Animate>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export type { CustomerListCardProps };
export default CustomerListCard; 