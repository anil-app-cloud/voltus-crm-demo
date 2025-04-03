import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import UserProfile from '../../components/dashboard/UserProfile';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { getUserProfile, getFinancialSummary } from '../../lib/api';

const ProfilePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [financialSummary, setFinancialSummary] = useState({
    totalRevenue: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    overdueInvoices: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch financial summary
        const financialData = await getFinancialSummary();
        setFinancialSummary(financialData || {
          totalRevenue: 250000,
          paidInvoices: 42,
          unpaidInvoices: 28,
          overdueInvoices: 7
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <UserProfile />
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Total Revenue</span>
                    <span className="font-medium">{formatCurrency(financialSummary.totalRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Paid Invoices</span>
                    <span className="font-medium text-green-600">{financialSummary.paidInvoices}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Unpaid Invoices</span>
                    <span className="font-medium text-yellow-600">{financialSummary.unpaidInvoices}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Overdue Invoices</span>
                    <span className="font-medium text-red-600">{financialSummary.overdueInvoices}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage; 