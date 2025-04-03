import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Download, Search, Eye, ArrowUpRight, FileText, X, Check } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { getInvoices, getCustomerDetails, getInvoiceById } from '../../lib/api';
import { Invoice } from '../../types';
import { createPdfContent, downloadFile } from '../../utils/pdfUtils';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Helper function to check if an error is an axios cancellation error
const isCancelError = (error: any): boolean => {
  return axios.isCancel(error) || 
    (error && error.message === 'Request cancelled - duplicate in flight') ||
    (error && error.code === 'ERR_CANCELED');
};

const InvoicesPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [exportDateRange, setExportDateRange] = useState<'all' | 'current-month' | 'last-month' | 'custom'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const invoicesData = await getInvoices();
        setInvoices(invoicesData);
        setFilteredInvoices(invoicesData);
        
        // Fetch customers data
        const customerMap: any[] = [];
        for (const invoice of invoicesData) {
          if (invoice.customer_id && !customerMap.some(c => c.id === invoice.customer_id)) {
            try {
              const customerDetails = await getCustomerDetails(invoice.customer_id);
              customerMap.push(customerDetails);
            } catch (error) {
              if (!isCancelError(error)) {
                console.error(`Error fetching customer ${invoice.customer_id}:`, error);
              }
            }
          }
        }
        setCustomers(customerMap);
      } catch (error) {
        if (!isCancelError(error)) {
          console.error('Error fetching invoices:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let results = invoices;
    
    if (searchTerm) {
      results = results.filter(
        invoice => 
          invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter) {
      results = results.filter(invoice => invoice.status === statusFilter);
    }
    
    setFilteredInvoices(results);
  }, [searchTerm, statusFilter, invoices]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status === statusFilter ? null : status);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceDetailOpen(true);
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
    
    // Filter invoices based on selected date range
    let invoicesToExport = [...filteredInvoices];
    const today = new Date();
    
    if (exportDateRange === 'current-month') {
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      invoicesToExport = invoicesToExport.filter(invoice => {
        const issueDate = new Date(invoice.date_issued);
        return issueDate.getMonth() === currentMonth && issueDate.getFullYear() === currentYear;
      });
    } else if (exportDateRange === 'last-month') {
      const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
      const lastMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
      invoicesToExport = invoicesToExport.filter(invoice => {
        const issueDate = new Date(invoice.date_issued);
        return issueDate.getMonth() === lastMonth && issueDate.getFullYear() === lastMonthYear;
      });
    }
    
    // Generate content based on the export format
    setTimeout(() => {
      // Log data availability for debugging
      console.log(`Exporting ${invoicesToExport.length} invoices in ${exportFormat} format`);
      
      let fileName = `invoices_export_${new Date().toISOString().split('T')[0]}`;
      
      try {
        if (exportFormat === 'csv') {
          // Use xlsx library for CSV generation to ensure consistent formatting
          const workbook = XLSX.utils.book_new();
          
          // Prepare invoice data for export
          const headers = ['Invoice Number', 'Customer', 'Order Number', 'Amount', 'Date Issued', 'Due Date', 'Status', 'Days Until Due'];
          
          // Create rows data
          const rows = invoicesToExport.map(invoice => {
            const customer = getCustomerName(invoice.customer_id);
            const orderNumber = getOrderNumber(invoice.order_id);
            const daysUntilDue = getDaysUntilDue(invoice.date_due);
            
            return [
              invoice.invoice_number,
              customer,
              orderNumber,
              invoice.amount, // Keep as number for better data format
              formatDate(invoice.date_issued),
              formatDate(invoice.date_due),
              invoice.status,
              daysUntilDue
            ];
          });
          
          // Create worksheet with headers and rows
          const wsData = [headers, ...rows];
          const worksheet = XLSX.utils.aoa_to_sheet(wsData);
          
          // Set column widths for better readability
          const widths = [
            { wch: 15 },  // Invoice Number
            { wch: 25 },  // Customer
            { wch: 12 },  // Order Number 
            { wch: 12 },  // Amount
            { wch: 12 },  // Date Issued
            { wch: 12 },  // Due Date
            { wch: 12 },  // Status
            { wch: 15 }   // Days Until Due
          ];
          worksheet['!cols'] = widths;
          
          // Add worksheet to workbook
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
          
          // Convert to CSV
          const csvContent = XLSX.utils.sheet_to_csv(worksheet);
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          
          // Download the file
          downloadFile(blob, `${fileName}.csv`);
        } 
        else if (exportFormat === 'pdf') {
          // Use jsPDF for proper PDF generation
          const doc = new jsPDF();
          
          // Set initial position and line height
          let yPos = 15;
          const lineHeight = 8;
          const margin = 15;
          const pageWidth = doc.internal.pageSize.width;
          
          // Helper functions for PDF generation
          const addText = (text, x, size = 10, isBold = false) => {
            doc.setFontSize(size);
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');
            doc.text(text, x, yPos);
            yPos += lineHeight;
          };
          
          const addHeaderRow = () => {
            // Add table header with background
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yPos - 5, pageWidth - (margin * 2), lineHeight + 2, 'F');
            
            // Header columns
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            
            const colWidths = [25, 35, 25, 25, 25, 25, 20];
            let xPos = margin;
            
            ['Invoice #', 'Customer', 'Amount', 'Date Issued', 'Due Date', 'Status', 'Days Due'].forEach((header, i) => {
              doc.text(header, xPos, yPos);
              xPos += colWidths[i];
            });
            
            yPos += lineHeight + 2;
          };
          
          // Add title and date
          addText('INVOICE EXPORT', margin, 16, true);
          addText(`Date Range: ${exportDateRange}`, margin, 10);
          addText(`Generated: ${new Date().toLocaleString()}`, margin, 10);
          yPos += 5;
          
          // Add table header
          addHeaderRow();
          
          // Add invoice data
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          
          invoicesToExport.forEach((invoice, index) => {
            // Check if we need a new page
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
              addHeaderRow();
            }
            
            const customer = getCustomerName(invoice.customer_id);
            const daysUntilDue = getDaysUntilDue(invoice.date_due);
            
            // Set alternating row background
            if (index % 2 === 0) {
              doc.setFillColor(252, 252, 252);
              doc.rect(margin, yPos - 5, pageWidth - (margin * 2), lineHeight + 2, 'F');
            }
            
            // Add row data
            let xPos = margin;
            const colWidths = [25, 35, 25, 25, 25, 25, 20];
            
            [
              invoice.invoice_number, 
              customer.length > 15 ? customer.substring(0, 15) + '...' : customer,
              formatCurrency(invoice.amount),
              formatDate(invoice.date_issued),
              formatDate(invoice.date_due),
              invoice.status,
              daysUntilDue.toString()
            ].forEach((text, i) => {
              doc.text(text, xPos, yPos);
              xPos += colWidths[i];
            });
            
            yPos += lineHeight + 2;
          });
          
          // Add summary information
          yPos += 5;
          addText(`Total Invoices: ${invoicesToExport.length}`, margin, 10, true);
          addText(`Total Value: ${formatCurrency(invoicesToExport.reduce((sum, invoice) => sum + invoice.amount, 0))}`, margin, 10, true);
          
          // Save the PDF
          doc.save(`${fileName}.pdf`);
        }
        else if (exportFormat === 'excel') {
          // Use xlsx library for proper Excel file generation
          const workbook = XLSX.utils.book_new();
          
          // Create summary sheet with metadata
          const summaryData = [
            ['Invoice Export'],
            [`Date Range: ${exportDateRange}`],
            [`Generated: ${new Date().toLocaleString()}`],
            [],
            ['Summary'],
            ['Total Invoices', invoicesToExport.length],
            ['Total Value', invoicesToExport.reduce((sum, invoice) => sum + invoice.amount, 0)],
            ['Status Breakdown'],
            ['Status', 'Count', 'Value']
          ];
          
          // Add status breakdown
          const statusGroups = invoicesToExport.reduce((acc, invoice) => {
            if (!acc[invoice.status]) {
              acc[invoice.status] = { count: 0, value: 0 };
            }
            acc[invoice.status].count += 1;
            acc[invoice.status].value += invoice.amount;
            return acc;
          }, {});
          
          Object.entries(statusGroups).forEach(([status, data]) => {
            summaryData.push([status, (data as any).count, (data as any).value]);
          });
          
          // Create summary sheet
          const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
          XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
          
          // Create invoices sheet with data
          const headers = ['Invoice Number', 'Customer', 'Order Number', 'Amount', 'Date Issued', 'Due Date', 'Status', 'Days Until Due'];
          
          // Create rows data
          const rows = invoicesToExport.map(invoice => {
            const customer = getCustomerName(invoice.customer_id);
            const orderNumber = getOrderNumber(invoice.order_id);
            const daysUntilDue = getDaysUntilDue(invoice.date_due);
            
            return [
              invoice.invoice_number,
              customer,
              orderNumber,
              invoice.amount, // Keep as number for proper Excel formatting
              new Date(invoice.date_issued), // Keep as date for Excel
              new Date(invoice.date_due), // Keep as date for Excel
              invoice.status,
              daysUntilDue
            ];
          });
          
          // Create invoices sheet
          const invoicesData = [headers, ...rows];
          const invoicesSheet = XLSX.utils.aoa_to_sheet(invoicesData);
          
          // Set column widths for better readability
          const invoicesCols = [
            { wch: 15 },  // Invoice Number
            { wch: 25 },  // Customer
            { wch: 12 },  // Order Number 
            { wch: 12 },  // Amount
            { wch: 12 },  // Date Issued
            { wch: 12 },  // Due Date
            { wch: 12 },  // Status
            { wch: 15 }   // Days Until Due
          ];
          invoicesSheet['!cols'] = invoicesCols;
          
          // Add invoices sheet to workbook
          XLSX.utils.book_append_sheet(workbook, invoicesSheet, 'Invoices');
          
          // Create items sheet if we have line items
          if (invoicesToExport.some(invoice => invoice.items && invoice.items.length > 0)) {
            const itemsHeaders = ['Invoice Number', 'Description', 'Quantity', 'Unit Price', 'Amount'];
            const itemsRows = [];
            
            invoicesToExport.forEach(invoice => {
              if (invoice.items && invoice.items.length > 0) {
                invoice.items.forEach(item => {
                  itemsRows.push([
                    invoice.invoice_number,
                    item.description,
                    item.quantity || 1,
                    item.unit_price || (item.amount / (item.quantity || 1)),
                    item.amount
                  ]);
                });
              }
            });
            
            if (itemsRows.length > 0) {
              const itemsData = [itemsHeaders, ...itemsRows];
              const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);
              
              // Set column widths
              const itemsCols = [
                { wch: 15 },  // Invoice Number
                { wch: 40 },  // Description
                { wch: 10 },  // Quantity
                { wch: 12 },  // Unit Price
                { wch: 12 }   // Amount
              ];
              itemsSheet['!cols'] = itemsCols;
              
              // Add items sheet to workbook
              XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Line Items');
            }
          }
          
          // Generate Excel file and trigger download
          XLSX.writeFile(workbook, `${fileName}.xlsx`);
        }
        
        // Set success state
        setIsExporting(false);
        setExportSuccess(true);
      } catch (error) {
        console.error('Error exporting data:', error);
        
        // Show error notification
        const errorElement = document.createElement('div');
        errorElement.innerHTML = 'Error exporting data. Please try again.';
        errorElement.style.position = 'fixed';
        errorElement.style.bottom = '20px';
        errorElement.style.right = '20px';
        errorElement.style.backgroundColor = 'rgba(239,68,68,0.9)';
        errorElement.style.color = 'white';
        errorElement.style.padding = '10px 15px';
        errorElement.style.borderRadius = '4px';
        errorElement.style.zIndex = '9999';
        document.body.appendChild(errorElement);
        
        // Remove error notification after a few seconds
        setTimeout(() => {
          document.body.removeChild(errorElement);
        }, 5000);
        
        setIsExporting(false);
      }
    }, 1000);
  };
  
  const handleDownloadInvoice = (invoice: Invoice) => {
    // Create a loading state for this specific invoice
    const loadingElement = document.createElement('div');
    loadingElement.innerHTML = 'Preparing invoice for download...';
    loadingElement.style.position = 'fixed';
    loadingElement.style.bottom = '20px';
    loadingElement.style.right = '20px';
    loadingElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
    loadingElement.style.color = 'white';
    loadingElement.style.padding = '10px 15px';
    loadingElement.style.borderRadius = '4px';
    loadingElement.style.zIndex = '9999';
    document.body.appendChild(loadingElement);
    
    // Simulate download preparation
    setTimeout(() => {
      try {
        // Remove loading notification
        document.body.removeChild(loadingElement);
        
        // Get invoice details
        const customer = customers.find(c => c.id === invoice.customer_id);
        const statusClass = invoice.status.replace(' ', '-');
        const daysUntilDue = getDaysUntilDue(invoice.date_due);
        
        // Create a new PDF document
        const doc = new jsPDF();
        
        // Set initial position and line height
        let yPos = 20;
        const lineHeight = 8;
        const margin = 15;
        const pageWidth = doc.internal.pageSize.width;
        
        // Helper functions for PDF generation
        const addText = (text, x, size = 10, isBold = false) => {
          doc.setFontSize(size);
          doc.setFont('helvetica', isBold ? 'bold' : 'normal');
          doc.text(text, x, yPos);
          yPos += lineHeight;
        };
        
        const addLine = () => {
          yPos += 2;
          doc.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 5;
        };
        
        // Add company logo/header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('INVOICE', margin, yPos);
        
        // Add invoice number on the right side
        doc.setFontSize(12);
        doc.text(`# ${invoice.invoice_number}`, pageWidth - margin - 30, yPos);
        yPos += 15;
        
        // Add invoice details section - left column
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE DETAILS', margin, yPos);
        yPos += lineHeight;
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Date Issued: ${formatDate(invoice.date_issued)}`, margin, yPos);
        yPos += lineHeight;
        
        doc.text(`Due Date: ${formatDate(invoice.date_due)}`, margin, yPos);
        yPos += lineHeight;
        
        // Add status with color
        doc.text(`Status: ${invoice.status.toUpperCase()}`, margin, yPos);
        yPos += lineHeight;
        
        if (invoice.status === 'paid' && invoice.date_paid) {
          doc.text(`Date Paid: ${formatDate(invoice.date_paid)}`, margin, yPos);
        } else {
          doc.text(`Days Until Due: ${daysUntilDue}`, margin, yPos);
        }
        yPos += lineHeight;
        
        // Customer details - right column
        const customerStartY = yPos - (lineHeight * 4);
        doc.setFont('helvetica', 'bold');
        doc.text('BILL TO:', pageWidth / 2, customerStartY);
        
        if (customer) {
          doc.setFont('helvetica', 'normal');
          doc.text(customer.company_name, pageWidth / 2, customerStartY + lineHeight);
          
          if (customer.address) {
            doc.text(customer.address.street, pageWidth / 2, customerStartY + (lineHeight * 2));
            doc.text(
              `${customer.address.city}, ${customer.address.state} ${customer.address.zipcode}`, 
              pageWidth / 2, 
              customerStartY + (lineHeight * 3)
            );
            doc.text(customer.address.country, pageWidth / 2, customerStartY + (lineHeight * 4));
          }
        } else {
          doc.setFont('helvetica', 'normal');
          doc.text('Unknown Customer', pageWidth / 2, customerStartY + lineHeight);
        }
        
        // Move position down past both columns
        yPos += 20;
        
        // Add line items table
        addLine();
        
        // Table header
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos - 5, pageWidth - (margin * 2), lineHeight + 2, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.text('Description', margin, yPos);
        doc.text('Amount', pageWidth - margin - 20, yPos);
        yPos += lineHeight + 2;
        
        // Table rows
        doc.setFont('helvetica', 'normal');
        
        if (invoice.items && invoice.items.length > 0) {
          invoice.items.forEach((item, index) => {
            // Check if we need a new page
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
              
              // Add table header on new page
              doc.setFillColor(240, 240, 240);
              doc.rect(margin, yPos - 5, pageWidth - (margin * 2), lineHeight + 2, 'F');
              
              doc.setFont('helvetica', 'bold');
              doc.text('Description', margin, yPos);
              doc.text('Amount', pageWidth - margin - 20, yPos);
              yPos += lineHeight + 2;
              doc.setFont('helvetica', 'normal');
            }
            
            // Set alternating row background
            if (index % 2 === 0) {
              doc.setFillColor(248, 248, 248);
              doc.rect(margin, yPos - 5, pageWidth - (margin * 2), lineHeight + 2, 'F');
            }
            
            // Truncate description if it's too long
            const description = item.description && item.description.length > 50 
              ? item.description.substring(0, 47) + '...' 
              : item.description || 'Item';
            
            doc.text(description, margin, yPos);
            doc.text(formatCurrency(item.amount), pageWidth - margin - 20, yPos);
            yPos += lineHeight + 2;
          });
        } else {
          // If no line items, add a placeholder
          doc.text('Invoice items', margin, yPos);
          doc.text(formatCurrency(invoice.amount), pageWidth - margin - 20, yPos);
          yPos += lineHeight + 2;
        }
        
        // Add total
        yPos += 5;
        doc.setFillColor(240, 240, 240);
        doc.rect(pageWidth / 2, yPos - 5, pageWidth / 2 - margin, lineHeight + 2, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.text('Total', pageWidth / 2 + 5, yPos);
        doc.text(formatCurrency(invoice.amount), pageWidth - margin - 20, yPos);
        
        // Add footer
        yPos = doc.internal.pageSize.height - 30;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Thank you for your business. Please contact us for any queries related to this invoice.', 
          margin, yPos);
        yPos += 6;
        doc.text(`This invoice was generated on ${new Date().toLocaleString()}.`, margin, yPos);
        
        // Save the PDF with a specific name
        doc.save(`Invoice_${invoice.invoice_number}.pdf`);
        
        // Show success notification
        const successElement = document.createElement('div');
        successElement.innerHTML = `Invoice ${invoice.invoice_number} downloaded successfully`;
        successElement.style.position = 'fixed';
        successElement.style.bottom = '20px';
        successElement.style.right = '20px';
        successElement.style.backgroundColor = 'rgba(34,197,94,0.9)';
        successElement.style.color = 'white';
        successElement.style.padding = '10px 15px';
        successElement.style.borderRadius = '4px';
        successElement.style.zIndex = '9999';
        document.body.appendChild(successElement);
        
        // Remove success notification after a few seconds
        setTimeout(() => {
          document.body.removeChild(successElement);
        }, 3000);
        
      } catch (error) {
        console.error('Error creating invoice PDF:', error);
        
        // Show error notification
        const errorElement = document.createElement('div');
        errorElement.innerHTML = 'Error generating invoice PDF. Please try again.';
        errorElement.style.position = 'fixed';
        errorElement.style.bottom = '20px';
        errorElement.style.right = '20px';
        errorElement.style.backgroundColor = 'rgba(239,68,68,0.9)';
        errorElement.style.color = 'white';
        errorElement.style.padding = '10px 15px';
        errorElement.style.borderRadius = '4px';
        errorElement.style.zIndex = '9999';
        document.body.appendChild(errorElement);
        
        // Remove error notification after a few seconds
        setTimeout(() => {
          document.body.removeChild(errorElement);
        }, 5000);
      }
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.company_name : 'Unknown Customer';
  };

  const getOrderNumber = (orderId: number) => {
    return orderId ? `ORD-${orderId}` : 'N/A';
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Invoices</h1>
          <Button onClick={handleOpenExportModal}>
            <Download className="mr-2 h-4 w-4" /> Export Invoices
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search invoice number..."
                  className="pl-10 pr-4 py-2 w-full border rounded-md"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant={statusFilter === 'current' ? 'default' : 'outline'} 
                  onClick={() => handleStatusFilter('current')}
                >
                  Current
                </Button>
                <Button 
                  variant={statusFilter === 'due soon' ? 'default' : 'outline'} 
                  onClick={() => handleStatusFilter('due soon')}
                >
                  Due Soon
                </Button>
                <Button 
                  variant={statusFilter === 'overdue' ? 'default' : 'outline'} 
                  onClick={() => handleStatusFilter('overdue')}
                >
                  Overdue
                </Button>
                <Button 
                  variant={statusFilter === 'paid' ? 'default' : 'outline'} 
                  onClick={() => handleStatusFilter('paid')}
                >
                  Paid
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date Issued</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{getCustomerName(invoice.customer_id)}</TableCell>
                    <TableCell>{getOrderNumber(invoice.order_id)}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{formatDate(invoice.date_issued)}</TableCell>
                    <TableCell>{formatDate(invoice.date_due)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        invoice.status === 'current' ? 'current' :
                        invoice.status === 'due soon' ? 'due-soon' :
                        invoice.status === 'overdue' ? 'overdue' : 'paid'
                      }>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No invoices found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {isInvoiceDetailOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Invoice Details
              </h2>
              <button
                onClick={() => setIsInvoiceDetailOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Invoice Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Invoice #:</span> {selectedInvoice.invoice_number}</p>
                    <p><span className="font-medium">Order #:</span> {getOrderNumber(selectedInvoice.order_id)}</p>
                    <p><span className="font-medium">Date Issued:</span> {formatDate(selectedInvoice.date_issued)}</p>
                    <p><span className="font-medium">Due Date:</span> {formatDate(selectedInvoice.date_due)}</p>
                    <p><span className="font-medium">Status:</span> {selectedInvoice.status}</p>
                    {selectedInvoice.date_paid && (
                      <p><span className="font-medium">Date Paid:</span> {formatDate(selectedInvoice.date_paid)}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Customer:</span> {getCustomerName(selectedInvoice.customer_id)}</p>
                    <p><span className="font-medium">Amount:</span> {formatCurrency(selectedInvoice.amount)}</p>
                    {selectedInvoice.status !== 'paid' && (
                      <p>
                        <span className="font-medium">Days Until Due:</span> {getDaysUntilDue(selectedInvoice.date_due)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsInvoiceDetailOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handleDownloadInvoice(selectedInvoice)}>
                  <Download className="mr-2 h-4 w-4" /> Download Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <Download className="h-5 w-5 mr-2 text-primary" />
                Export Invoices
              </h2>
              <button
                onClick={handleCloseExportModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {!exportSuccess ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Export Format</label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          className={`p-3 border rounded-md flex flex-col items-center justify-center text-sm ${
                            exportFormat === 'csv' ? 'border-primary bg-primary/5 text-primary' : ''
                          }`}
                          onClick={() => setExportFormat('csv')}
                        >
                          <FileText className="h-5 w-5 mb-1" />
                          CSV
                        </button>
                        <button
                          className={`p-3 border rounded-md flex flex-col items-center justify-center text-sm ${
                            exportFormat === 'pdf' ? 'border-primary bg-primary/5 text-primary' : ''
                          }`}
                          onClick={() => setExportFormat('pdf')}
                        >
                          <FileText className="h-5 w-5 mb-1" />
                          PDF
                        </button>
                        <button
                          className={`p-3 border rounded-md flex flex-col items-center justify-center text-sm ${
                            exportFormat === 'excel' ? 'border-primary bg-primary/5 text-primary' : ''
                          }`}
                          onClick={() => setExportFormat('excel')}
                        >
                          <FileText className="h-5 w-5 mb-1" />
                          Excel
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Date Range</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          className={`p-2 border rounded-md text-sm text-center ${
                            exportDateRange === 'all' ? 'border-primary bg-primary/5 text-primary' : ''
                          }`}
                          onClick={() => setExportDateRange('all')}
                        >
                          All Time
                        </button>
                        <button
                          className={`p-2 border rounded-md text-sm text-center ${
                            exportDateRange === 'current-month' ? 'border-primary bg-primary/5 text-primary' : ''
                          }`}
                          onClick={() => setExportDateRange('current-month')}
                        >
                          Current Month
                        </button>
                        <button
                          className={`p-2 border rounded-md text-sm text-center ${
                            exportDateRange === 'last-month' ? 'border-primary bg-primary/5 text-primary' : ''
                          }`}
                          onClick={() => setExportDateRange('last-month')}
                        >
                          Last Month
                        </button>
                        <button
                          className={`p-2 border rounded-md text-sm text-center ${
                            exportDateRange === 'custom' ? 'border-primary bg-primary/5 text-primary' : ''
                          }`}
                          onClick={() => setExportDateRange('custom')}
                        >
                          Custom Range
                        </button>
                      </div>
                    </div>

                    {exportDateRange === 'custom' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Start Date</label>
                          <input
                            type="date"
                            className="w-full p-2 border rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">End Date</label>
                          <input
                            type="date"
                            className="w-full p-2 border rounded-md text-sm"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2">Included Data</label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="include-customer-details" 
                            defaultChecked 
                            className="rounded text-primary border-gray-300 focus:ring-primary"
                          />
                          <label htmlFor="include-customer-details" className="text-sm">Include customer details</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="include-payment-details" 
                            defaultChecked 
                            className="rounded text-primary border-gray-300 focus:ring-primary"
                          />
                          <label htmlFor="include-payment-details" className="text-sm">Include payment details</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="include-line-items" 
                            defaultChecked 
                            className="rounded text-primary border-gray-300 focus:ring-primary"
                          />
                          <label htmlFor="include-line-items" className="text-sm">Include line items</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t mt-6 pt-4 flex justify-end space-x-3">
                    <Button variant="outline" onClick={handleCloseExportModal}>
                      Cancel
                    </Button>
                    <Button disabled={isExporting} onClick={handleExport}>
                      {isExporting ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" /> Export
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Export Successful!</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Your file has been exported successfully and is ready to download.
                  </p>
                  <div className="space-x-3">
                    <Button variant="outline" onClick={handleCloseExportModal}>
                      Close
                    </Button>
                    <Button onClick={handleExport}>
                      <Download className="mr-2 h-4 w-4" /> Download Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default InvoicesPage; 