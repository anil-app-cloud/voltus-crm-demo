import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import OverviewTab from './tabs/OverviewTab';
import OrdersTab from './tabs/OrdersTab';
import BookingEnquiriesTab from './tabs/BookingEnquiriesTab';
import CommunicationsTab from './tabs/CommunicationsTab';
import ContactsTab from './tabs/ContactsTab';
import FinancialsTab from './tabs/FinancialsTab';
import { CustomerDetails } from '../../types';
import { AlertTriangle } from 'lucide-react';
import { FadeIn, SlideInRight } from '../ui/animate';

interface CustomerTabsProps {
  data: CustomerDetails;
}

const CustomerTabs: React.FC<CustomerTabsProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);
  const [isTabChanging, setIsTabChanging] = useState(false);

  // Error boundary for tab content
  const handleTabChange = (value: string) => {
    // Animate tab transitions
    setIsTabChanging(true);
    setTimeout(() => {
      setActiveTab(value);
      setError(null); // Clear any previous errors when switching tabs
      
      // Short delay before showing the new tab content
      setTimeout(() => {
        setIsTabChanging(false);
      }, 100);
    }, 150);
  };

  // Safely access nested properties
  const safeData = {
    customer: data.customer || {},
    orderHistory: data.orderHistory || [],
    allBookingEnquiries: data.allBookingEnquiries || [],
    allCommunications: data.allCommunications || [],
    allContacts: data.allContacts || [],
    financialSummary: data.financialSummary || {
      total_revenue: 0,
      total_orders_change: 0,
      accounts_receivable: 0,
      accounts_receivable_change: 0,
      average_days_to_pay: 0,
      average_days_to_pay_change: 0,
      average_order_value: 0,
      average_order_value_change: 0,
      total_lifetime_value: 0,
      total_lifetime_value_change: 0,
      paidInvoices: 0,
      unpaidInvoices: 0,
      overdueInvoices: 0
    },
    invoices: data.invoices || [],
    recentOrders: data.recentOrders || [],
    recentCommunications: data.recentCommunications || [],
    keyContacts: data.keyContacts || [],
    currentBookingEnquiries: data.currentBookingEnquiries || [],
    recentActivities: data.recentActivities || []
  };

  if (error) {
    return (
      <div className="p-8 bg-red-50 rounded-md animate-fade-in">
        <div className="flex items-start">
          <AlertTriangle className="text-red-500 h-5 w-5 mt-0.5 mr-2" />
          <div>
            <h3 className="font-medium text-red-800">Error in tab content</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="w-full bg-transparent mb-6 border-b rounded-none h-auto">
        <TabsTrigger 
          value="overview" 
          className="tab-item data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none transition-all duration-200"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="orders" 
          className="tab-item data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none transition-all duration-200"
        >
          Orders
        </TabsTrigger>
        <TabsTrigger 
          value="booking-enquiries" 
          className="tab-item data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none transition-all duration-200"
        >
          Booking Enquiries
        </TabsTrigger>
        <TabsTrigger 
          value="communications" 
          className="tab-item data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none transition-all duration-200"
        >
          Communications
        </TabsTrigger>
        <TabsTrigger 
          value="contacts" 
          className="tab-item data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none transition-all duration-200"
        >
          Contacts
        </TabsTrigger>
        <TabsTrigger 
          value="financials" 
          className="tab-item data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none transition-all duration-200"
        >
          Financials
        </TabsTrigger>
      </TabsList>
      
      <div className={`transition-opacity duration-300 ${isTabChanging ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <TabsContent value="overview" className="animate-fadeInFast">
          <FadeIn>
            <OverviewTab data={safeData} />
          </FadeIn>
        </TabsContent>
        
        <TabsContent value="orders" className="animate-fadeInFast">
          <SlideInRight>
            <OrdersTab orders={safeData.orderHistory} />
          </SlideInRight>
        </TabsContent>
        
        <TabsContent value="booking-enquiries" className="animate-fadeInFast">
          <SlideInRight>
            <BookingEnquiriesTab bookings={safeData.allBookingEnquiries} />
          </SlideInRight>
        </TabsContent>
        
        <TabsContent value="communications" className="animate-fadeInFast">
          <SlideInRight>
            <CommunicationsTab communications={safeData.allCommunications} />
          </SlideInRight>
        </TabsContent>
        
        <TabsContent value="contacts" className="animate-fadeInFast">
          <SlideInRight>
            <ContactsTab contacts={safeData.allContacts} />
          </SlideInRight>
        </TabsContent>
        
        <TabsContent value="financials" className="animate-fadeInFast">
          <SlideInRight>
            <FinancialsTab financialSummary={safeData.financialSummary} invoices={safeData.invoices} />
          </SlideInRight>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default CustomerTabs; 