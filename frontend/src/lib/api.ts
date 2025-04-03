import axios, { AxiosRequestConfig, AxiosInstance, AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig, CancelTokenSource } from 'axios';
import { Invoice, Communication } from '../types';

// Fix for Vite environment variable typing
declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

let apiBaseUrl = "https://voltus-crm-demo.onrender.com";
// Remove trailing slash if present
if (apiBaseUrl.endsWith('/')) {
  apiBaseUrl = apiBaseUrl.slice(0, -1);
}
// Ensure API prefix is included
if (!apiBaseUrl.endsWith('/api')) {
  apiBaseUrl = `${apiBaseUrl}/api`;
}

// Create an axios instance with default config
const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
});

// Store pending requests
const pendingRequests = new Map<string, CancelTokenSource>();

// Function to generate request key
const getRequestKey = (config: { url?: string; method?: string; params?: any }) => {
  return `${config.method || 'get'}:${config.url || ''}:${JSON.stringify(config.params || {})}`;
};

// Cancel previous request if it exists
const cancelPreviousRequest = (key: string) => {
  const source = pendingRequests.get(key);
  if (source) {
    source.cancel('Request cancelled - duplicate in flight');
    pendingRequests.delete(key);
  }
};

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const key = getRequestKey(config);
    cancelPreviousRequest(key);
    
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;
    pendingRequests.set(key, source);
    
    if (config.method?.toLowerCase() === 'get') {
      // Add timestamp to prevent caching
      config.params = {
        ...config.params,
        _t: new Date().getTime()
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    const key = getRequestKey(response.config);
    pendingRequests.delete(key);
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      // Handle cancelled request
      console.log('Request cancelled:', error.message);
      return Promise.reject(error);
    }
    
    if (error.config) {
      const key = getRequestKey(error.config);
      pendingRequests.delete(key);
    }
    
    // For 404 errors on common endpoints, return default data
    if (error.response && error.response.status === 404) {
      const url = error.config?.url || '';
      
      // Common endpoints that might return 404 but should have default data
      if (url.includes('/communications')) {
        console.log(`Communications endpoint not found (404): ${url}, returning empty array`);
        return Promise.resolve({ data: { success: true, data: [] } });
      }
      
      if (url.includes('/settings/user')) {
        console.log(`Settings endpoint not found (404): ${url}, returning default settings`);
        return Promise.resolve({ 
          data: {
            theme: 'light',
            language: 'en',
            notifications: { email: true, browser: true, mobile: false },
            dashboard: { showRevenue: true, showBookings: true },
            display: { compactMode: false, tableRows: 10 }
          }
        });
      }
    }
    
    return Promise.reject(error);
  }
);

// const REALISTIC_COMPANY_NAMES = [
//   "Global Logistics Inc.",
//   "SkyWay Shipping",
//   "OceanBreeze Transport",
//   "Express Freight Services",
//   "Continental Cargo",
//   "Alliance Shipping Group",
//   "Pacific Route Logistics",
//   "Maritime Solutions Ltd",
//   "FastTrack Delivery",
//   "Atlas Transportation Co."
// ];

/**
 * Wrapper function to handle API calls with better error handling.
 * @param apiCall - The API call function to execute
 * @returns The API response data
 * @throws Error if the API call fails
 */
