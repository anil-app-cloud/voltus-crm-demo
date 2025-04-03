import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Globe, DollarSign, Users, Package, FileText, Calendar, Download, Loader2, CheckCircle, X, AlertTriangle, FolderSync, RefreshCw, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Animate, FadeIn, SlideInLeft, SlideInRight, SlideInTop } from '../../components/ui/animate';
import Skeleton, { SkeletonCard, SkeletonText, SkeletonTable } from '../../components/ui/skeleton';
import {
  getDashboardStats,
  getDashboardRecentCustomers,
  getDashboardRecentBookings,
  getDashboardFinancialSummary
} from '../../lib/api';
import { Customer, Booking } from '../../types';
import {
  ActivityCard,
  StatsOverviewCard,
  DestinationsReportCard,
  TransportModeReport,
  FinancialOverviewCard
} from '../../components/dashboard';
import CustomerListCard from '../../components/dashboard/CustomerListCard';
import BookingListCard from '../../components/dashboard/BookingListCard';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';

// Helper function to check if an error is an axios cancellation error
const isCancelError = (error: any): boolean => {
  return axios.isCancel(error) || 
    (error && error.message === 'Request cancelled - duplicate in flight') ||
    (error && error.code === 'ERR_CANCELED');
};

interface DashboardStats {
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  pending_bookings: number;
  pending_invoices: number;
  topDestinations: Array<{ name: string; count: number }>;
  transportModes: Array<{ mode: string; percentage: number }>;
}

interface FinancialSummary {
  total_revenue: number;
  paid_invoices: number;
  pending_invoices: number;
  overdue_invoices: number;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [financialError, setFinancialError] = useState<string | null>(null);
  const [loadingTimeoutReached, setLoadingTimeoutReached] = useState(false);
  const [isDashboardReady, setIsDashboardReady] = useState(false);
  
  const [stats, setStats] = useState({
    total_customers: 0,
    total_orders: 0,
    total_revenue: 0,
    pending_bookings: 0,
    totalCustomers: 0,
    activeBookings: 0,
    pendingInvoices: 0,
    revenueThisMonth: 0,
    revenueLastMonth: 0,
    revenueGrowth: 0,
    topDestinations: [
      { name: 'United States', count: 0 },
      { name: 'China', count: 0 },
      { name: 'Germany', count: 0 },
      { name: 'United Kingdom', count: 0 },
      { name: 'Australia', count: 0 }
    ],
    transportModes: [
      { mode: 'Sea', percentage: 0 },
      { mode: 'Air', percentage: 0 },
      { mode: 'Road', percentage: 0 },
      { mode: 'Rail', percentage: 0 }
    ]
  });
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [financialSummary, setFinancialSummary] = useState({
    totalRevenue: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    overdueInvoices: 0
  });

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStatsError(null);
      setCustomersError(null);
      setBookingsError(null);
      setFinancialError(null);
      setLoadingTimeoutReached(false);
      setIsDashboardReady(false);
      
      // Set a timeout to detect long-running requests
      const timeoutId = setTimeout(() => {
        setLoadingTimeoutReached(true);
      }, 5000);
      
      const results = await Promise.allSettled([
        getDashboardStats(),
        getDashboardRecentCustomers(),
        getDashboardRecentBookings(),
        getDashboardFinancialSummary()
      ]);
      
      clearTimeout(timeoutId);
      
      if (results[0].status === 'fulfilled') {
        const statsData = results[0].value as DashboardStats;
        setStats({
          ...stats,
          totalCustomers: statsData.total_customers,
          activeBookings: statsData.pending_bookings,
          pendingInvoices: statsData.pending_invoices,
          revenueThisMonth: statsData.total_revenue,
          revenueLastMonth: statsData.total_revenue * 0.9,
          topDestinations: statsData.topDestinations,
          transportModes: statsData.transportModes
        });
      } else {
        const reason = results[0].reason;
        // Don't log cancel errors as they're expected
        if (!isCancelError(reason)) {
          console.error('Error fetching dashboard stats:', reason);
          setStatsError('Failed to load dashboard statistics. Please try again later.');
        }
      }
      
      if (results[1].status === 'fulfilled') {
        const customersData = results[1].value as Customer[];
        setRecentCustomers(customersData);
      } else {
        const reason = results[1].reason;
        if (!isCancelError(reason)) {
          console.error('Error fetching recent customers:', reason);
          setCustomersError('Failed to load recent customers. Please try again later.');
        }
      }
      
