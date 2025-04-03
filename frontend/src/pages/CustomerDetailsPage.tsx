import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import CustomerHeader from '../components/customer/CustomerHeader';
import CustomerTabs from '../components/customer/CustomerTabs';
import { getCustomerDetails, updateCustomer } from '../lib/api';
import { CustomerDetails, Customer } from '../types';
import { toast } from 'react-hot-toast';
import { AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Animate, FadeIn, SlideInTop, SlideInLeft } from '../components/ui/animate';
import { Spinner } from '../components/ui/spinner';

// Helper function to check if an error is an axios cancellation error
const isCancelError = (error: any): boolean => {
  return axios.isCancel(error) || 
    (error && error.message === 'Request cancelled - duplicate in flight') ||
    (error && error.code === 'ERR_CANCELED');
};

// Helper function to format customer ID
const formatCustomerId = (id: string | undefined): string => {
  if (!id) return '';
  
  // If the ID is already prefixed with 'c', return it as is
  if (id.startsWith('c')) return id;
  
  // If the ID is numeric, prefix it with 'c'
  if (/^\d+$/.test(id)) return `c${id}`;
  
  // Otherwise, return the ID as is
  return id;
};

// Define API response interface
interface CustomerDetailsResponse {
  customer: any;
  contacts: any[];
  recentOrders: any[];
  recentCommunications: any[];
  keyContacts: any[];
  currentBookingEnquiries: any[];
  recentActivities: any[];
  orderHistory: any[];
  allBookingEnquiries: any[];
  allCommunications: any[];
  allContacts: any[];
  financialSummary: {
    total_revenue?: number;
    total_orders?: number;
    total_orders_change?: number;
    accounts_receivable?: number;
    accounts_receivable_change?: number;
    average_days_to_pay?: number;
    average_days_to_pay_change?: number;
    average_order_value?: number;
    average_order_value_change?: number;
    total_lifetime_value?: number;
    total_lifetime_value_change?: number;
    paidInvoices?: number;
    unpaidInvoices?: number;
    overdueInvoices?: number;
  };
  invoices: any[];
}