async function withErrorHandling<T>(apiCall: () => Promise<any>): Promise<T> {
  try {
    const response = await apiCall();
    
    if (process.env.NODE_ENV !== 'production') {
      console.debug('API Response:', {
        url: response.config?.url,
        method: response.config?.method,
        status: response.status,
        statusText: response.statusText
      });
    }
    
    // Return the data from the response
    //console.log("Response data:", response);
    return response.data;
  } catch (error: any) {
    // Don't log cancel errors as they're expected behavior
    if (axios.isCancel(error) || error.message === 'Request cancelled - duplicate in flight' || error.code === 'ERR_CANCELED') {
      throw error;
    }
    
    console.error('API error:', error);
    
    // Enhanced error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error data:', error.response.data);
      console.error('Response error status:', error.response.status);
      console.error('Response error headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request error:', error.request);
      if (error.code === 'ECONNABORTED') {
        console.error('Request timed out');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('Connection to server timed out');
      } else if (error.code === 'ERR_NETWORK') {
        console.error('Network error - server may be unreachable');
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    console.error('Error config:', error.config);
    
    // Rethrow the error for the caller to handle
    throw error;
  }
}

// Customer API endpoints
export const getCustomerDetails = async (id: string) => {
  return withErrorHandling(async () => {
    return api.get(`/customers/${id}/details`);
  });
};

// Interface for customer details response
interface CustomerDetailsResponse {
  customer: {
    id: string;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    status: string;
    created_at: string;
    updated_at: string;
    total_spent?: number;
    total_orders?: number;
  };
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
    total_revenue: number;
    total_orders_change: number;
    accounts_receivable: number;
    accounts_receivable_change: number;
    average_days_to_pay: number;
    average_days_to_pay_change: number;
    average_order_value: number;
    average_order_value_change: number;
    total_lifetime_value: number;
    total_lifetime_value_change: number;
    paidInvoices: number;
    unpaidInvoices: number;
    overdueInvoices: number;
  };
  invoices: any[];
}

export const getCustomerContacts = async (customerId: string) => {
  return withErrorHandling(() => api.get(`/customers/${customerId}/contacts`));
};

export const getCustomerOrders = async (customerId: string) => {
  return withErrorHandling(() => api.get(`/customers/${customerId}/orders`));
};

export const getCustomerCommunications = async (customerId: string) => {
  return withErrorHandling(() => api.get(`/customers/${customerId}/communications`));
};

export const getCustomerBookingEnquiries = async (customerId: string) => {
  return withErrorHandling(() => api.get(`/customers/${customerId}/booking-enquiries`));
};

export const getCustomerActivities = async (customerId: string) => {
  return withErrorHandling(() => api.get(`/customers/${customerId}/activities`));
};

export const getCustomerFinancialSummary = async (customerId: string) => {
  return withErrorHandling(() => api.get(`/customers/${customerId}/financial-summary`));
};

export const getCustomerInvoices = async (customerId: string) => {
  return withErrorHandling(() => api.get(`/customers/${customerId}/invoices`));
};

// New customer API endpoints
export const getAllCustomers = async (options?: { signal?: AbortSignal }) => {
  return withErrorHandling(async () => {
    try {
      console.debug('Fetching customers with signal:', options?.signal ? 'provided' : 'not provided');
      const response = await api.get('/customers', { 
        signal: options?.signal,
        // Add a request ID to help trace this request in network logs
        headers: {
          'X-Request-ID': `customers-${Date.now()}`
        }
      });
      
      console.debug('Customers fetch completed successfully', response.data);
      return response;
    } catch (error) {
      // Check if this is a cancellation error
      if (axios.isCancel(error)) {
        console.debug('Customers fetch was canceled');
      }
      throw error;
    }
  });
};

export const getCustomerById = async (id: string | number) => {
  return withErrorHandling(async () => {
    return api.get(`/customers/${id}`);
  });
};

export const createCustomer = async (customerData: any) => {
  return withErrorHandling(async () => {
    return api.post('/customers', customerData);
  });
};

export const updateCustomer = async (id: string, data: any) => {
  try {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Previous request was cancelled');
      throw error;
    }
    throw error;
  }
};

export const deleteCustomer = async (id: string | number) => {
  return withErrorHandling(async () => {
    return api.delete(`/customers/${id}`);
  });
};

// Dashboard API endpoints
export const getDashboardStats = async () => {
  return withErrorHandling(() => api.get('/dashboard/stats'));
};

export const getDashboardRecentCustomers = async () => {
  return withErrorHandling(() => api.get('/dashboard/recent-customers'));
};

export const getDashboardRecentBookings = async () => {
  return withErrorHandling(() => api.get('/dashboard/recent-bookings'));
};

/**
 * Get financial summary data for the dashboard
 */
export const getDashboardFinancialSummary = async () => {
  return withErrorHandling(() => api.get('/dashboard/financial-summary'));
};

