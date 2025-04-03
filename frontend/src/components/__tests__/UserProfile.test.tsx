import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfile from '../dashboard/UserProfile';
import * as api from '../../lib/api';
import { vi, describe, test, expect, beforeEach } from 'vitest';

// Mock the API function
vi.mock('../../lib/api', () => ({
  getUserProfile: vi.fn()
}));

describe('UserProfile Component', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
  });

  test('displays loading state initially', () => {
    // Mock API to return a promise that doesn't resolve immediately
    vi.mocked(api.getUserProfile).mockReturnValue(new Promise(() => {}));
    
    render(<UserProfile />);
    
    // Should show loading animation
    expect(screen.getByTestId('loading-animation')).toBeInTheDocument();
  });

  test('displays user profile data when loaded', async () => {
    // Mock API to return user profile data
    const mockUserProfile = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      title: 'System Administrator',
      phone: '+1 (555) 123-4567',
      created_at: '2023-01-15T08:30:00Z',
      last_login: '2023-08-21T14:45:00Z',
      avatar: 'https://example.com/avatar.jpg',
      recent_activities: [
        {
          id: 1,
          action: 'Updated customer profile',
          timestamp: '2023-08-20T10:30:00Z',
          type: 'customer'
        }
      ]
    };
    
    vi.mocked(api.getUserProfile).mockResolvedValue(mockUserProfile);
    
    render(<UserProfile />);
    
    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Check if user data is displayed
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('System Administrator')).toBeInTheDocument();
    expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Updated customer profile')).toBeInTheDocument();
  });

  test('displays error message on API failure', async () => {
    // Mock API to throw an error
    vi.mocked(api.getUserProfile).mockRejectedValue(new Error('Failed to fetch'));
    
    render(<UserProfile />);
    
    // Wait for the error to display
    await waitFor(() => {
      expect(screen.getByText('Failed to load user profile')).toBeInTheDocument();
    });
    
    // Check if retry button is displayed
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  test('displays minimal version when minimal prop is true', async () => {
    // Mock API to return user profile data
    const mockUserProfile = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      title: 'System Administrator',
      avatar: 'https://example.com/avatar.jpg'
    };
    
    vi.mocked(api.getUserProfile).mockResolvedValue(mockUserProfile);
    
    render(<UserProfile minimal={true} />);
    
    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Check if only minimal info is shown
    expect(screen.getByText('System Administrator')).toBeInTheDocument();
    
    // These elements should not be in the minimal version
    expect(screen.queryByText('Recent Activities')).not.toBeInTheDocument();
  });
}); 