const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [loadingTooLong, setLoadingTooLong] = useState(false);
  const [data, setData] = useState<CustomerDetails>({
    customer: {} as Customer,
    contacts: [],
    recentOrders: [],
    recentCommunications: [],
    keyContacts: [],
    currentBookingEnquiries: [],
    recentActivities: [],
    orderHistory: [],
    allBookingEnquiries: [],
    allCommunications: [],
    allContacts: [],
    financialSummary: {
      total_orders: 0,
      total_orders_change: 0,
      accounts_receivable: 0,
      accounts_receivable_change: 0,
      average_days_to_pay: 0,
      average_days_to_pay_change: 0,
      average_order_value: 0,
      average_order_value_change: 0,
      total_lifetime_value: 0,
      total_lifetime_value_change: 0
    },
    invoices: []
  });
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    // Redirect to customers list if no ID is provided
    if (!id) {
      navigate('/customers');
      return;
    }
  }, [id, navigate]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingTooLong(false);
      setIsPageLoaded(false);
      
      // Set a timeout to detect long-running requests
      const timeoutId = setTimeout(() => {
        setLoadingTooLong(true);
      }, 5000); // Show slow loading message after 5 seconds
      
      const formattedId = formatCustomerId(id || '');
      const response = await getCustomerDetails(formattedId) as CustomerDetailsResponse;
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      if (!response || !response.customer) {
        // Add a minimum loading time to ensure animation is visible
        setTimeout(() => {
          setError('Invalid customer data received from server');
          setLoading(false);
        }, 800);
        return;
      }
      
      // Map the API response to our expected types
      const customerData: CustomerDetails = {
        customer: response.customer as Customer,
        contacts: response.contacts || [],
        recentOrders: response.recentOrders || [],
        recentCommunications: response.recentCommunications || [],
        keyContacts: response.keyContacts || [],
        currentBookingEnquiries: response.currentBookingEnquiries || [],
        recentActivities: response.recentActivities || [],
        orderHistory: response.orderHistory || [],
        allBookingEnquiries: response.allBookingEnquiries || [],
        allCommunications: response.allCommunications || [],
        allContacts: response.allContacts || [],
        financialSummary: {
          total_orders: response.financialSummary?.total_orders || 0,
          total_orders_change: response.financialSummary?.total_orders_change || 0,
          accounts_receivable: response.financialSummary?.accounts_receivable || 0,
          accounts_receivable_change: response.financialSummary?.accounts_receivable_change || 0,
          average_days_to_pay: response.financialSummary?.average_days_to_pay || 0,
          average_days_to_pay_change: response.financialSummary?.average_days_to_pay_change || 0,
          average_order_value: response.financialSummary?.average_order_value || 0,
          average_order_value_change: response.financialSummary?.average_order_value_change || 0,
          total_lifetime_value: response.financialSummary?.total_lifetime_value || 0,
          total_lifetime_value_change: response.financialSummary?.total_lifetime_value_change || 0
        },
        invoices: response.invoices || []
      };
      
      setData(customerData);
      
      // Short delay before showing content for smoother animation
      setTimeout(() => {
        setIsPageLoaded(true);
        setLoading(false);
      }, 300);
    } catch (err: any) {
      if (!isCancelError(err)) {
        console.error('Error fetching customer data:', err);
        
        // Keep loading state active for at least 800ms to show loading animation
        setTimeout(() => {
          setError(err?.response?.data?.message || 'Failed to load customer data');
          setLoading(false);
        }, 800);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchData();
    
    // Return a cleanup function to cancel any in-flight requests
    return () => {
      // Any cleanup code here
    };
  }, [fetchData, retryCount]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (updatedCustomerData: any) => {
    if (!id) return;

    // Format the ID properly before making the API call
    const formattedId = formatCustomerId(id);

    try {
      await updateCustomer(formattedId, updatedCustomerData);
      // Refresh data after update
      const refreshedData = await getCustomerDetails(formattedId) as CustomerDetailsResponse;
      
      // Map the API response to our expected types
      const customerData: CustomerDetails = {
        customer: refreshedData.customer as Customer,
        contacts: refreshedData.contacts || [],
        recentOrders: refreshedData.recentOrders || [],
        recentCommunications: refreshedData.recentCommunications || [],
        keyContacts: refreshedData.keyContacts || [],
        currentBookingEnquiries: refreshedData.currentBookingEnquiries || [],
        recentActivities: refreshedData.recentActivities || [],
        orderHistory: refreshedData.orderHistory || [],
        allBookingEnquiries: refreshedData.allBookingEnquiries || [],
        allCommunications: refreshedData.allCommunications || [],
        allContacts: refreshedData.allContacts || [],
        financialSummary: {
          total_orders: refreshedData.financialSummary?.total_orders || 0,
          total_orders_change: refreshedData.financialSummary?.total_orders_change || 0,
          accounts_receivable: refreshedData.financialSummary?.accounts_receivable || 0,
          accounts_receivable_change: refreshedData.financialSummary?.accounts_receivable_change || 0,
          average_days_to_pay: refreshedData.financialSummary?.average_days_to_pay || 0,
          average_days_to_pay_change: refreshedData.financialSummary?.average_days_to_pay_change || 0,
          average_order_value: refreshedData.financialSummary?.average_order_value || 0,
          average_order_value_change: refreshedData.financialSummary?.average_order_value_change || 0,
          total_lifetime_value: refreshedData.financialSummary?.total_lifetime_value || 0,
          total_lifetime_value_change: refreshedData.financialSummary?.total_lifetime_value_change || 0
        },
        invoices: refreshedData.invoices || []
      };
      
      setData(customerData);
      setIsEditing(false);
      toast.success('Customer details updated successfully');
    } catch (err: any) {
      console.error('Error updating customer:', err);
      toast.error('Failed to update customer details');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (!id) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <Animate type="pulse" repeat={true} className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-muted-foreground">
                {loadingTooLong 
                  ? "This is taking longer than usual. Please wait..." 
                  : "Loading customer details..."}
              </p>
            </Animate>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <FadeIn>
          <div className="flex flex-col justify-center items-center h-[80vh]">
            <div className="text-center max-w-md mx-auto p-6 bg-destructive/5 rounded-lg animate-fade-in animate-duration-500">
              <Animate type="pop" repeat={true} duration={2000} delay={300}>
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              </Animate>
              <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
              <p className="text-muted-foreground mb-6">{error || 'Failed to load customer data.'}</p>
              <Button 
                onClick={handleRetry}
                className="px-4 py-2 hover:scale-105 transition-transform duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </FadeIn>
      </Layout>
    );
  }

  // Make sure we have valid customer data before rendering the tabs
  if (!data.customer) {
    return (
      <Layout>
        <FadeIn>
          <div className="flex flex-col justify-center items-center h-[80vh]">
            <div className="text-center max-w-md mx-auto p-6 bg-amber-50 rounded-lg animate-fade-in animate-duration-500">
              <Animate type="pulse" duration={2000} delay={300}>
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              </Animate>
              <h2 className="text-xl font-medium mb-4">Customer Data Issue</h2>
              <p className="text-muted-foreground mb-6">The API returned data in an unexpected format.</p>
              <Button 
                onClick={handleRetry}
                variant="default"
                className="hover:scale-105 transition-transform duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </FadeIn>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`transition-opacity duration-500 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <SlideInTop delay={100}>
          <CustomerHeader 
            customer={data.customer} 
            isEditing={isEditing} 
            onEdit={handleEdit} 
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </SlideInTop>
        
        <SlideInLeft delay={300}>
          <CustomerTabs data={data} />
        </SlideInLeft>
      </div>
    </Layout>
  );
};

export default CustomerDetailsPage; 