import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { RefreshCw, Users, Inbox, FileText, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsOverviewCardProps {
  className?: string;
  totalCustomers: number;
  activeBookings: number;
  pendingInvoices: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueGrowth: number;
  error?: string | null;
  onRetry?: () => void;
}

const StatsOverviewCard: React.FC<StatsOverviewCardProps> = ({
  className,
  totalCustomers,
  activeBookings,
  pendingInvoices,
  revenueThisMonth,
  revenueLastMonth,
  revenueGrowth,
  error,
  onRetry
}) => {
  const [animatedCustomers, setAnimatedCustomers] = useState(0);
  const [animatedBookings, setAnimatedBookings] = useState(0);
  const [animatedInvoices, setAnimatedInvoices] = useState(0);
  const [animatedRevenue, setAnimatedRevenue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  useEffect(() => {
    setIsVisible(true);
    
    const duration = 1500; // Animation duration in ms
    const framesPerSecond = 60;
    const totalFrames = duration / 1000 * framesPerSecond;
    
    // Animate each stat
    const customersInterval = setInterval(() => {
      setAnimatedCustomers(prev => {
        const next = prev + Math.ceil(totalCustomers / totalFrames);
        return next >= totalCustomers ? totalCustomers : next;
      });
    }, 1000 / framesPerSecond);
    
    const bookingsInterval = setInterval(() => {
      setAnimatedBookings(prev => {
        const next = prev + Math.ceil(activeBookings / totalFrames);
        return next >= activeBookings ? activeBookings : next;
      });
    }, 1000 / framesPerSecond);
    
    const invoicesInterval = setInterval(() => {
      setAnimatedInvoices(prev => {
        const next = prev + Math.ceil(pendingInvoices / totalFrames);
        return next >= pendingInvoices ? pendingInvoices : next;
      });
    }, 1000 / framesPerSecond);
    
    const revenueInterval = setInterval(() => {
      setAnimatedRevenue(prev => {
        const next = prev + Math.ceil(revenueThisMonth / totalFrames);
        return next >= revenueThisMonth ? revenueThisMonth : next;
      });
    }, 1000 / framesPerSecond);
    
    return () => {
      clearInterval(customersInterval);
      clearInterval(bookingsInterval);
      clearInterval(invoicesInterval);
      clearInterval(revenueInterval);
    };
  }, [totalCustomers, activeBookings, pendingInvoices, revenueThisMonth]);

  if (error) {
    return (
      <Card className={`${className} overflow-hidden transition-all duration-500 ease-in-out`}>
        <CardHeader>
          <CardTitle>Statistics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-destructive mb-4 animate-pulse">{error}</p>
            {onRetry && (
              <Button 
                onClick={onRetry} 
                variant="outline" 
                size="sm"
                className="transition-all hover:scale-105 active:scale-95"
              >
                <RefreshCw className="h-4 w-4 mr-2 animate-spin-slow" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} shadow-md transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <CardHeader className="border-b bg-muted/30 pb-2">
        <CardTitle className="flex items-center">
          <span className="bg-primary/10 p-2 rounded-full mr-2">
            <TrendingUp className="h-4 w-4 text-primary" />
          </span>
          Statistics Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 p-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1 rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3 transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-500" />
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Customers</p>
          </div>
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">{animatedCustomers}</h3>
          <div className="h-1 w-full bg-blue-100 dark:bg-blue-800 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%', transition: 'width 1.5s ease-in-out' }} />
          </div>
        </div>
        
        <div className="space-y-1 rounded-xl bg-green-50 dark:bg-green-950/30 p-3 transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center space-x-2">
            <Inbox className="h-4 w-4 text-green-500" />
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Bookings</p>
          </div>
          <h3 className="text-xl font-bold text-green-900 dark:text-green-100">{animatedBookings}</h3>
          <div className="h-1 w-full bg-green-100 dark:bg-green-800 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: '100%', transition: 'width 1.5s ease-in-out' }} />
          </div>
        </div>
        
        <div className="space-y-1 rounded-xl bg-amber-50 dark:bg-amber-950/30 p-3 transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Pending Invoices</p>
          </div>
          <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">{animatedInvoices}</h3>
          <div className="h-1 w-full bg-amber-100 dark:bg-amber-800 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '100%', transition: 'width 1.5s ease-in-out' }} />
          </div>
        </div>
        
        <div className="space-y-1 rounded-xl bg-purple-50 dark:bg-purple-950/30 p-3 transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center space-x-2">
            <div className="text-purple-500">$</div>
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Revenue (This Month)</p>
          </div>
          <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">{formatCurrency(animatedRevenue)}</h3>
          <div className="flex items-center mt-1">
            {revenueGrowth >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600 mr-1 animate-bounce-subtle" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 mr-1 animate-bounce-subtle" />
            )}
            <p className={`text-xs font-medium ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(revenueGrowth)}% vs last month
            </p>
          </div>
          <div className="h-1 w-full bg-purple-100 dark:bg-purple-800 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: '100%', transition: 'width 1.5s ease-in-out' }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsOverviewCard; 