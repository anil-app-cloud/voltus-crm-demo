import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Search, Eye, Edit, Trash, Ship, Plane, Truck, X, Calendar, Clock, ArrowRight, Download, FileText, Check, Loader2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { getBookings, createBooking, updateBooking, deleteBooking, getAllCustomers } from '../../lib/api';
import { Booking } from '../../types';
import {BookingModal} from './BookingModal';
import { Animate, FadeIn, SlideInRight, SlideInTop, SlideInBottom } from '../../components/ui/animate';
import { Spinner } from '../../components/ui/spinner';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Helper function to check if an error is an axios cancellation error
const isCancelError = (error: any): boolean => {
  return axios.isCancel(error) || 
    (error && error.message === 'Request cancelled - duplicate in flight') ||
    (error && error.code === 'ERR_CANCELED');
};

const BookingsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [transportFilter, setTransportFilter] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | '7days' | '30days' | '90days'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Add export state variables
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [exportDateRange, setExportDateRange] = useState<'all' | 'current-month' | 'last-month' | 'custom'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Add this state to track if a submission is in progress
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Add state variables for custom date range
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const [bookingsData, customersData] = await Promise.all([
          getBookings(),
          getAllCustomers()
        ]);
        
        setBookings(bookingsData);
        setFilteredBookings(bookingsData);
        setCustomers(customersData);
      } catch (error) {
        if (!isCancelError(error)) {
          console.error('Error fetching data:', error);
          
          // Even if bookings fail, still try to load customers
          if (!customers.length) {
            try {
              const customersData = await getAllCustomers();
              setCustomers(customersData);
            } catch (customerError) {
              if (!isCancelError(customerError)) {
                console.error('Error fetching customers:', customerError);
              }
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let results = bookings;
    
    if (searchTerm) {
      results = results.filter(
        booking => 
          booking.booking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.cargo_type && booking.cargo_type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (statusFilter) {
      results = results.filter(booking => booking.status === statusFilter);
    }
    
    if (transportFilter) {
      results = results.filter(booking => booking.transport_mode === transportFilter);
    }
    
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      if (dateRangeFilter === '7days') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (dateRangeFilter === '30days') {
        cutoffDate.setDate(now.getDate() - 30);
      } else if (dateRangeFilter === '90days') {
        cutoffDate.setDate(now.getDate() - 90);
      }
      
      results = results.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate >= cutoffDate;
      });
    }
    
    setFilteredBookings(results);
  }, [searchTerm, statusFilter, transportFilter, dateRangeFilter, bookings]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchTerm('');
      searchInputRef.current?.blur();
    }
  };

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status === statusFilter ? null : status);
  };
  
  const handleTransportFilter = (mode: string | null) => {
    setTransportFilter(mode === transportFilter ? null : mode);
  };
  
  const handleDateRangeFilter = (range: 'all' | '7days' | '30days' | '90days') => {
    setDateRangeFilter(range);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter(null);
    setTransportFilter(null);
    setDateRangeFilter('all');
  };

  const handleAddBooking = () => {
    setCurrentBooking(null);
    setIsModalOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setCurrentBooking(booking);
    setIsModalOpen(true);
  };

  const handleDeleteBooking = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        // Delete booking from backend
        await deleteBooking(id);
        
        // Update UI after deletion
        setBookings(bookings.filter(booking => booking.id !== id));
        setFilteredBookings(filteredBookings.filter(booking => booking.id !== id));
        
        // Show success toast
        toast.success('Booking deleted successfully');
      } catch (error) {
        console.error('Error deleting booking:', error);
        toast.error('Failed to delete booking. Please try again.');
      }
    }
  };

  const handleViewBooking = (booking: Booking) => {
    setCurrentBooking(booking);
    setIsDetailViewOpen(true);
  };

  const handleCloseModal = () => {
    // Don't close if submission is in progress
    if (!isSubmittingForm) {
      // Use setTimeout to allow animations to complete before closing
      // This helps prevent issues with the modal appearing to remain open but invisible
      setTimeout(() => {
        setIsModalOpen(false);
      }, 50);
    }
  };

  const handleSaveBooking = async (bookingData: Partial<Booking>) => {
    try {
      // Set submission in progress
      setIsSubmittingForm(true);
      
      if (currentBooking) {
        // Update existing booking
        const updatedBooking = await updateBooking(currentBooking.id, {
          ...currentBooking,
          ...bookingData
        });
        
        // Update UI with returned booking data
        const updatedBookings = bookings.map(booking => 
          booking.id === currentBooking.id 
            ? updatedBooking 
            : booking
        ) as Booking[];
        setBookings(updatedBookings);
        setFilteredBookings(
          filteredBookings.map(booking => 
            booking.id === currentBooking.id 
              ? updatedBooking as Booking
              : booking
          )
        );
        
        // Show success toast
        toast.success('Booking updated successfully');
      } else {
        // Create new booking
        const bookingToCreate = {
          booking_number: `BK-${new Date().getFullYear()}-${String(bookings.length + 1).padStart(3, '0')}`,
          customer_id: bookingData.customer_id || '',
          status: bookingData.status || 'pending',
          origin: bookingData.origin || '',
          destination: bookingData.destination || '',
          cargo_type: bookingData.cargo_type || '',
          transport_mode: bookingData.transport_mode || 'sea',
          container_size: bookingData.container_size || '20ft',
          quantity: bookingData.quantity || 1,
          weight: bookingData.weight || 0,
          volume: bookingData.volume || 0,
          ready_date: bookingData.ready_date || new Date().toISOString(),
          delivery_date: bookingData.delivery_date || new Date().toISOString(),
          quote_amount: bookingData.quote_amount || 0,
          special_instructions: bookingData.special_instructions || '',
          order_reference: bookingData.order_reference || null,
          reason_lost: bookingData.reason_lost || null
        };
        
        // Save to backend
        const newBooking = await createBooking(bookingToCreate);
        
        // Update UI with new booking including backend-generated ID
        setBookings([...bookings, newBooking]);
        
        // Apply current filters to determine if the new booking should be shown
        if (
          (!searchTerm || 
           newBooking.booking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
           newBooking.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
           newBooking.destination.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (!statusFilter || newBooking.status === statusFilter) &&
          (!transportFilter || newBooking.transport_mode === transportFilter)
        ) {
          setFilteredBookings([...filteredBookings, newBooking]);
        }
        
        // Show success toast
        toast.success('Booking created successfully');
      }
      
      // Success: Reset submission state and close modal
      setIsSubmittingForm(false);
      setIsModalOpen(false);
      
      // Return a resolved promise to indicate success
      return Promise.resolve();
    } catch (error: any) {
      console.error('Error saving booking:', error);
      toast.error(error?.response?.data?.message || 'Failed to save booking');
      
      // Error: Reset submission state but keep modal open
      setIsSubmittingForm(false);
      
      // Keep modal open on error by rejecting the promise
      return Promise.reject(error);
    }
  };

  const getCustomerName = (customerId: string) => {
    if (!customers || !Array.isArray(customers)) {
      return 'Unknown Customer';
    }
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.company_name : 'Unknown Customer';
  };
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      // Check if it's today
      const today = new Date();
      const isToday = date.getDate() === today.getDate() && 
                     date.getMonth() === today.getMonth() && 
                     date.getFullYear() === today.getFullYear();
      
      if (isToday) {
        return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Check if it's yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = date.getDate() === yesterday.getDate() && 
                         date.getMonth() === yesterday.getMonth() && 
                         date.getFullYear() === yesterday.getFullYear();
      
      if (isYesterday) {
        return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Otherwise show full date
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  const countActiveFilters = () => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter) count++;
    if (transportFilter) count++;
    if (dateRangeFilter !== 'all') count++;
    return count;
  };

  // Add export related handlers
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
    
    // Run the export process and handle any errors
    processExport().catch(err => {
      console.error("Export process failed:", err);
      toast.error("Export failed. Please try again.");
      setIsExporting(false);
    });
  };
  
  // Helper function to make sure customer data is available
  const ensureCustomerData = async (): Promise<boolean> => {
    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      console.log("Customer data not available, attempting to fetch it...");
      try {
        const customerData = await getAllCustomers();
        console.log("Customer data:", customerData);
        setCustomers(customerData);
        console.log(`Successfully loaded ${customerData.length} customers`);
        return true;
      } catch (error) {
        console.error("Failed to load customer data:", error);
        return false;
      }
    }
    return true;
  };
  
  // Separate the export logic to a function that can be called after ensuring data is available
  const processExport = async () => {
    // Pre-fetch customer data if needed
    const customersAvailable = await ensureCustomerData();
    if (!customersAvailable) {
      toast.error("Could not load customer data for export. Please try again.");
      setIsExporting(false);
      return;
    }
    
    // Validate the date range for custom dates
    if (exportDateRange === 'custom' && (!customStartDate || !customEndDate)) {
      toast.error('Please select both start and end dates for custom date range');
      setIsExporting(false);
      return;
    }
    
    // Filter bookings based on selected date range
    let bookingsToExport = [...filteredBookings];
    const today = new Date();
    
    if (exportDateRange === 'current-month') {
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      bookingsToExport = bookingsToExport.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      });
    } else if (exportDateRange === 'last-month') {
      const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
      const lastMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
      bookingsToExport = bookingsToExport.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate.getMonth() === lastMonth && bookingDate.getFullYear() === lastMonthYear;
      });
    } else if (exportDateRange === 'custom' && customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      // Set endDate to end of day to include the full end date
      endDate.setHours(23, 59, 59, 999);
      
      bookingsToExport = bookingsToExport.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate >= startDate && bookingDate <= endDate;
      });
    }
    
    // Show a notification if no bookings are found
    if (bookingsToExport.length === 0) {
      toast.error('No bookings found for the selected criteria');
      setIsExporting(false);
      return;
    }
    
    // Log export data for debugging
    console.log(`Exporting ${bookingsToExport.length} bookings in ${exportFormat} format`);
    console.log(`Customer data available: ${customers.length} customers`);
    
    // Generate content based on the export format
    setTimeout(() => {
      let fileName = `bookings_export_${new Date().toISOString().split('T')[0]}`;
      
      if (exportFormat === 'csv') {
        try {
          // Use xlsx library for CSV generation to ensure consistent formatting
          const workbook = XLSX.utils.book_new();
          
          // Headers for bookings data
          const headers = [
            'Booking Number', 
            'Customer', 
            'Origin', 
            'Destination', 
            'Transport Mode', 
            'Container Size', 
            'Ready Date', 
            'Delivery Date', 
            'Status', 
            'Quote Amount'
          ];
          
          // Prepare data rows
          const data = [headers];
          
          bookingsToExport.forEach(booking => {
            try {
              // Log details for debugging
              console.log(`Processing booking ${booking.booking_number}, customer_id: ${booking.customer_id}`);
              console.log(`Customers array available: ${Boolean(customers && Array.isArray(customers))}, length: ${customers?.length || 0}`);
              
              // Safely get customer name with additional fallback
              let customerName = "Unknown Customer";
              try {
                if (booking.customer_id && customers && Array.isArray(customers)) {
                  const customer = customers.find(c => c.id === booking.customer_id);
                  customerName = customer ? customer.company_name : "Unknown Customer";
                }
              } catch (customerErr) {
                console.error("Error retrieving customer name:", customerErr);
              }
              
              data.push([
                booking.booking_number || '',
                customerName,
                booking.origin || '',
                booking.destination || '',
                booking.transport_mode || '',
                booking.container_size || '',
                formatDate(booking.ready_date) || '',
                formatDate(booking.delivery_date) || '',
                booking.status || '',
                booking.quote_amount?.toString() || '0'
              ]);
            } catch (rowErr) {
              console.error("Error processing booking row:", rowErr);
              // Add a placeholder row to avoid breaking the export
              data.push([
                booking.booking_number || 'Error',
                'Error processing customer',
                booking.origin || '',
                booking.destination || '',
                booking.transport_mode || '',
                booking.container_size || '',
                'Error',
                'Error',
                booking.status || '',
                '0'
              ]);
            }
          });
          
          // Create worksheet from the data
          const worksheet = XLSX.utils.aoa_to_sheet(data);
          
          // Add column widths for better readability
          const wscols = [
            {wch: 15}, // Booking Number
            {wch: 20}, // Customer
            {wch: 15}, // Origin
            {wch: 15}, // Destination
            {wch: 12}, // Transport Mode
            {wch: 12}, // Container Size
            {wch: 15}, // Ready Date
            {wch: 15}, // Delivery Date
            {wch: 10}, // Status
            {wch: 12}  // Quote Amount
          ];
          worksheet['!cols'] = wscols;
          
          // Add the worksheet to the workbook
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
          
          // Use safe method with fallback for download
          safeXlsxWrite(workbook, `${fileName}.csv`);
        } catch (e) {
          console.error('Error creating CSV file:', e);
          toast.error('Error exporting CSV file. Please try again.');
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
          
          // Add title and header
          addText('BOOKING EXPORT', 16, true);
          addLine();
          
          addText(`Date Range: ${exportDateRange}`, 10);
          addText(`Generated: ${new Date().toLocaleString()}`, 10);
          addText(`Total Bookings: ${bookingsToExport.length}`, 10);
          yPos += 5;
          
          // Add bookings
          if (bookingsToExport.length > 0) {
            addText('BOOKINGS', 12, true);
            addLine();
            
            bookingsToExport.forEach((booking, idx) => {
              // Check if we need a new page
              if (yPos > 250) {
                doc.addPage();
                yPos = 15;
              }
              
              // Safely get customer name with additional fallback
              let customerName = "Unknown Customer";
              try {
                if (booking.customer_id && customers && Array.isArray(customers)) {
                  const customer = customers.find(c => c.id === booking.customer_id);
                  customerName = customer ? customer.company_name : "Unknown Customer";
                }
              } catch (customerErr) {
                console.error("Error retrieving customer name for PDF:", customerErr);
              }
              
              addText(`Booking #: ${booking.booking_number || 'N/A'}`, 10, true);
              addText(`Customer: ${customerName}`, 10);
              addText(`Route: ${booking.origin || 'N/A'} → ${booking.destination || 'N/A'}`, 10);
              addText(`Transport: ${booking.transport_mode || 'N/A'} - ${booking.container_size || 'N/A'}`, 10);
              addText(`Ready Date: ${formatDate(booking.ready_date) || 'N/A'}`, 10);
              addText(`Delivery Date: ${formatDate(booking.delivery_date) || 'N/A'}`, 10);
              addText(`Status: ${booking.status || 'N/A'}`, 10);
              addText(`Quote Amount: ${formatCurrency(booking.quote_amount || 0)}`, 10);
              
              if (booking.special_instructions) {
                addText(`Instructions: ${booking.special_instructions}`, 10);
              }
              
              yPos += 3;
              doc.line(margin, yPos, 100, yPos);
              yPos += 5;
            });
          } else {
            addText('No bookings found for the selected criteria.', 10);
          }
          
          // Save the PDF with fallback option
          try {
            // Try the direct method first
            doc.save(`${fileName}.pdf`);
            console.log('PDF export completed using direct method');
          } catch (e) {
            console.warn('PDF direct save failed, trying fallback', e);
            // Fallback method
            const pdfOutput = doc.output('blob');
            forceFileDownload(pdfOutput, `${fileName}.pdf`);
          }
        } catch (e) {
          console.error('Error creating PDF:', e);
          toast.error('Error exporting PDF file. Please try again.');
        }
      }
      else if (exportFormat === 'excel') {
        try {
          // Use xlsx library for proper Excel file generation
          const workbook = XLSX.utils.book_new();
          
          // Create summary sheet
          const summaryData = [
            ['Booking Export', new Date().toLocaleString()],
            ['Date Range', exportDateRange],
            ['Total Bookings', bookingsToExport.length.toString()],
            []
          ];
          
          const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
          XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
          
          // Create bookings sheet
          if (bookingsToExport.length > 0) {
            const headers = [
              'Booking Number', 
              'Customer', 
              'Origin', 
              'Destination', 
              'Transport Mode', 
              'Container Size', 
              'Ready Date', 
              'Delivery Date', 
              'Status', 
              'Quote Amount', 
              'Special Instructions'
            ];
            
            const bookingRows = bookingsToExport.map(booking => {
              // Safely get customer name with additional fallback
              let customerName = "Unknown Customer";
              try {
                if (booking.customer_id && customers && Array.isArray(customers)) {
                  const customer = customers.find(c => c.id === booking.customer_id);
                  customerName = customer ? customer.company_name : "Unknown Customer";
                }
              } catch (customerErr) {
                console.error("Error retrieving customer name for Excel:", customerErr);
              }
              
              return [
                booking.booking_number || '',
                customerName,
                booking.origin || '',
                booking.destination || '',
                booking.transport_mode || '',
                booking.container_size || '',
                formatDate(booking.ready_date) || '',
                formatDate(booking.delivery_date) || '',
                booking.status || '',
                booking.quote_amount || 0,
                booking.special_instructions || ''
              ];
            });
            
            // Combine headers and data
            const bookingsData = [headers, ...bookingRows];
            
            // Create sheet from data
            const bookingsSheet = XLSX.utils.aoa_to_sheet(bookingsData);
            
            // Set column width for better readability
            const bookingCols = [
              { wch: 15 },  // Booking Number
              { wch: 20 },  // Customer
              { wch: 15 },  // Origin
              { wch: 15 },  // Destination
              { wch: 15 },  // Transport Mode
              { wch: 12 },  // Container Size
              { wch: 12 },  // Ready Date
              { wch: 12 },  // Delivery Date
              { wch: 10 },  // Status
              { wch: 12 },  // Quote Amount
              { wch: 30 }   // Special Instructions
            ];
            bookingsSheet['!cols'] = bookingCols;
            
            // Add the bookings sheet to the workbook
            XLSX.utils.book_append_sheet(workbook, bookingsSheet, 'Bookings');
          }
          
          // Use safe method with fallback for download
          safeXlsxWrite(workbook, `${fileName}.xlsx`);
        } catch (e) {
          console.error('Error creating Excel file:', e);
          toast.error('Error exporting Excel file. Please try again.');
        }
      }
      
      // Fix the toast warning issue using correct toast method
      // Show success message
      if (bookingsToExport.length > 0) {
        toast.success(`Successfully exported ${bookingsToExport.length} bookings`);
      }
      
      setIsExporting(false);
      setExportSuccess(true);
    }, 1500);
  };

  // Display export success message with details
  const getExportSuccessMessage = () => {
    let message = 'Your file has been exported successfully';
    
    // Add more details based on what was exported
    if (filteredBookings.length > 0) {
      message += ` containing ${filteredBookings.length} bookings`;
      
      if (exportDateRange !== 'all') {
        if (exportDateRange === 'current-month') {
          message += ' from the current month';
        } else if (exportDateRange === 'last-month') {
          message += ' from the previous month';
        } else if (exportDateRange === 'custom' && customStartDate && customEndDate) {
          message += ` from ${new Date(customStartDate).toLocaleDateString()} to ${new Date(customEndDate).toLocaleDateString()}`;
        }
      }
    }
    
    return message + '.';
  };

  // Add a function to force download with fallback options
  const forceFileDownload = (data: Blob, fileName: string) => {
    try {
      // Method 1: Using the download attribute (most modern browsers)
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none'; // hide the element
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      console.log(`Download initiated for ${fileName}`);
    } catch (err) {
      console.error('Error forcing download:', err);
      toast.error(`Could not download ${fileName}. Please try a different format.`);
    }
  };

  // Handle XLSX write error with fallback
  const safeXlsxWrite = (workbook: XLSX.WorkBook, fileName: string) => {
    try {
      // Try the direct method first
      XLSX.writeFile(workbook, fileName);
      console.log(`${fileName} created successfully using XLSX.writeFile`);
    } catch (e) {
      console.warn(`XLSX.writeFile failed, trying fallback for ${fileName}`, e);
      try {
        // Fallback: Create a blob and force download
        const wbout = XLSX.write(workbook, { bookType: fileName.endsWith('.csv') ? 'csv' : 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { 
          type: fileName.endsWith('.csv') 
            ? 'text/csv;charset=utf-8;' 
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        forceFileDownload(blob, fileName);
      } catch (fallbackErr) {
        console.error('Fallback download also failed:', fallbackErr);
        toast.error('Export failed. Please try a different browser or format.');
      }
    }
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
        <FadeIn className="transition-all duration-300">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <h1 className="text-3xl font-bold mb-4 md:mb-0 text-gray-800 animate-fadeIn">
              Booking Enquiries
            </h1>
            
            <div className="flex gap-4">
              <SlideInRight delay={100}>
                <Button 
                  variant="outline" 
                  onClick={handleOpenExportModal} 
                  className="transition-all duration-200 hover:shadow-md"
                >
                  <Download className="mr-2 h-4 w-4" /> Export Bookings
                </Button>
              </SlideInRight>
              <SlideInRight delay={200}>
                <Button 
                  onClick={handleAddBooking} 
                  className="bg-primary hover:bg-primary/90 transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  <Plus className="mr-2 h-4 w-4" /> New Booking
                </Button>
              </SlideInRight>
            </div>
          </div>
        </FadeIn>

        <SlideInTop delay={100} className="w-full">
          <Card className="mb-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200/70 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50/50">
              <CardTitle className="text-base font-medium">Filter Bookings</CardTitle>
              <div className="flex items-center space-x-2">
                {countActiveFilters() > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="h-8 text-xs hover:bg-slate-100 transition-all duration-200"
                  >
                    Clear filters ({countActiveFilters()})
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                  className="h-8 hover:bg-slate-100 transition-all duration-200"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  {isAdvancedFilterOpen ? 'Simple Filter' : 'Advanced Filter'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-3 pt-4">
              <div className="flex flex-col md:flex-row gap-4 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    className="pl-10 pr-10 py-2 w-full border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white"
                    value={searchTerm}
                    onChange={handleSearch}
                    onKeyDown={handleKeyDown}
                    ref={searchInputRef}
                  />
                  {searchTerm && (
                    <button 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200" 
                      onClick={() => setSearchTerm('')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant={statusFilter === 'pending' ? 'default' : 'outline'} 
                    onClick={() => handleStatusFilter('pending')}
                    className="h-9 transition-all duration-200 hover:shadow-sm"
                  >
                    Pending
                  </Button>
                  <Button 
                    variant={statusFilter === 'confirmed' ? 'default' : 'outline'} 
                    onClick={() => handleStatusFilter('confirmed')}
                    className="h-9 transition-all duration-200 hover:shadow-sm"
                  >
                    Confirmed
                  </Button>
                  <Button 
                    variant={statusFilter === 'lost' ? 'default' : 'outline'} 
                    onClick={() => handleStatusFilter('lost')}
                    className="h-9 transition-all duration-200 hover:shadow-sm"
                  >
                    Lost
                  </Button>
                </div>
              </div>
              
              {isAdvancedFilterOpen && (
                <div className="pt-3 border-t animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Transport Mode</label>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm"
                          variant={transportFilter === 'sea' ? 'default' : 'outline'} 
                          onClick={() => handleTransportFilter('sea')}
                          className="h-8 transition-all duration-200"
                        >
                          <Ship className="h-3.5 w-3.5 mr-1" /> Sea
                        </Button>
                        <Button 
                          size="sm"
                          variant={transportFilter === 'air' ? 'default' : 'outline'} 
                          onClick={() => handleTransportFilter('air')}
                          className="h-8 transition-all duration-200"
                        >
                          <Plane className="h-3.5 w-3.5 mr-1" /> Air
                        </Button>
                        <Button 
                          size="sm"
                          variant={transportFilter === 'road' ? 'default' : 'outline'} 
                          onClick={() => handleTransportFilter('road')}
                          className="h-8 transition-all duration-200"
                        >
                          <Truck className="h-3.5 w-3.5 mr-1" /> Road
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Date Range</label>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm"
                          variant={dateRangeFilter === 'all' ? 'default' : 'outline'} 
                          onClick={() => handleDateRangeFilter('all')}
                          className="h-8 transition-all duration-200"
                        >
                          All Time
                        </Button>
                        <Button 
                          size="sm"
                          variant={dateRangeFilter === '7days' ? 'default' : 'outline'} 
                          onClick={() => handleDateRangeFilter('7days')}
                          className="h-8 transition-all duration-200"
                        >
                          Last 7 Days
                        </Button>
                        <Button 
                          size="sm"
                          variant={dateRangeFilter === '30days' ? 'default' : 'outline'} 
                          onClick={() => handleDateRangeFilter('30days')}
                          className="h-8 transition-all duration-200"
                        >
                          Last 30 Days
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </SlideInTop>

        {isLoading ? (
          <SlideInBottom delay={200}>
            <div className="flex justify-center items-center h-64">
              <Animate type="pulse" repeat={true} className="text-center">
                <Spinner size="lg" className="border-primary/70 border-[3px]" />
                <p className="mt-4 text-gray-500 font-medium">Loading bookings...</p>
              </Animate>
            </div>
          </SlideInBottom>
        ) : filteredBookings.length > 0 ? (
          <SlideInBottom delay={300}>
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200/70 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="font-semibold">Booking #</TableHead>
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold">Origin / Destination</TableHead>
                      <TableHead className="font-semibold">Transport</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y">
                    {filteredBookings.map((booking, index) => (
                      <TableRow 
                        key={booking.id} 
                        className="animate-fadeIn border-b hover:bg-slate-50/60 transition-colors duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium">{booking.booking_number}</TableCell>
                        <TableCell>{booking.customer_name || 'Unknown'}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{booking.origin}</span>
                            <span className="text-sm text-muted-foreground flex items-center">
                              <ArrowRight className="h-3 w-3 mx-1 text-gray-400" />
                              {booking.destination}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {booking.transport_mode === 'sea' ? (
                              <Ship className="h-4 w-4 mr-1.5 text-blue-500" />
                            ) : booking.transport_mode === 'air' ? (
                              <Plane className="h-4 w-4 mr-1.5 text-purple-500" />
                            ) : (
                              <Truck className="h-4 w-4 mr-1.5 text-green-500" />
                            )}
                            <span className="capitalize">{booking.transport_mode}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`font-medium transition-all duration-200 ${
                              booking.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                              booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 
                              booking.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                              booking.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                              'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {booking.status && booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewBooking(booking)}
                              className="hover:bg-slate-100 transition-colors duration-200 rounded-full h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditBooking(booking)}
                              className="hover:bg-slate-100 transition-colors duration-200 rounded-full h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="hover:bg-red-50 text-red-500 transition-colors duration-200 rounded-full h-8 w-8 p-0"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </SlideInBottom>
        ) : (
          <SlideInBottom delay={200}>
            <div className="text-center py-16 border rounded-md bg-white border-gray-200/70 shadow-sm animate-fadeIn">
              <div className="mb-5 text-gray-400">
                <Search className="h-16 w-16 mx-auto opacity-30" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-gray-700">No bookings found</h3>
              <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
                Try adjusting your filters or create a new booking to get started with managing your shipments.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="sm" onClick={clearAllFilters} className="hover:shadow-sm transition-all">
                  Clear all filters
                </Button>
                <Button size="sm" onClick={handleAddBooking} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-1" /> New Booking
                </Button>
              </div>
            </div>
          </SlideInBottom>
        )}
      </div>

      <BookingModal
        isOpen={isModalOpen}
        booking={currentBooking}
        onClose={handleCloseModal}
        onSave={handleSaveBooking}
        customers={customers}
      />
      
      {/* Booking Details View */}
      {isDetailViewOpen && currentBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <span className="bg-primary/10 text-primary p-2 rounded-full mr-3">
                  {currentBooking.transport_mode === 'sea' ? (
                    <Ship className="h-6 w-6" />
                  ) : currentBooking.transport_mode === 'air' ? (
                    <Plane className="h-6 w-6" />
                  ) : (
                    <Truck className="h-6 w-6" />
                  )}
                </span>
                Booking {currentBooking.booking_number}
              </h2>
              <button
                onClick={() => setIsDetailViewOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-1">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-sm font-medium mb-3 text-gray-500">BOOKING INFO</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <Badge 
                          variant={
                            currentBooking.status === 'confirmed' ? 'default' : 
                            currentBooking.status === 'pending' ? 'outline' : 
                            currentBooking.status === 'in_progress' ? 'secondary' : 
                            currentBooking.status === 'completed' ? 'success' : 
                            'destructive'
                          }
                        >
                          {currentBooking.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Created Date</div>
                        <div className="text-sm font-medium">{formatDate(currentBooking.created_at)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Customer</div>
                        <div className="text-sm font-medium">{getCustomerName(currentBooking.customer_id)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Quote Amount</div>
                        <div className="text-sm font-medium">{formatCurrency(currentBooking.quote_amount)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="bg-gray-50 p-4 rounded-lg border h-full flex flex-col">
                    <h3 className="text-sm font-medium mb-3 text-gray-500">SHIPMENT DETAILS</h3>
                    <div className="mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{currentBooking.origin}</div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(currentBooking.ready_date)}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
                        <div>
                          <div className="font-medium">{currentBooking.destination}</div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(currentBooking.delivery_date)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Transport Mode</div>
                        <div className="text-sm font-medium flex items-center">
                          {currentBooking.transport_mode === 'sea' ? (
                            <Ship className="h-4 w-4 mr-1 text-blue-500" />
                          ) : currentBooking.transport_mode === 'air' ? (
                            <Plane className="h-4 w-4 mr-1 text-blue-500" />
                          ) : (
                            <Truck className="h-4 w-4 mr-1 text-blue-500" />
                          )}
                          {currentBooking.transport_mode.charAt(0).toUpperCase() + currentBooking.transport_mode.slice(1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Container Size</div>
                        <div className="text-sm font-medium">{currentBooking.container_size}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Cargo Type</div>
                        <div className="text-sm font-medium">{currentBooking.cargo_type || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Quantity</div>
                        <div className="text-sm font-medium">{currentBooking.quantity} {currentBooking.quantity > 1 ? 'units' : 'unit'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {currentBooking.special_instructions && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium mb-2">Special Instructions</h3>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-sm">
                    {currentBooking.special_instructions}
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsDetailViewOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsDetailViewOpen(false); 
                  handleEditBooking(currentBooking);
                }}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Booking
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <Download className="h-5 w-5 mr-2 text-primary" />
                Export Bookings
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
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">End Date</label>
                          <input
                            type="date"
                            className="w-full p-2 border rounded-md text-sm"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
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
                            id="include-quote-details" 
                            defaultChecked 
                            className="rounded text-primary border-gray-300 focus:ring-primary"
                          />
                          <label htmlFor="include-quote-details" className="text-sm">Include quote details</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="include-special-instructions" 
                            defaultChecked 
                            className="rounded text-primary border-gray-300 focus:ring-primary"
                          />
                          <label htmlFor="include-special-instructions" className="text-sm">Include special instructions</label>
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
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
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
                    {getExportSuccessMessage()}
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

export default BookingsPage; 