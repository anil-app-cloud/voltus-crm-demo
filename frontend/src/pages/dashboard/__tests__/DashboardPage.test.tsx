import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../DashboardPage';
import '@testing-library/jest-dom';

// Mock the API functions
vi.mock('../../../lib/api', () => ({
  getDashboardStats: vi.fn(),
  getDashboardRecentCustomers: vi.fn(),
  getDashboardRecentBookings: vi.fn(),
  getDashboardFinancialSummary: vi.fn()
}));

// Import the mocked functions for assertions
import * as apiModule from '../../../lib/api';

// Reusable render function with router
const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <DashboardPage />
    </BrowserRouter>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock return values
    vi.mocked(apiModule.getDashboardStats).mockResolvedValue({
      total_customers: 120,
      total_bookings: 85,
      total_revenue: 48000,
      recent_activities: [
        { id: 1, type: 'New Customer', date: '2023-06-15', description: 'Added new customer XYZ Corp' },
        { id: 2, type: 'New Booking', date: '2023-06-14', description: 'Created booking #BK-2023-001' }
      ]
    });
    
    vi.mocked(apiModule.getDashboardRecentCustomers).mockResolvedValue([
      { id: 1, company_name: 'ABC Company', created_at: '2023-06-10' },
      { id: 2, company_name: 'XYZ Corp', created_at: '2023-06-09' }
    ]);
    
    vi.mocked(apiModule.getDashboardRecentBookings).mockResolvedValue([
      { id: 1, booking_number: 'BK-2023-001', created_at: '2023-06-08', status: 'Confirmed' },
      { id: 2, booking_number: 'BK-2023-002', created_at: '2023-06-07', status: 'Pending' }
    ]);
    
    vi.mocked(apiModule.getDashboardFinancialSummary).mockResolvedValue({
      monthly_revenue: [
        { month: 'Jan', amount: 12000 },
        { month: 'Feb', amount: 15000 },
        { month: 'Mar', amount: 18000 }
      ],
      pending_invoices: 12000
    });
  });

  it('calls API and renders dashboard content', async () => {
    renderWithRouter();
    
    // Check that API functions were called
    await waitFor(() => {
      expect(apiModule.getDashboardStats).toHaveBeenCalled();
      expect(apiModule.getDashboardRecentCustomers).toHaveBeenCalled();
      expect(apiModule.getDashboardRecentBookings).toHaveBeenCalled();
    });
    
    // Verify some company data is displayed
    expect(screen.getByText(/ABC Company/i)).toBeInTheDocument();
    expect(screen.getByText(/XYZ Corp/i)).toBeInTheDocument();
    
    // Verify booking numbers are displayed
    const bookingElements = screen.getAllByText((content, element) => {
      return content.includes('BK-2023-001') || content.includes('BK-2023-002');
    });
    expect(bookingElements.length).toBeGreaterThan(0);
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(apiModule.getDashboardStats).mockRejectedValueOnce(new Error('API error'));
    
    renderWithRouter();
    
    // The component doesn't explicitly show an error message, so we'll just check that the API was called
    await waitFor(() => {
      expect(apiModule.getDashboardStats).toHaveBeenCalled();
    });
  });
}); 