      if (results[2].status === 'fulfilled') {
        const bookingsData = results[2].value as Booking[];
        setRecentBookings(bookingsData);
      } else {
        const reason = results[2].reason;
        if (!isCancelError(reason)) {
          console.error('Error fetching recent bookings:', reason);
          setBookingsError('Failed to load recent bookings. Please try again later.');
        }
      }
      
      if (results[3].status === 'fulfilled') {
        const financialData = results[3].value as FinancialSummary;
        setFinancialSummary({
          totalRevenue: financialData.total_revenue,
          paidInvoices: financialData.paid_invoices,
          unpaidInvoices: financialData.pending_invoices,
          overdueInvoices: financialData.overdue_invoices
        });
      } else {
        const reason = results[3].reason;
        if (!isCancelError(reason)) {
          console.error('Error fetching financial summary:', reason);
          setFinancialError('Failed to load financial summary. Please try again later.');
        }
      }
    } catch (e: any) {
      if (!isCancelError(e)) {
        console.error('Error fetching dashboard data:', e);
        setError('Failed to load dashboard data. Please try again later.');
      }
    } finally {
      setIsLoading(false);
      // Short delay for a smoother transition
      setTimeout(() => setIsDashboardReady(true), 100);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
    // Clean up any pending requests when component unmounts
    return () => {
      // any cleanup code here
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleExportData = async (format: 'csv' | 'excel' | 'pdf' = 'excel') => {
    setIsExporting(true);
    
    try {
      const dashboardDate = new Date().toISOString().split('T')[0];
      const fileName = `dashboard_export_${dashboardDate}`;
      
      // Prepare export data
      const statsData = {
        'Total Customers': stats.totalCustomers,
        'Active Bookings': stats.activeBookings,
        'Pending Invoices': stats.pendingInvoices,
        'Revenue This Month': formatCurrency(stats.revenueThisMonth),
        'Revenue Last Month': formatCurrency(stats.revenueLastMonth),
        'Revenue Growth': `${stats.revenueGrowth}%`
      };
      
      const financialData = {
        'Total Revenue': formatCurrency(financialSummary.totalRevenue),
        'Paid Invoices': financialSummary.paidInvoices,
        'Unpaid Invoices': financialSummary.unpaidInvoices,
        'Overdue Invoices': financialSummary.overdueInvoices
      };
      
      const destinationsData = stats.topDestinations.map(d => ({
        'Destination': d.name,
        'Count': d.count
      }));
      
      const transportData = stats.transportModes.map(m => ({
        'Mode': m.mode,
        'Percentage': `${m.percentage}%`
      }));
      
      const customersData = recentCustomers.map(c => ({
        'ID': c.id,
        'Company': c.company_name,
        'Contact': `${c.first_name} ${c.last_name}`,
        'Email': c.email,
        'Phone': c.phone,
        'Status': c.status
      }));
      
      const bookingsData = recentBookings.map(b => ({
        'Booking Number': b.booking_number,
        'Status': b.status,
        'Origin': b.origin,
        'Destination': b.destination,
        'Transport Mode': b.transport_mode,
        'Ready Date': new Date(b.ready_date).toLocaleDateString(),
        'Delivery Date': new Date(b.delivery_date).toLocaleDateString()
      }));
      
      if (format === 'csv' || format === 'excel') {
        const wb = XLSX.utils.book_new();
        
        // Create worksheets for each data section
        const statsSheet = XLSX.utils.json_to_sheet([statsData]);
        const financialSheet = XLSX.utils.json_to_sheet([financialData]);
        const destinationsSheet = XLSX.utils.json_to_sheet(destinationsData);
        const transportSheet = XLSX.utils.json_to_sheet(transportData);
        const customersSheet = XLSX.utils.json_to_sheet(customersData);
        const bookingsSheet = XLSX.utils.json_to_sheet(bookingsData);
        
        // Set column widths for better readability
        const setColumnWidths = (ws: any, widths: any) => {
          ws['!cols'] = widths;
        };
        
        setColumnWidths(statsSheet, Object.keys(statsData).map(() => ({ wch: 20 })));
        setColumnWidths(financialSheet, Object.keys(financialData).map(() => ({ wch: 20 })));
        setColumnWidths(destinationsSheet, [{ wch: 25 }, { wch: 10 }]);
        setColumnWidths(transportSheet, [{ wch: 15 }, { wch: 15 }]);
        setColumnWidths(customersSheet, [{ wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 10 }]);
        setColumnWidths(bookingsSheet, [{ wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }]);
        
        // Add sheets to workbook
        XLSX.utils.book_append_sheet(wb, statsSheet, 'Dashboard Overview');
        XLSX.utils.book_append_sheet(wb, financialSheet, 'Financial Summary');
        XLSX.utils.book_append_sheet(wb, destinationsSheet, 'Top Destinations');
        XLSX.utils.book_append_sheet(wb, transportSheet, 'Transport Modes');
        XLSX.utils.book_append_sheet(wb, customersSheet, 'Recent Customers');
        XLSX.utils.book_append_sheet(wb, bookingsSheet, 'Recent Bookings');
        
        try {
          if (format === 'csv') {
            XLSX.writeFile(wb, `${fileName}.csv`);
            toast.success('Dashboard data exported as CSV');
          } else {
            XLSX.writeFile(wb, `${fileName}.xlsx`);
            toast.success('Dashboard data exported as Excel');
          }
        } catch (error) {
          console.error('Error writing file:', error);
          // Fallback to blob download
          const wbout = format === 'csv' 
            ? XLSX.write(wb, { bookType: 'csv', type: 'binary' })
            : XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
          
          const blob = new Blob([s2ab(wbout)], {
            type: format === 'csv' 
              ? 'text/csv;charset=utf-8' 
              : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${fileName}.${format === 'csv' ? 'csv' : 'xlsx'}`;
          a.click();
          window.URL.revokeObjectURL(url);
          toast.success(`Dashboard data exported as ${format.toUpperCase()}`);
        }
      } else if (format === 'pdf') {
        // Create PDF document
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Add title and date
        doc.setFontSize(16);
        doc.text('Dashboard Export', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);
        
        // Stats Overview Section
        doc.setFontSize(12);
        doc.text('Statistics Overview', 14, 30);
        
        // Start position for first table
        let yPos = 34;
        
        // Stats table
        autoTable(doc, {
          startY: yPos,
          head: [['Metric', 'Value']],
          body: Object.entries(statsData),
          theme: 'grid',
          styles: { 
            fontSize: 9,
            cellPadding: 2,
            overflow: 'linebreak',
            halign: 'left'
          },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 60 }
          },
          margin: { top: 30, left: 14, right: 14, bottom: 20 },
          didDrawPage: (data) => {
            // Update position after table is drawn
            yPos = data.cursor?.y ? data.cursor.y + 10 : yPos + 30;
          }
        });
        
        // Financial Overview
        doc.setFontSize(12);
        doc.text('Financial Overview', 14, yPos);
        
        // Financial table
        autoTable(doc, {
          startY: yPos + 4,
          head: [['Metric', 'Value']],
          body: Object.entries(financialData),
          theme: 'grid',
          styles: { 
            fontSize: 9,
            cellPadding: 2,
            overflow: 'linebreak',
            halign: 'left'
          },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 60 }
          },
          margin: { top: 30, left: 14, right: 14, bottom: 20 },
          didDrawPage: (data) => {
            // Update position after table is drawn
            yPos = data.cursor?.y ? data.cursor.y + 10 : yPos + 30;
          }
        });
        
        // Top Destinations
        doc.setFontSize(12);
        doc.text('Top Destinations', 14, yPos);
        
        // Destinations table
        autoTable(doc, {
          startY: yPos + 4,
          head: [['Destination', 'Count']],
          body: destinationsData.map(d => [d['Destination'], d['Count']]),
          theme: 'grid',
          styles: { 
            fontSize: 9,
            cellPadding: 2,
            overflow: 'linebreak',
            halign: 'left'
          },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 30 }
          },
          margin: { top: 30, left: 14, right: 14, bottom: 20 },
          didDrawPage: (data) => {
            // Update position after table is drawn
            yPos = data.cursor?.y ? data.cursor.y + 10 : yPos + 30;
          }
        });
        
        // Transport Modes
        doc.setFontSize(12);
        doc.text('Transport Modes', 14, yPos);
        
        // Transport table
        autoTable(doc, {
          startY: yPos + 4,
          head: [['Mode', 'Percentage']],
          body: transportData.map(m => [m['Mode'], m['Percentage']]),
          theme: 'grid',
          styles: { 
            fontSize: 9,
            cellPadding: 2,
            overflow: 'linebreak',
            halign: 'left'
          },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 30 }
          },
          margin: { top: 30, left: 14, right: 14, bottom: 20 },
          didDrawPage: (data) => {
            // Update position after table is drawn
            yPos = data.cursor?.y ? data.cursor.y + 10 : yPos + 30;
          }
        });
        
        // Add new page for customers and bookings
        doc.addPage();
        
        // Reset position for new page
        yPos = 15;
        
        // Recent Customers
        doc.setFontSize(14);
        doc.text('Recent Customers', 14, yPos);
        
        // Customers table
        autoTable(doc, {
          startY: yPos + 5,
          head: [['ID', 'Company', 'Contact', 'Email', 'Status']],
          body: customersData.map(c => [
            c['ID'],
            c['Company'],
            c['Contact'],
            c['Email'],
            c['Status']
          ]),
          theme: 'grid',
          styles: { 
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak',
            halign: 'left'
          },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 40 },
            2: { cellWidth: 40 },
            3: { cellWidth: 50 },
            4: { cellWidth: 20 }
          },
          margin: { top: 30, left: 14, right: 14, bottom: 20 },
          didDrawPage: (data) => {
            // Update position after table is drawn
            yPos = data.cursor?.y ? data.cursor.y + 10 : yPos + 30;
          }
        });
        
        // Recent Bookings
        doc.setFontSize(14);
        doc.text('Recent Bookings', 14, yPos);
        
        // Bookings table
        autoTable(doc, {
          startY: yPos + 4,
          head: [['Booking #', 'Status', 'Origin', 'Destination', 'Transport', 'Delivery Date']],
          body: bookingsData.map(b => [
            b['Booking Number'],
            b['Status'],
            b['Origin'],
            b['Destination'],
            b['Transport Mode'],
            b['Delivery Date']
          ]),
          theme: 'grid',
          styles: { 
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak',
            halign: 'left'
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 25 },
            2: { cellWidth: 35 },
            3: { cellWidth: 35 },
            4: { cellWidth: 25 },
            5: { cellWidth: 30 }
          },
          margin: { top: 30, left: 14, right: 14, bottom: 20 },
          didDrawPage: (data) => {
            // Update position after table is drawn
            yPos = data.cursor?.y ? data.cursor.y + 10 : yPos + 30;
          }
        });
        
        try {
          // Generate blob for download
          const blob = doc.output('blob');
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${fileName}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          toast.success('Dashboard data exported as PDF');
        } catch (error) {
          console.error('Error saving PDF:', error);
          toast.error('Failed to export PDF. Please try again.');
        }
      }
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export dashboard data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to convert string to array buffer for Excel export
  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  };

  const handleViewAllCustomers = () => {
    navigate('/customers');
  };

  const handleViewAllBookings = () => {
    navigate('/bookings');
  };
  
  const handleRetry = () => {
    fetchDashboardData();
  };

  const handleViewCustomer = (customerId: string) => {
    // If the ID is purely numeric, add 'c' prefix
    const formattedId = /^\d+$/.test(customerId) ? `c${customerId}` : customerId;
    navigate(`/customers/${formattedId}`);
  };
  
  const handleViewBooking = (bookingId: string) => {
    navigate(`/bookings/${bookingId}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <FadeIn>
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse-ring"></div>
            </div>
            <p className="text-muted-foreground text-lg">Loading dashboard data...</p>
            
            {loadingTimeoutReached && (
              <SlideInTop delay={300}>
                <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto animate-pulse-soft">
                  <div className="flex items-start">
                    <FolderSync className="text-amber-500 h-6 w-6 mt-0.5 mr-3 animate-pulse-soft" />
                    <div>
                      <h3 className="font-medium text-amber-800 text-lg">Taking longer than expected</h3>
                      <p className="text-amber-700 mt-2">
                        The server is taking longer than usual to respond. This could be due to network connectivity or database issues.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-4 bg-white hover:bg-amber-50 transition-colors duration-200 animate-pulse-soft"
                        onClick={handleRetry}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              </SlideInTop>
            )}
          </div>
        </FadeIn>
        
        {/* Skeleton Loading UI */}
        <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 mt-10">
          <div className="col-span-full">
            <SkeletonText className="h-10 w-64 mb-2" />
            <SkeletonText className="h-4 w-96" />
          </div>
          
          <SkeletonCard className="col-span-full md:col-span-2 lg:col-span-2" />
          <SkeletonCard className="col-span-full md:col-span-1 lg:col-span-2" />
          
          <div className="col-span-full md:col-span-3 lg:col-span-2">
            <SkeletonTable rows={3} />
          </div>
          
          <SkeletonCard className="col-span-full md:col-span-3 lg:col-span-2" />
          
          <div className="col-span-full md:col-span-3 lg:col-span-2">
            <SkeletonTable rows={3} />
          </div>
          
          <SkeletonCard className="col-span-full md:col-span-3 lg:col-span-2" />
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <FadeIn>
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="text-center max-w-md p-8 bg-red-50 border border-red-200 rounded-lg shadow-sm">
              <Animate type="pop" repeat={true} duration={2000}>
                <AlertTriangle className="h-14 w-14 text-destructive mx-auto mb-4" />
              </Animate>
              <h2 className="text-xl font-bold mb-4 text-red-800">Dashboard Error</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={handleRetry} className="flex items-center hover:scale-105 transition-transform duration-200">
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
      <div className={`grid gap-2 sm:gap-3 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 transition-all duration-1000 ${isDashboardReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <SlideInTop className="col-span-full">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
            <div>
              <h1 className="text-3xl font-bold">
                <span className="text-primary">Dashboard</span> <span className="text-foreground font-normal">Overview</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Real-time metrics and performance indicators for your shipping operations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleRetry} 
                disabled={isLoading} 
                className="flex items-center transition-all duration-200 hover:shadow-md hover:scale-105"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <div className="relative dropdown">
                <Button 
                  variant="default" 
                  onClick={() => handleExportData('excel')}
                  disabled={isExporting}
                  className="relative transition-all duration-200 hover:shadow-md hover:scale-105"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? 'Exporting...' : 'Export Data'}
                  {exportSuccess && (
                    <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce-subtle">
                      ✓
                    </span>
                  )}
                </Button>
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200 hidden group-hover:block dropdown-content">
                  <div className="py-1">
                    <button onClick={() => handleExportData('excel')} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <span className="mr-2">Excel</span>
                    </button>
                    <button onClick={() => handleExportData('csv')} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <span className="mr-2">CSV</span>
                    </button>
                    <button onClick={() => handleExportData('pdf')} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <span className="mr-2">PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SlideInTop>

        <SlideInLeft className="col-span-full md:col-span-2 lg:col-span-2" delay={50}>
          <Card className="hover:shadow-md transition-all duration-300">
            <StatsOverviewCard 
              totalCustomers={stats.totalCustomers}
              activeBookings={stats.activeBookings}
              pendingInvoices={stats.pendingInvoices}
              revenueThisMonth={stats.revenueThisMonth}
              revenueLastMonth={stats.revenueLastMonth}
              revenueGrowth={stats.revenueGrowth}
              error={statsError}
              onRetry={handleRetry}
            />
          </Card>
        </SlideInLeft>

        <SlideInRight className="col-span-full md:col-span-1 lg:col-span-2" delay={100}>
          <Card className="hover:shadow-md transition-all duration-300">
            <FinancialOverviewCard 
              totalRevenue={financialSummary.totalRevenue}
              paidInvoices={financialSummary.paidInvoices}
              unpaidInvoices={financialSummary.unpaidInvoices}
              overdueInvoices={financialSummary.overdueInvoices}
              error={financialError}
              onRetry={handleRetry}
            />
          </Card>
        </SlideInRight>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 col-span-full">
          <SlideInLeft className="col-span-1" delay={150}>
            <Card className="hover:shadow-md transition-all duration-300 h-full">
              <CustomerListCard 
                customers={recentCustomers}
                error={customersError}
                onRetry={handleRetry}
              >
                {(customer: any) => (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewCustomer(customer.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:animate-pop"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </CustomerListCard>
            </Card>
          </SlideInLeft>

          <SlideInRight className="col-span-1" delay={200}>
            <Card className="hover:shadow-md transition-all duration-300 h-full">
              <CardHeader className="border-b pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Globe className="h-5 w-5 mr-2 text-primary" />
                  Shipments by Destination
                </CardTitle>
                <CardDescription>Top shipping destinations by volume</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <DestinationsReportCard destinations={stats.topDestinations} />
              </CardContent>
            </Card>
          </SlideInRight>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 col-span-full">
          <SlideInLeft className="col-span-1" delay={250}>
            <Card className="hover:shadow-md transition-all duration-300 h-full">
              <BookingListCard 
                bookings={recentBookings}
                error={bookingsError}
                onRetry={handleRetry}
              >
                {(booking: any) => (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewBooking(booking.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:animate-pop"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </BookingListCard>
            </Card>
          </SlideInLeft>

          <SlideInRight className="col-span-1" delay={300}>
            <Card className="hover:shadow-md transition-all duration-300 h-full">
              <CardHeader className="border-b pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Package className="h-5 w-5 mr-2 text-primary" />
                  Transport Modes
                </CardTitle>
                <CardDescription>Distribution of transport methods</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <TransportModeReport transportModes={stats.transportModes} />
              </CardContent>
            </Card>
          </SlideInRight>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage; 