export const updateDashboardStats = async (statsData: any) => {
  return withErrorHandling(async () => {
    return api.post('/dashboard/stats', statsData);
  });
};

export const addRecentActivity = async (activityData: any) => {
  return withErrorHandling(async () => {
    return api.post('/dashboard/activity', activityData);
  });
};

// Bookings API endpoints
export const getBookings = async () => {
  return withErrorHandling(async () => {
    return api.get('/bookings');
  });
};

export const getBookingById = async (id: string | number) => {
  return withErrorHandling(async () => {
    return api.get(`/bookings/${id}`);
  });
};

export const createBooking = async (bookingData: any) => {
  return withErrorHandling(async () => {
    try {
      // Validate required fields
      if (!bookingData.customer_id) {
        throw new Error('Customer is required');
      }
      if (!bookingData.origin || !bookingData.destination) {
        throw new Error('Origin and destination are required');
      }
      
      // Make the API call
      return api.post('/bookings', bookingData);
    } catch (error: any) {
      // Enhanced error logging
      console.error('Error creating booking:', error);
      console.error('Request payload:', bookingData);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      throw error;
    }
  });
};

export const updateBooking = async (id: string | number, bookingData: any) => {
  return withErrorHandling(async () => {
    return api.put(`/bookings/${id}`, bookingData);
  });
};

export const deleteBooking = async (id: string | number) => {
  return withErrorHandling(async () => {
    return api.delete(`/bookings/${id}`);
  });
};

export const updateBookingStatus = async (id: string | number, status: string) => {
  return withErrorHandling(async () => {
    return api.patch(`/bookings/${id}`, { status });
  });
};

// Communications API endpoints
export const getCommunications = async (options?: { signal?: AbortSignal }) => {
  return withErrorHandling<Communication[]>(async () => {
    try {
      console.debug('Fetching communications with signal:', options?.signal ? 'provided' : 'not provided');
      const response = await api.get('/communications', { 
        signal: options?.signal,
        // Add a request ID to help trace this request in network logs
        headers: {
          'X-Request-ID': `communications-${Date.now()}`
        }
      });
      return response;
    } catch (error) {
      // Check if this is a cancellation error
      if (axios.isCancel(error)) {
        console.debug('Communications fetch was canceled');
      }
      throw error; // Re-throw to be handled by withErrorHandling
    }
  });
};

export const getCommunicationById = async (id: string) => {
  return withErrorHandling<Communication>(async () => {
    const response = await api.get(`/communications/${id}`);
    return response.data;
  });
};

