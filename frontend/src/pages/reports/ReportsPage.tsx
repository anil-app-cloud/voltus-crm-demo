import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, PieChart, Download, Calendar, Filter, FileText, Check, Loader2, X, TrendingUp, CreditCard, Wallet, Users, Clock, Package } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { getFinancialReports, getShippingReports, getCustomerReports, getAllCustomers, getInvoices, getDashboardStats } from '../../lib/api';
import axios from 'axios';
import { TransportModeReport, DestinationsReportCard } from '../../components/dashboard';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [reportType, setReportType] = useState<'financial' | 'shipping' | 'customers'>('financial');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [chartAnimated, setChartAnimated] = useState(false);
  
  // State for API data
  const [isLoading, setIsLoading] = useState(true);
  const [financialData, setFinancialData] = useState<any>({
    total_orders: 0,
    total_orders_change: 0,
    accounts_receivable: 0,
    accounts_receivable_change: 0,
    average_days_to_pay: 0,
    average_days_to_pay_change: 0,
    average_order_value: 0,
    average_order_value_change: 0,
    total_lifetime_value: 0
  });
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>({
    transportModes: [
      { mode: 'Sea', percentage: 65 },
      { mode: 'Air', percentage: 25 },
      { mode: 'Road', percentage: 8 },
      { mode: 'Rail', percentage: 2 }
    ]
  });
  
  // Use useMemo for revenueData to ensure it doesn't change on every render
  const revenueData = useMemo(() => {
    // This would be calculated from real data
    // For demo purposes, we're generating random data
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [
        Math.floor(Math.random() * 100000) + 50000,
        Math.floor(Math.random() * 100000) + 50000,
        Math.floor(Math.random() * 100000) + 50000,
        Math.floor(Math.random() * 100000) + 50000,
        Math.floor(Math.random() * 100000) + 50000,
        Math.floor(Math.random() * 100000) + 50000
      ]
    };
  }, [dateRange]); // Only recalculate when dateRange changes
  
  useEffect(() => {
    setIsPageLoaded(true);
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all data needed for reports
        const results = await Promise.allSettled([
          getFinancialReports(dateRange),
          getAllCustomers(),
          getInvoices(),
          getDashboardStats()
        ]);
        
        // Extract data safely with fallbacks
        const financialReports = results[0].status === 'fulfilled' ? results[0].value : [];
        const customersData = results[1].status === 'fulfilled' ? results[1].value : [];
        const invoicesData = results[2].status === 'fulfilled' ? results[2].value : [];
        const dashData = results[3].status === 'fulfilled' ? results[3].value : {};
        
        // Transform financial data if needed
        const financialSummary = {
          total_orders: Array.isArray(financialReports) 
            ? financialReports.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0)
            : 0,
          total_orders_change: 8.2,
          accounts_receivable: Array.isArray(invoicesData) 
            ? invoicesData.filter((inv: any) => inv.status !== 'paid')
                .reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0)
            : 0,
          accounts_receivable_change: -3.5,
          average_days_to_pay: 15,
          average_days_to_pay_change: -2,
          average_order_value: Array.isArray(invoicesData) && invoicesData.length > 0 
            ? invoicesData.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0) / invoicesData.length 
            : 0,
          average_order_value_change: 5.8,
          total_lifetime_value: Array.isArray(customersData)
            ? customersData.reduce((sum: number, cust: any) => sum + (cust.total_spent || 0), 0)
            : 0
        };
        
        setFinancialData(financialSummary);
        setCustomers(customersData);
        setInvoices(invoicesData);
        setDashboardStats(dashData);
      } catch (error: any) {
        // Only log non-cancellation errors
        if (!axios.isCancel(error) && 
            error.message !== 'Request cancelled - duplicate in flight' && 
            error.code !== 'ERR_CANCELED') {
          console.error('Error fetching report data:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [dateRange]);
  
  // Update useEffect to reset animation when report type changes as well
  useEffect(() => {
    if (isPageLoaded) {
      // Reset chart animation when date range or report type changes
      setChartAnimated(false);
      
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const chartBars = document.querySelectorAll('.chart-bar');
        
        // First reset all bars to 0 height
        chartBars.forEach((bar) => {
          if (bar instanceof HTMLElement) {
            bar.style.height = '0%';
          }
        });
        
        // Then animate them one by one
        chartBars.forEach((bar, index) => {
          setTimeout(() => {
            if (bar instanceof HTMLElement) {
              const heightPercent = (revenueData.values[index] / Math.max(...revenueData.values)) * 100;
              bar.style.height = `${heightPercent}%`;
            }
          }, 100 + index * 150); // Stagger the animations
        });
        setChartAnimated(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isPageLoaded, revenueData.values, dateRange, reportType]); // Add reportType as dependency
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleOpenExportModal = () => {
    setIsExportModalOpen(true);
    setExportSuccess(false);
  };

  const handleCloseExportModal = () => {
    setIsExportModalOpen(false);
    setExportSuccess(false);
  };

  const handleExport = () => {
    setIsExporting(true);
    
    // Create file content based on report type
    setTimeout(() => {
      let blob;
      let fileName = `${reportType}_report_${dateRange}_${new Date().toISOString().split('T')[0]}`;
      
      // Ensure we have the data to export
      const hasInvoices = Array.isArray(invoices) && invoices.length > 0;
      const hasCustomers = Array.isArray(customers) && customers.length > 0;
      const hasOrders = Array.isArray(orders) && orders.length > 0;
      
      // Log data availability for debugging
      console.log(`Export data check - Invoices: ${hasInvoices ? invoices.length : 0}, Customers: ${hasCustomers ? customers.length : 0}`);
      
      if (exportFormat === 'csv') {
        try {
          // Use xlsx library for CSV generation to ensure consistent formatting
          const workbook = XLSX.utils.book_new();
          let worksheet;
          
          if (reportType === 'financial') {
            // Create workbook for financial data
            
            // Summary data
            const summaryData = [
              ['Financial Report'],
              [`Date Range: ${dateRange}`],
              [`Generated: ${new Date().toLocaleString()}`],
              [],
              ['Summary Metrics'],
              ['Metric', 'Value', 'Change'],
              ['Total Revenue', formatCurrency(financialData.total_orders), `+${financialData.total_orders_change}%`],
              ['Accounts Receivable', formatCurrency(financialData.accounts_receivable), `${financialData.accounts_receivable_change}%`],
              ['Avg. Days to Pay', `${financialData.average_days_to_pay} days`, `${financialData.average_days_to_pay_change} days`],
              ['Avg. Order Value', formatCurrency(financialData.average_order_value), `+${financialData.average_order_value_change}%`],
              [],
              ['Monthly Revenue'],
              ['Month', 'Revenue']
            ];
            
            // Add monthly revenue data
            revenueData.labels.forEach((month, index) => {
              summaryData.push([month, formatCurrency(revenueData.values[index])]);
            });
            
            // Add invoice data if available
            if (hasInvoices) {
              summaryData.push(
                [],
                ['Invoice List'],
                ['Invoice #', 'Customer', 'Amount', 'Status', 'Date Issued', 'Due Date']
              );
              
              invoices.slice(0, 10).forEach(invoice => {
                const customer = customers?.find(c => c.id === invoice.customer_id) || null;
                summaryData.push([
                  invoice.invoice_number || '',
                  customer?.company_name || 'Unknown',
                  formatCurrency(invoice.amount || 0),
                  invoice.status || '',
                  formatDate(invoice.date_issued) || '',
                  formatDate(invoice.date_due) || ''
                ]);
              });
            }
            
            worksheet = XLSX.utils.aoa_to_sheet(summaryData);
          } 
          else if (reportType === 'shipping') {
            // Create workbook for shipping data
            
            // Summary data
            const summaryData = [
              ['Shipping Report'],
              [`Date Range: ${dateRange}`],
              [`Generated: ${new Date().toLocaleString()}`],
              [],
              ['Summary Metrics'],
              ['Metric', 'Value'],
              ['Active Shipments', orders.filter(o => o.status === 'processing').length.toString()],
              ['Completed Shipments', orders.filter(o => o.status === 'completed').length.toString()],
              ['Cancelled Shipments', orders.filter(o => o.status === 'cancelled').length.toString()],
              ['Avg. Transit Time', '8.5 days'],
              [],
              ['Transport Mode Breakdown'],
              ['Mode', 'Percentage']
            ];
            
            // Add transport mode data
            const transportModes = dashboardStats.transportModes || [
              { mode: 'Sea', percentage: 65 },
              { mode: 'Air', percentage: 25 },
              { mode: 'Road', percentage: 8 },
              { mode: 'Rail', percentage: 2 }
            ];
            
            transportModes.forEach(mode => {
              summaryData.push([mode.mode, `${mode.percentage}%`]);
            });
            
            // Add shipment data if available
            if (hasOrders) {
              summaryData.push(
                [],
                ['Recent Shipments'],
                ['Order #', 'Customer', 'Origin', 'Destination', 'Status', 'Date']
              );
              
              orders.slice(0, 10).forEach(order => {
                const customer = customers?.find(c => c.id === order.customer_id) || null;
                summaryData.push([
                  order.order_number || '',
                  customer?.company_name || 'Unknown',
                  order.origin || '',
                  order.destination || '',
                  order.status || '',
                  formatDate(order.date_created) || ''
                ]);
              });
            }
            
            worksheet = XLSX.utils.aoa_to_sheet(summaryData);
          } 
          else if (reportType === 'customers') {
            // Create workbook for customer data
            
            // Summary data
            const summaryData = [
              ['Customer Report'],
              [`Date Range: ${dateRange}`],
              [`Generated: ${new Date().toLocaleString()}`],
              [],
              ['Summary Metrics'],
              ['Metric', 'Value'],
              ['Total Customers', customers.length.toString()],
              ['Active Customers', customers.filter(c => c.status === 'Active').length.toString()],
              ['Lifetime Value', formatCurrency(financialData.total_lifetime_value)],
              ['New Customers', '3'],
              []
            ];
            
            // Add customer data if available
            if (hasCustomers) {
              summaryData.push(
                ['Top Customers'],
                ['Customer', 'Status', 'Total Orders', 'Total Spent', 'Country']
              );
              
              customers.sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
                .slice(0, 10)
                .forEach(customer => {
                  summaryData.push([
                    customer.company_name || '',
                    customer.status || '',
                    (customer.total_orders || 0).toString(),
                    formatCurrency(customer.total_spent || 0),
                    customer.address?.country || 'Unknown'
                  ]);
                });
            }
            
            worksheet = XLSX.utils.aoa_to_sheet(summaryData);
          }
          
          // Add the worksheet to the workbook
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
          
          // Generate CSV file
          const csvContent = XLSX.utils.sheet_to_csv(worksheet);
          const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          
          // Create download link
          const url = URL.createObjectURL(csvBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${fileName}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
        } catch (e) {
          console.error('Error creating CSV file:', e);
          showToast({ message: 'Error creating CSV report', type: 'error' });
        }
      } 
      else if (exportFormat === 'pdf') {
        try {
          // Use jsPDF for proper PDF generation
          const doc = new jsPDF();
          let yPos = 10;
          const lineHeight = 7;
          const margin = 15;
          
          // Helper function to add text and advance position
          const addText = (text: string, size = 10, isBold = false) => {
            if (isBold) {
              doc.setFont("helvetica", "bold");
            } else {
              doc.setFont("helvetica", "normal");
            }
            doc.setFontSize(size);
            doc.text(text, margin, yPos);
            yPos += lineHeight;
          };
          
          // Add horizontal line
          const addLine = () => {
            yPos += 2;
            doc.line(margin, yPos, doc.internal.pageSize.width - margin, yPos);
            yPos += 5;
          };
          
          if (reportType === 'financial') {
            // Add title and header
            addText('FINANCIAL REPORT', 16, true);
            addLine();
            
            addText(`Date Range: ${dateRange}`, 10);
            addText(`Generated: ${new Date().toLocaleString()}`, 10);
            yPos += 5;
            
            // Summary metrics
            addText('SUMMARY METRICS', 12, true);
            addLine();
            
            addText(`Total Revenue: ${formatCurrency(financialData.total_orders)} (+${financialData.total_orders_change}%)`, 10);
            addText(`Accounts Receivable: ${formatCurrency(financialData.accounts_receivable)} (${financialData.accounts_receivable_change}%)`, 10);
            addText(`Avg. Days to Pay: ${financialData.average_days_to_pay} days (${financialData.average_days_to_pay_change} days)`, 10);
            addText(`Avg. Order Value: ${formatCurrency(financialData.average_order_value)} (+${financialData.average_order_value_change}%)`, 10);
            yPos += 5;
            
            // Monthly revenue
            addText('MONTHLY REVENUE', 12, true);
            addLine();
            
            revenueData.labels.forEach((month, index) => {
              addText(`${month}: ${formatCurrency(revenueData.values[index])}`, 10);
            });
            yPos += 5;
            
            // Invoice list
            if (hasInvoices) {
              addText('RECENT INVOICES', 12, true);
              addLine();
              
              // Check if we need a new page for invoices
              if (yPos > 200) {
                doc.addPage();
                yPos = 15;
              }
              
              invoices.slice(0, 5).forEach((invoice, idx) => {
                const customer = customers?.find(c => c.id === invoice.customer_id) || null;
                
                // Add a page break if needed
                if (yPos > 250 && idx > 0) {
                  doc.addPage();
                  yPos = 15;
                }
                
                addText(`Invoice #: ${invoice.invoice_number || 'N/A'}`, 10);
                addText(`Customer: ${customer?.company_name || 'Unknown'}`, 10);
                addText(`Amount: ${formatCurrency(invoice.amount || 0)}`, 10);
                addText(`Status: ${invoice.status || 'N/A'}`, 10);
                addText(`Date Issued: ${formatDate(invoice.date_issued) || 'N/A'}`, 10);
                addText(`Due Date: ${formatDate(invoice.date_due) || 'N/A'}`, 10);
                yPos += 3;
                doc.line(margin, yPos, 100, yPos);
                yPos += 5;
              });
            }
          } 
          else if (reportType === 'shipping') {
            // Shipping report generation - similar structure to financial
            addText('SHIPPING REPORT', 16, true);
            addLine();
            
            addText(`Date Range: ${dateRange}`, 10);
            addText(`Generated: ${new Date().toLocaleString()}`, 10);
            yPos += 5;
            
            addText('SUMMARY METRICS', 12, true);
            addLine();
            
            addText(`Active Shipments: ${orders.filter(o => o.status === 'processing').length}`, 10);
            addText(`Completed Shipments: ${orders.filter(o => o.status === 'completed').length}`, 10);
            addText(`Cancelled Shipments: ${orders.filter(o => o.status === 'cancelled').length}`, 10);
            addText(`Avg. Transit Time: 8.5 days`, 10);
            yPos += 5;
            
            const transportModes = dashboardStats.transportModes || [
              { mode: 'Sea', percentage: 65 },
              { mode: 'Air', percentage: 25 },
              { mode: 'Road', percentage: 8 },
              { mode: 'Rail', percentage: 2 }
            ];
            
            addText('TRANSPORT MODE BREAKDOWN', 12, true);
            addLine();
            
            transportModes.forEach(mode => {
              addText(`${mode.mode}: ${mode.percentage}%`, 10);
            });
            yPos += 5;
            
            if (hasOrders) {
              addText('RECENT SHIPMENTS', 12, true);
              addLine();
              
              // Check if we need a new page
              if (yPos > 200) {
                doc.addPage();
                yPos = 15;
              }
              
              orders.slice(0, 5).forEach((order, idx) => {
                const customer = customers?.find(c => c.id === order.customer_id) || null;
                
                // Add a page break if needed
                if (yPos > 250 && idx > 0) {
                  doc.addPage();
                  yPos = 15;
                }
                
                addText(`Order #: ${order.order_number || 'N/A'}`, 10);
                addText(`Customer: ${customer?.company_name || 'Unknown'}`, 10);
                addText(`Route: ${order.origin || 'N/A'} → ${order.destination || 'N/A'}`, 10);
                addText(`Status: ${order.status || 'N/A'}`, 10);
                addText(`Date: ${formatDate(order.date_created) || 'N/A'}`, 10);
                yPos += 3;
                doc.line(margin, yPos, 100, yPos);
                yPos += 5;
              });
            }
          }
          else if (reportType === 'customers') {
            // Customer report generation
            addText('CUSTOMER REPORT', 16, true);
            addLine();
            
            addText(`Date Range: ${dateRange}`, 10);
            addText(`Generated: ${new Date().toLocaleString()}`, 10);
            yPos += 5;
            
            addText('SUMMARY METRICS', 12, true);
            addLine();
            
            addText(`Total Customers: ${customers.length}`, 10);
            addText(`Active Customers: ${customers.filter(c => c.status === 'Active').length}`, 10);
            addText(`Lifetime Value: ${formatCurrency(financialData.total_lifetime_value)}`, 10);
            addText(`New Customers: 3`, 10);
            yPos += 5;
            
            if (hasCustomers) {
              addText('TOP CUSTOMERS', 12, true);
              addLine();
              
              // Check if we need a new page
              if (yPos > 200) {
                doc.addPage();
                yPos = 15;
              }
              
              customers.sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
                .slice(0, 5).forEach((customer, idx) => {
                // Add a page break if needed
                if (yPos > 250 && idx > 0) {
                  doc.addPage();
                  yPos = 15;
                }
                
                addText(`Company: ${customer.company_name || 'N/A'}`, 10);
                addText(`Status: ${customer.status || 'N/A'}`, 10);
                addText(`Total Orders: ${customer.total_orders || 0}`, 10);
                addText(`Total Spent: ${formatCurrency(customer.total_spent || 0)}`, 10);
                addText(`Location: ${customer.address?.city || 'N/A'}, ${customer.address?.country || 'N/A'}`, 10);
                yPos += 3;
                doc.line(margin, yPos, 100, yPos);
                yPos += 5;
              });
            }
          }
          
          // Save the PDF
          doc.save(`${fileName}.pdf`);
          
        } catch (e) {
          console.error('Error creating PDF:', e);
          showToast({ message: 'Error creating PDF report', type: 'error' });
        }
      }
      else if (exportFormat === 'excel') {
        try {
          // Use xlsx library for proper Excel file generation
          const workbook = XLSX.utils.book_new();
          
          if (reportType === 'financial') {
            // Create workbook with multiple sheets
            
            // Summary sheet
            const summaryData = [
              ['Financial Report', dateRange, new Date().toLocaleString()],
              [],
              ['Summary Metrics'],
              ['Metric', 'Value', 'Change'],
              ['Total Revenue', formatCurrency(financialData.total_orders), `+${financialData.total_orders_change}%`],
              ['Accounts Receivable', formatCurrency(financialData.accounts_receivable), `${financialData.accounts_receivable_change}%`],
              ['Avg. Days to Pay', `${financialData.average_days_to_pay} days`, `${financialData.average_days_to_pay_change} days`],
              ['Avg. Order Value', formatCurrency(financialData.average_order_value), `+${financialData.average_order_value_change}%`],
              [],
              ['Monthly Revenue'],
              ['Month', 'Revenue']
            ];
            
            // Add monthly revenue data
            revenueData.labels.forEach((month, index) => {
              summaryData.push([month, formatCurrency(revenueData.values[index])]);
            });
            
            // Create sheet from summary data
            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
            
            // Invoice sheet (if we have invoices)
            if (hasInvoices) {
              const invoiceHeaders = ['Invoice #', 'Customer', 'Amount', 'Status', 'Date Issued', 'Due Date'];
              const invoiceRows = invoices.map(invoice => {
                const customer = customers?.find(c => c.id === invoice.customer_id) || null;
                return [
                  invoice.invoice_number || '',
                  customer?.company_name || 'Unknown',
                  invoice.amount || 0, // Keep as number for Excel
                  invoice.status || '',
                  formatDate(invoice.date_issued) || '',
                  formatDate(invoice.date_due) || ''
                ];
              });
              
              // Create full invoice data array with headers
              const invoiceData = [invoiceHeaders, ...invoiceRows];
              
              // Create sheet from invoice data
              const invoiceSheet = XLSX.utils.aoa_to_sheet(invoiceData);
              
              // Set column width for better readability
              const invoiceCols = [
                { wch: 12 }, // Invoice #
                { wch: 25 }, // Customer
                { wch: 12 }, // Amount
                { wch: 10 }, // Status
                { wch: 12 }, // Date Issued
                { wch: 12 }  // Due Date
              ];
              invoiceSheet['!cols'] = invoiceCols;
              
              // Add the invoice sheet to the workbook
              XLSX.utils.book_append_sheet(workbook, invoiceSheet, 'Invoices');
            }
          }
          else if (reportType === 'shipping') {
            // Create shipping report with multiple sheets
            
            // Summary sheet
            const summaryData = [
              ['Shipping Report', dateRange, new Date().toLocaleString()],
              [],
              ['Summary Metrics'],
              ['Metric', 'Value'],
              ['Active Shipments', orders.filter(o => o.status === 'processing').length],
              ['Completed Shipments', orders.filter(o => o.status === 'completed').length],
              ['Cancelled Shipments', orders.filter(o => o.status === 'cancelled').length],
              ['Avg. Transit Time', '8.5 days'],
              [],
              ['Transport Mode Breakdown'],
              ['Mode', 'Percentage']
            ];
            
            // Add transport mode data
            const transportModes = dashboardStats.transportModes || [
              { mode: 'Sea', percentage: 65 },
              { mode: 'Air', percentage: 25 },
              { mode: 'Road', percentage: 8 },
              { mode: 'Rail', percentage: 2 }
            ];
            
            transportModes.forEach(mode => {
              summaryData.push([mode.mode, `${mode.percentage}%`]);
            });
            
            // Create sheet from summary data
            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
            
            // Shipments sheet (if we have orders)
            if (hasOrders) {
              const shipmentHeaders = ['Order #', 'Customer', 'Origin', 'Destination', 'Status', 'Date'];
              const shipmentRows = orders.map(order => {
                const customer = customers?.find(c => c.id === order.customer_id) || null;
                return [
                  order.order_number || '',
                  customer?.company_name || 'Unknown',
                  order.origin || '',
                  order.destination || '',
                  order.status || '',
                  formatDate(order.date_created) || ''
                ];
              });
              
              // Create full shipment data array with headers
              const shipmentData = [shipmentHeaders, ...shipmentRows];
              
              // Create sheet from shipment data
              const shipmentSheet = XLSX.utils.aoa_to_sheet(shipmentData);
              
              // Set column width for better readability
              const shipmentCols = [
                { wch: 12 }, // Order #
                { wch: 25 }, // Customer
                { wch: 15 }, // Origin
                { wch: 15 }, // Destination
                { wch: 12 }, // Status
                { wch: 12 }  // Date
              ];
              shipmentSheet['!cols'] = shipmentCols;
              
              // Add the shipment sheet to the workbook
              XLSX.utils.book_append_sheet(workbook, shipmentSheet, 'Shipments');
            }
          }
          else if (reportType === 'customers') {
            // Create customer report with multiple sheets
            
            // Summary sheet
            const summaryData = [
              ['Customer Report', dateRange, new Date().toLocaleString()],
              [],
              ['Summary Metrics'],
              ['Metric', 'Value'],
              ['Total Customers', customers.length],
              ['Active Customers', customers.filter(c => c.status === 'Active').length],
              ['Lifetime Value', formatCurrency(financialData.total_lifetime_value)],
              ['New Customers', 3]
            ];
            
            // Create sheet from summary data
            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
            
            // Customers sheet (if we have customers)
            if (hasCustomers) {
              const customerHeaders = ['Company', 'Status', 'Total Orders', 'Total Spent', 'Country'];
              const customerRows = customers
                .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
                .map(customer => {
                  return [
                    customer.company_name || '',
                    customer.status || '',
                    customer.total_orders || 0,
                    customer.total_spent || 0, // Keep as number for Excel
                    customer.address?.country || 'Unknown'
                  ];
                });
              
              // Create full customer data array with headers
              const customerData = [customerHeaders, ...customerRows];
              
              // Create sheet from customer data
              const customerSheet = XLSX.utils.aoa_to_sheet(customerData);
              
              // Set column width for better readability
              const customerCols = [
                { wch: 25 }, // Company
                { wch: 12 }, // Status
                { wch: 12 }, // Total Orders
                { wch: 12 }, // Total Spent
                { wch: 15 }  // Country
              ];
              customerSheet['!cols'] = customerCols;
              
              // Add the customer sheet to the workbook
              XLSX.utils.book_append_sheet(workbook, customerSheet, 'Customers');
            }
          }
          
          // Write workbook and trigger download
          XLSX.writeFile(workbook, `${fileName}.xlsx`);
          
        } catch (e) {
          console.error('Error creating Excel file:', e);
          showToast({ message: 'Error creating Excel report', type: 'error' });
        }
      }
      
      setIsExporting(false);
      setExportSuccess(true);
    }, 1500);
  };
  
  // Add a helper toast function if not already defined
  const showToast = ({ message, type }: { message: string, type: 'success' | 'error' }) => {
    const toastElement = document.createElement('div');
    toastElement.innerHTML = message;
    toastElement.style.position = 'fixed';
    toastElement.style.bottom = '20px';
    toastElement.style.right = '20px';
    toastElement.style.backgroundColor = type === 'success' ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)';
    toastElement.style.color = 'white';
    toastElement.style.padding = '10px 15px';
    toastElement.style.borderRadius = '4px';
    toastElement.style.zIndex = '9999';
    document.body.appendChild(toastElement);
    
    setTimeout(() => {
      document.body.removeChild(toastElement);
    }, 3000);
  };
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Helper to get CSS class for financial growth indicators
  const getGrowthClass = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };
  
  // Helper to get CSS icon for financial growth indicators
  const getGrowthIcon = (value: number) => {
    return value >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" />;
  };

  const getIconForMetric = (metricName: string) => {
    switch(metricName) {
      case 'total_orders': 
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case 'accounts_receivable': 
        return <Wallet className="h-5 w-5 text-amber-500" />;
      case 'average_days_to_pay': 
        return <Clock className="h-5 w-5 text-purple-500" />;
      case 'average_order_value': 
        return <BarChart className="h-5 w-5 text-green-500" />;
      default: 
        return <Users className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Layout>
      <div className={`space-y-8 transition-all duration-500 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold animate-slide-in-left">
              <span className="text-primary">Reports</span> & Analytics
            </h1>
            <p className="text-muted-foreground mt-1 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
              Track performance metrics and business insights
            </p>
          </div>

          <div className="flex items-center space-x-4 animate-slide-in-right">
            <div className="flex rounded-md overflow-hidden border shadow-sm">
              {(['week', 'month', 'quarter', 'year'] as const).map((range, index) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    dateRange === range
                      ? 'bg-primary text-white shadow-inner'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
            
            <Button 
              onClick={handleOpenExportModal}
              className="flex items-center bg-primary hover:bg-primary/90 text-white transition-all duration-200 hover:shadow-lg animate-slide-in-right"
              style={{ animationDelay: '0.3s' }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-4 pb-2 animate-fade-in">
          {(['financial', 'shipping', 'customers'] as const).map((type, index) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                reportType === type
                  ? 'bg-primary text-white shadow-md scale-105'
                  : 'bg-muted/20 text-muted-foreground hover:bg-muted/40'
              }`}
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              {type === 'financial' && <BarChart className="h-4 w-4 mr-2 inline-block" />}
              {type === 'shipping' && <Package className="h-4 w-4 mr-2 inline-block" />}
              {type === 'customers' && <Users className="h-4 w-4 mr-2 inline-block" />}
              {type.charAt(0).toUpperCase() + type.slice(1)} Reports
            </button>
          ))}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {['total_orders', 'accounts_receivable', 'average_days_to_pay', 'average_order_value'].map((metric, idx) => {
            const value = (financialData as any)[metric] || 0;
            const changeKey = `${metric}_change`;
            const change = (financialData as any)[changeKey] || 0;
            
            let displayValue = '';
            let label = '';
            
            switch(metric) {
              case 'total_orders':
                displayValue = formatCurrency(value);
                label = 'Total Revenue';
                break;
              case 'accounts_receivable':
                displayValue = formatCurrency(value);
                label = 'Accounts Receivable';
                break;
              case 'average_days_to_pay':
                displayValue = `${value} days`;
                label = 'Avg. Days to Pay';
                break;
              case 'average_order_value':
                displayValue = formatCurrency(value);
                label = 'Avg. Order Value';
                break;
            }
            
            return (
              <Card 
                key={metric} 
                className="border-l-4 hover:shadow-md transition-all duration-300 animate-fade-in hover:-translate-y-1"
                style={{ 
                  borderLeftColor: `var(--${idx % 2 === 0 ? 'primary' : 'secondary'})`,
                  animationDelay: `${idx * 0.1}s` 
                }}
              >
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <div className="p-2 bg-muted/20 rounded-full">
                    {getIconForMetric(metric)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayValue}</div>
                  <div className={`flex items-center mt-1 text-xs font-medium ${getGrowthClass(change)}`}>
                    {getGrowthIcon(change)}
                    <span>{change > 0 ? '+' : ''}{change}% </span>
                    <span className="text-muted-foreground ml-1">vs previous {dateRange}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2 hover:shadow-lg transition-all duration-300 animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-primary" />
                Revenue Overview
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Daily</Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs bg-muted/50">Monthly</Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Yearly</Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                {/* Enhanced animated revenue chart */}
                <div className="w-full h-full flex flex-col">
                  {/* Add y-axis labels */}
                  <div className="flex items-stretch h-full">
                    <div className="flex flex-col justify-between pr-2 text-xs text-muted-foreground">
                      {[5, 4, 3, 2, 1, 0].map((num) => (
                        <div key={num} className="flex items-center h-10">
                          <span>${num === 0 ? '0' : `${num}0K`}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex-1">
                      {/* Grid lines */}
                      <div className="relative h-full">
                        {[0, 1, 2, 3, 4, 5].map((num) => (
                          <div 
                            key={num} 
                            className="absolute w-full border-t border-dashed border-muted-foreground/20" 
                            style={{ bottom: `${num * 20}%` }}
                          ></div>
                        ))}
                        
                        <div className="flex justify-between text-xs text-muted-foreground mb-2 pt-2">
                          {revenueData.labels.map((month) => (
                            <div key={month} className="font-medium">{month}</div>
                          ))}
                        </div>
                        
                        <div className="flex items-end h-full space-x-2 pt-6 pb-6">
                          {revenueData.values.map((value, index) => {
                            return (
                              <div key={index} className="flex-1 flex flex-col items-center group relative h-[80%] cursor-pointer">
                                <div 
                                  className="chart-bar absolute bottom-0 w-full bg-gradient-to-t from-primary/90 to-primary/30 rounded-t-md group-hover:from-primary group-hover:to-primary/50 transition-all duration-500 cursor-pointer shadow-md transform group-hover:scale-105 group-hover:shadow-lg group-hover:ring-2 ring-primary/20 ring-offset-2 ring-offset-transparent"
                                  style={{ 
                                    height: '0%',
                                    transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease, box-shadow 0.3s ease',
                                    animationFillMode: 'forwards',
                                    maxWidth: 'calc(100% - 10px)',
                                    marginLeft: '5px',
                                  }}
                                >
                                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background border border-border shadow-lg rounded-md px-2 py-1 text-xs z-10 whitespace-nowrap">
                                    {formatCurrency(value)}
                                  </div>
                                </div>
                                {/* Add value indicator dots */}
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ marginBottom: '-0.25rem' }}></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chart legend */}
              <div className="flex justify-center space-x-6 mt-4 pt-4 border-t">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-sm bg-primary/80 mr-2"></div>
                  <span className="text-xs text-muted-foreground">Monthly Revenue</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-sm bg-secondary/80 mr-2"></div>
                  <span className="text-xs text-muted-foreground">Target</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-primary" />
                Transport Modes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <TransportModeReport transportModes={dashboardStats.transportModes} />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 hover:shadow-lg transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Recent Invoices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.slice(0, 5).map((invoice, index) => {
                      const customer = customers?.find(c => c.id === invoice.customer_id) || null;
                      return (
                        <tr 
                          key={invoice.id} 
                          className="border-b last:border-0 hover:bg-muted/20 transition-colors group animate-fade-in"
                          style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                        >
                          <td className="px-4 py-3 text-sm">{invoice.invoice_number}</td>
                          <td className="px-4 py-3 text-sm">{customer?.company_name || 'Unknown'}</td>
                          <td className="px-4 py-3 text-sm">{formatDate(invoice.date_issued)}</td>
                          <td className="px-4 py-3 text-sm font-medium">{formatCurrency(invoice.amount)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'due' ? 'bg-blue-100 text-blue-800' :
                              invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {invoice.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Top Customers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {(customers || []).slice(0, 5).map((customer, index) => (
                  <div 
                    key={customer.id} 
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors group animate-fade-in"
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {customer.company_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{customer.company_name}</div>
                        <div className="text-xs text-muted-foreground">{customer.orders_count || 0} orders</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">{formatCurrency(customer.total_spent || 0)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Export Report</h3>
              <button onClick={handleCloseExportModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {exportSuccess ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 p-2 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">Export Successful</h3>
                <p className="text-muted-foreground mb-6">Your report has been downloaded.</p>
                <Button onClick={handleCloseExportModal}>Done</Button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Report Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['financial', 'shipping', 'customers'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setReportType(type)}
                        className={`px-3 py-2 border rounded-md text-sm flex items-center justify-center transition-colors ${
                          reportType === type
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {type === 'financial' && <BarChart className="h-4 w-4 mr-2" />}
                        {type === 'shipping' && <Package className="h-4 w-4 mr-2" />}
                        {type === 'customers' && <Users className="h-4 w-4 mr-2" />}
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">Export Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['csv', 'pdf', 'excel'] as const).map(format => (
                      <button
                        key={format}
                        onClick={() => setExportFormat(format)}
                        className={`px-3 py-2 border rounded-md text-sm uppercase transition-colors ${
                          exportFormat === format
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="min-w-[120px]"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ReportsPage; 