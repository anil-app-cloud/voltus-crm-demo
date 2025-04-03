import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import * as apiModule from '../api';

// Mock the axios module
vi.mock('axios', () => {
  const axiosInstance = {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  };
  
  return {
    default: {
      create: vi.fn(() => axiosInstance),
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      isAxiosError: vi.fn(),
    },
  };
});

// Get the mocked axios instance
const mockedAxios = axios.create();

describe('API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Customer API Tests
  describe('Customer API', () => {
    it('getAllCustomers should fetch customers data', async () => {
      const mockData = [{ id: 1, name: 'Customer 1' }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getAllCustomers();
      expect(mockedAxios.get).toHaveBeenCalledWith('/customers');
      expect(result).toEqual(mockData);
    });

    it('getCustomerDetails should fetch customer details', async () => {
      const customerId = '123';
      const mockData = { id: customerId, name: 'Test Customer' };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getCustomerDetails(customerId);
      expect(mockedAxios.get).toHaveBeenCalledWith(`/customers/${customerId}/details`);
      expect(result).toEqual(mockData);
    });

    it('getCustomerContacts should fetch customer contacts', async () => {
      const customerId = '123';
      const mockData = [{ id: 1, name: 'Contact 1' }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getCustomerContacts(customerId);
      expect(mockedAxios.get).toHaveBeenCalledWith(`/customers/${customerId}/contacts`);
      expect(result).toEqual(mockData);
    });

    it('getCustomerOrders should fetch customer orders', async () => {
      const customerId = '123';
      const mockData = [{ id: 1, orderNumber: 'ORD001' }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getCustomerOrders(customerId);
      expect(mockedAxios.get).toHaveBeenCalledWith(`/customers/${customerId}/orders`);
      expect(result).toEqual(mockData);
    });

    it('getCustomerCommunications should fetch customer communications', async () => {
      const customerId = '123';
      const mockData = [{ id: 1, subject: 'Meeting' }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getCustomerCommunications(customerId);
      expect(mockedAxios.get).toHaveBeenCalledWith(`/customers/${customerId}/communications`);
      expect(result).toEqual(mockData);
    });

    it('getCustomerBookingEnquiries should fetch customer booking enquiries', async () => {
      const customerId = '123';
      const mockData = [{ id: 1, status: 'Pending' }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getCustomerBookingEnquiries(customerId);
      expect(mockedAxios.get).toHaveBeenCalledWith(`/customers/${customerId}/booking-enquiries`);
      expect(result).toEqual(mockData);
    });

    it('getCustomerActivities should fetch customer activities', async () => {
      const customerId = '123';
      const mockData = [{ id: 1, type: 'Call' }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getCustomerActivities(customerId);
      expect(mockedAxios.get).toHaveBeenCalledWith(`/customers/${customerId}/activities`);
      expect(result).toEqual(mockData);
    });

    it('getCustomerFinancialSummary should fetch customer financial summary', async () => {
      const customerId = '123';
      const mockData = { total: 5000, pending: 1000 };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getCustomerFinancialSummary(customerId);
      expect(mockedAxios.get).toHaveBeenCalledWith(`/customers/${customerId}/financial-summary`);
      expect(result).toEqual(mockData);
    });

    it('getCustomerInvoices should fetch customer invoices', async () => {
      const customerId = '123';
      const mockData = [{ id: 1, amount: 500 }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getCustomerInvoices(customerId);
      expect(mockedAxios.get).toHaveBeenCalledWith(`/customers/${customerId}/invoices`);
      expect(result).toEqual(mockData);
    });

    it('createCustomer should create a new customer', async () => {
      const customerData = { name: 'New Customer', email: 'customer@example.com' };
      const mockData = { id: '456', ...customerData };
      mockedAxios.post.mockResolvedValue({ data: mockData });

      const result = await apiModule.createCustomer(customerData);
      expect(mockedAxios.post).toHaveBeenCalledWith('/customers', customerData);
      expect(result).toEqual(mockData);
    });

    it('updateCustomer should update a customer', async () => {
      const customerId = '123';
      const customerData = { name: 'Updated Customer' };
      const mockData = { id: customerId, ...customerData };
      mockedAxios.put.mockResolvedValue({ data: mockData });

      const result = await apiModule.updateCustomer(customerId, customerData);
      expect(mockedAxios.put).toHaveBeenCalledWith(`/customers/${customerId}`, customerData);
      expect(result).toEqual(mockData);
    });

    it('deleteCustomer should delete a customer', async () => {
      const customerId = '123';
      const mockData = { success: true };
      mockedAxios.delete.mockResolvedValue({ data: mockData });

      const result = await apiModule.deleteCustomer(customerId);
      expect(mockedAxios.delete).toHaveBeenCalledWith(`/customers/${customerId}`);
      expect(result).toEqual(mockData);
    });
  });

  // Dashboard API Tests
  describe('Dashboard API', () => {
    it('getDashboardStats should fetch dashboard stats', async () => {
      const mockData = { totalCustomers: 100, totalRevenue: 50000 };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getDashboardStats();
      expect(mockedAxios.get).toHaveBeenCalledWith('/dashboard/stats');
      expect(result).toEqual(mockData);
    });

    it('getDashboardRecentCustomers should fetch recent customers', async () => {
      const mockData = [{ id: 1, name: 'Recent Customer' }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getDashboardRecentCustomers();
      expect(mockedAxios.get).toHaveBeenCalledWith('/dashboard/recent-customers');
      expect(result).toEqual(mockData);
    });

    it('getDashboardRecentBookings should fetch recent bookings', async () => {
      const mockData = [{ id: 1, status: 'Confirmed' }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getDashboardRecentBookings();
      expect(mockedAxios.get).toHaveBeenCalledWith('/dashboard/recent-bookings');
      expect(result).toEqual(mockData);
    });

    it('getDashboardFinancialSummary should fetch financial summary', async () => {
      const mockData = { totalRevenue: 50000, totalExpenses: 30000 };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getDashboardFinancialSummary();
      expect(mockedAxios.get).toHaveBeenCalledWith('/dashboard/financial-summary');
      expect(result).toEqual(mockData);
    });

    it('updateDashboardStats should update dashboard stats', async () => {
      const statsData = { totalCustomers: 120, totalRevenue: 60000 };
      const mockData = { success: true };
      mockedAxios.post.mockResolvedValue({ data: mockData });

      const result = await apiModule.updateDashboardStats(statsData);
      expect(mockedAxios.post).toHaveBeenCalledWith('/dashboard/stats', statsData);
      expect(result).toEqual(mockData);
    });

    it('addRecentActivity should add a recent activity', async () => {
      const activityData = { type: 'login', userId: '123' };
      const mockData = { id: 1, ...activityData };
      mockedAxios.post.mockResolvedValue({ data: mockData });

      const result = await apiModule.addRecentActivity(activityData);
      expect(mockedAxios.post).toHaveBeenCalledWith('/dashboard/activity', activityData);
      expect(result).toEqual(mockData);
    });
  });

  // Bookings API Tests
  describe('Bookings API', () => {
    it('getBookings should fetch bookings data', async () => {
      const mockData = [{ id: 1, status: 'Confirmed' }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getBookings();
      expect(mockedAxios.get).toHaveBeenCalledWith('/bookings');
      expect(result).toEqual(mockData);
    });

    it('getBookingById should fetch a booking by id', async () => {
      const bookingId = '123';
      const mockData = { id: bookingId, status: 'Confirmed' };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getBookingById(bookingId);
      expect(mockedAxios.get).toHaveBeenCalledWith(`/bookings/${bookingId}`);
      expect(result).toEqual(mockData);
    });

    it('createBooking should create a new booking', async () => {
      const bookingData = { customerId: '123', status: 'Pending' };
      const mockData = { id: '456', ...bookingData };
      mockedAxios.post.mockResolvedValue({ data: mockData });

      const result = await apiModule.createBooking(bookingData);
      expect(mockedAxios.post).toHaveBeenCalledWith('/bookings', bookingData);
      expect(result).toEqual(mockData);
    });

    it('updateBooking should update a booking', async () => {
      const bookingId = '123';
      const bookingData = { status: 'Confirmed' };
      const mockData = { id: bookingId, ...bookingData };
      mockedAxios.put.mockResolvedValue({ data: mockData });

      const result = await apiModule.updateBooking(bookingId, bookingData);
      expect(mockedAxios.put).toHaveBeenCalledWith(`/bookings/${bookingId}`, bookingData);
      expect(result).toEqual(mockData);
    });

    it('deleteBooking should delete a booking', async () => {
      const bookingId = '123';
      const mockData = { success: true };
      mockedAxios.delete.mockResolvedValue({ data: mockData });

      const result = await apiModule.deleteBooking(bookingId);
      expect(mockedAxios.delete).toHaveBeenCalledWith(`/bookings/${bookingId}`);
      expect(result).toEqual(mockData);
    });
    
    it('updateBookingStatus should update booking status', async () => {
      const bookingId = '123';
      const status = 'confirmed';
      const mockData = { id: bookingId, status };
      mockedAxios.patch.mockResolvedValue({ data: mockData });

      const result = await apiModule.updateBookingStatus(bookingId, status);
      expect(mockedAxios.patch).toHaveBeenCalledWith(`/bookings/${bookingId}`, { status });
      expect(result).toEqual(mockData);
    });
  });

  // Communications API Tests
  describe('Communications API', () => {
    it('getCommunications should fetch communications data', async () => {
      const mockData = [{ id: 1, subject: 'Meeting' }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getCommunications();
      expect(mockedAxios.get).toHaveBeenCalledWith('/communications');
      expect(result).toEqual(mockData);
    });

    it('createCommunication should create a new communication', async () => {
      const communicationData = { customerId: '123', subject: 'Meeting', content: 'Discussion' };
      const mockData = { id: '456', ...communicationData };
      mockedAxios.post.mockResolvedValue({ data: mockData });

      const result = await apiModule.createCommunication(communicationData);
      expect(mockedAxios.post).toHaveBeenCalledWith('/communications', communicationData);
      expect(result).toEqual(mockData);
    });
  });

  // Reports API Tests
  describe('Reports API', () => {
    it('getFinancialReports should fetch financial reports', async () => {
      const period = 'month';
      const mockData = [{ month: 'January', revenue: 50000 }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getFinancialReports(period);
      expect(mockedAxios.get).toHaveBeenCalledWith(`/reports/financial?period=${period}`);
      expect(result).toEqual(mockData);
    });

    it('getShippingReports should fetch shipping reports', async () => {
      const period = 'year';
      const mockData = [{ year: 2023, shipments: 500 }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getShippingReports(period);
      expect(mockedAxios.get).toHaveBeenCalledWith(`/reports/shipping?period=${period}`);
      expect(result).toEqual(mockData);
    });

    it('getCustomerReports should fetch customer reports', async () => {
      const period = 'quarter';
      const mockData = [{ quarter: 'Q1', newCustomers: 50 }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getCustomerReports(period);
      expect(mockedAxios.get).toHaveBeenCalledWith(`/reports/customers?period=${period}`);
      expect(result).toEqual(mockData);
    });
  });

  // Invoices API Tests
  describe('Invoices API', () => {
    it('getInvoices should fetch invoices data', async () => {
      const mockData = [{ id: 1, amount: 500 }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getInvoices();
      expect(mockedAxios.get).toHaveBeenCalledWith('/invoices');
      expect(result).toEqual(mockData);
    });

    it('getInvoiceById should fetch an invoice by id', async () => {
      const invoiceId = '123';
      const mockData = { id: invoiceId, amount: 500 };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getInvoiceById(invoiceId);
      expect(mockedAxios.get).toHaveBeenCalledWith(`/invoices/${invoiceId}`);
      expect(result).toEqual(mockData);
    });

    it('createInvoice should create a new invoice', async () => {
      const invoiceData = { customerId: '123', amount: 500, items: [] };
      const mockData = { id: '456', ...invoiceData };
      mockedAxios.post.mockResolvedValue({ data: mockData });

      const result = await apiModule.createInvoice(invoiceData);
      expect(mockedAxios.post).toHaveBeenCalledWith('/invoices', invoiceData);
      expect(result).toEqual(mockData);
    });

    it('updateInvoice should update an invoice', async () => {
      const invoiceId = '123';
      const invoiceData = { amount: 600 };
      const mockData = { id: invoiceId, ...invoiceData };
      mockedAxios.put.mockResolvedValue({ data: mockData });

      const result = await apiModule.updateInvoice(invoiceId, invoiceData);
      expect(mockedAxios.put).toHaveBeenCalledWith(`/invoices/${invoiceId}`, invoiceData);
      expect(result).toEqual(mockData);
    });

    it('updateInvoiceStatus should update invoice status (axios.patch version)', async () => {
      const invoiceId = 123;
      const status = 'paid';
      const mockData = { id: invoiceId, status };
      axios.patch.mockResolvedValue({ data: mockData });

      const result = await apiModule.updateInvoiceStatus(invoiceId, status);
      expect(axios.patch).toHaveBeenCalledWith(`http://localhost:5000/api/invoices/${invoiceId}`, { status });
      expect(result).toEqual(mockData);
    });

    it('deleteInvoice should delete an invoice', async () => {
      const invoiceId = '123';
      const mockData = { success: true };
      mockedAxios.delete.mockResolvedValue({ data: mockData });

      const result = await apiModule.deleteInvoice(invoiceId);
      expect(mockedAxios.delete).toHaveBeenCalledWith(`/invoices/${invoiceId}`);
      expect(result).toEqual(mockData);
    });
  });

  // Settings API Tests
  describe('Settings API', () => {
    it('getUserSettings should fetch user settings', async () => {
      const mockData = { theme: 'dark', notifications: true };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getUserSettings();
      expect(mockedAxios.get).toHaveBeenCalledWith('/settings/user');
      expect(result).toEqual(mockData);
    });

    it('updateUserSettings should update user settings', async () => {
      const settingsData = { theme: 'light' };
      const mockData = { ...settingsData };
      mockedAxios.put.mockResolvedValue({ data: mockData });

      const result = await apiModule.updateUserSettings(settingsData);
      expect(mockedAxios.put).toHaveBeenCalledWith('/settings/user', settingsData);
      expect(result).toEqual(mockData);
    });

    it('getSystemSettings should fetch system settings', async () => {
      const mockData = { maintenanceMode: false };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiModule.getSystemSettings();
      expect(mockedAxios.get).toHaveBeenCalledWith('/settings/system');
      expect(result).toEqual(mockData);
    });

    // Add updateSystemSettings function test if it exists in the API
  });

  // Error handling tests
  describe('Error handling', () => {
    it('should handle errors with fallback data', async () => {
      const errorMessage = 'Network Error';
      const error = new Error(errorMessage);
      mockedAxios.get.mockRejectedValue(error);

      const result = await apiModule.getInvoices();
      expect(mockedAxios.get).toHaveBeenCalledWith('/invoices');
      // Should return fallback data instead of throwing
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
    
    it('fetchInvoices should handle errors with fallback data', async () => {
      const errorMessage = 'Failed to fetch invoices';
      axios.get.mockRejectedValue({
        isAxiosError: true,
        response: { data: { message: errorMessage } }
      });
      axios.isAxiosError.mockReturnValue(true);
      
      const result = await apiModule.fetchInvoices();
      expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/invoices');
      // Should return fallback data instead of throwing
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });
}); 