export const createCommunication = async (data: Partial<Communication>) => {
  return withErrorHandling<Communication>(async () => {
    try {
      // Generate a request ID to trace this specific API call
      const requestId = `comm-create-${Date.now()}`;
      
      // Clean the data to prevent undefined values
      const cleanedData: Record<string, any> = {
        customer_id: data.customer_id?.toString(),
        type: data.type,
        subject: data.subject || 'No Subject',
        content: data.content || '',
        date: data.date || new Date().toISOString(),
        status: data.status || 'internal',
        tags: Array.isArray(data.tags) ? data.tags : [],
        from_name: data.from_name || 'System User',
        // Include other fields but ensure they are not undefined
        ...(data.summary ? { summary: data.summary } : {}),
        ...(data.to_name ? { to_name: data.to_name } : {}),
        ...(data.to_title ? { to_title: data.to_title } : {}),
        ...(data.duration_minutes ? { duration_minutes: data.duration_minutes } : {}),
        ...(data.sender_name ? { sender_name: data.sender_name } : {}),
        ...(data.sender_email ? { sender_email: data.sender_email } : {})
      };
      
      // Ensure required fields are present
      const requiredFields = ['customer_id', 'type', 'subject', 'content'];
      const missingFields = requiredFields.filter(field => !cleanedData[field]);
      
      if (missingFields.length > 0) {
        console.error(`[${requestId}] Missing required fields:`, missingFields);
        throw new Error(`Required fields missing: ${missingFields.join(', ')}`);
      }
      
      console.debug(`[${requestId}] Creating communication with data:`, cleanedData);
      
      const response = await api.post('/communications', cleanedData, {
        headers: {
          'X-Request-ID': requestId
        }
      });
      
      console.debug(`[${requestId}] Communication created successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating communication:', error);
      // Enhance the error with more context
      if (error instanceof Error) {
        error.message = `Communication creation failed: ${error.message}`;
      }
      throw error;
    }
  });
};

export const updateCommunication = async (id: string, data: Partial<Communication>) => {
  return withErrorHandling<Communication>(async () => {
    const response = await api.put(`/communications/${id}`, {
      ...data,
      tags: data.tags || []
    });
    return response.data;
  });
};

export const deleteCommunication = async (id: string) => {
  return withErrorHandling<boolean>(async () => {
    await api.delete(`/communications/${id}`);
    return true;
  });
};

// Reports API endpoints
export const getFinancialReports = async (period: string = 'month') => {
  return withErrorHandling(async () => {
    return api.get(`/reports/financial?period=${period}`);
  });
};

export const getShippingReports = async (period: string = 'month') => {
  return withErrorHandling(async () => {
    return api.get(`/reports/shipping?period=${period}`);
  });
};

export const getCustomerReports = async (period: string = 'month') => {
  return withErrorHandling(async () => {
    return api.get(`/reports/customers?period=${period}`);
  });
};

// Invoices API endpoints
export const getInvoices = async () => {
  return withErrorHandling(async () => {
    return api.get('/invoices');
  });
};

export const getInvoiceById = async (id: string | number) => {
  return withErrorHandling(async () => {
    return api.get(`/invoices/${id}`);
  });
};

export const createInvoice = async (invoiceData: any) => {
  return withErrorHandling(async () => {
    return api.post('/invoices', invoiceData);
  });
};

export const updateInvoice = async (id: string | number, invoiceData: any) => {
  return withErrorHandling(async () => {
    return api.put(`/invoices/${id}`, invoiceData);
  });
};

export const deleteInvoice = async (id: string | number) => {
  return withErrorHandling(async () => {
    return api.delete(`/invoices/${id}`);
  });
};

// Settings API endpoints
export const getUserSettings = async () => {
  return withErrorHandling(async () => {
    return api.get('/settings/user');
  });
};

export const updateUserSettings = async (settingsData: any) => {
  return withErrorHandling(async () => {
    return api.put('/settings/user', settingsData);
  });
};

export const getSystemSettings = async () => {
  return withErrorHandling(async () => {
    return api.get('/settings/system');
  });
};

/**
 * Fetch all invoices
 */
export async function fetchInvoices(): Promise<Invoice[]> {
  return withErrorHandling(async () => {
    return axios.get(`${apiBaseUrl}/invoices`);
  });
}

/**
 * Fetch a single invoice by ID
 */
export async function fetchInvoiceById(id: number): Promise<Invoice> {
  return withErrorHandling(async () => {
    return axios.get(`${apiBaseUrl}/invoices/${id}`);
  });
}

/**
 * Update an invoice's status
 */
export async function updateInvoiceStatus(id: number, status: string): Promise<Invoice> {
  return withErrorHandling(async () => {
    return axios.patch(`${apiBaseUrl}/invoices/${id}`, { status });
  });
}

/**
 * Export invoices based on format and date range
 */
export async function exportInvoices(options: { 
  format: string; 
  dateRange: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ url: string }> {
  return withErrorHandling(async () => {
    return axios.post(`${apiBaseUrl}/invoices/export`, options);
  });
}

/**
 * Download an individual invoice as PDF
 */
export async function downloadInvoice(id: number): Promise<Blob> {
  return withErrorHandling(async () => {
    return axios.get(`${apiBaseUrl}/invoices/${id}/download`, {
      responseType: 'blob'
    });
  });
}

// User Profile API endpoint
export const getUserProfile = async () => {
  return withErrorHandling(async () => {
    return api.get('/dashboard/user-profile');
  });
};

// Properly implemented getFinancialSummary function
export const getFinancialSummary = async () => {
  return withErrorHandling(() => api.get('/dashboard/financial-summary'));
};

// Export public API functions
export {
  withErrorHandling,
  // ... all other exports ...
}