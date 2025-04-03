import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContactSupport from '../dashboard/ContactSupport';

describe('ContactSupport Component', () => {
  test('renders contact support form correctly', () => {
    render(<ContactSupport />);
    
    // Check if the main title is displayed
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
    
    // Check if contact methods are displayed
    expect(screen.getByText('Phone Support')).toBeInTheDocument();
    expect(screen.getByText('Email Support')).toBeInTheDocument();
    expect(screen.getByText('Live Chat')).toBeInTheDocument();
    
    // Check if form fields are present
    expect(screen.getByLabelText('Your Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address *')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject *')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Message *')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    
    // Check if buttons are present
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Submit Request')).toBeInTheDocument();
  });
  
  test('shows validation error when submitting empty form', () => {
    render(<ContactSupport />);
    
    // Click submit without filling form
    fireEvent.click(screen.getByText('Submit Request'));
    
    // Error message should be displayed
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
  });
  
  test('form inputs work correctly', () => {
    render(<ContactSupport />);
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText('Your Name *'), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText('Email Address *'), {
      target: { value: 'john@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Subject *'), {
      target: { value: 'Technical Issue' }
    });
    
    fireEvent.change(screen.getByLabelText('Message *'), {
      target: { value: 'I need help with setting up my dashboard.' }
    });
    
    // Check if values are set correctly
    expect(screen.getByLabelText('Your Name *')).toHaveValue('John Doe');
    expect(screen.getByLabelText('Email Address *')).toHaveValue('john@example.com');
    expect(screen.getByLabelText('Subject *')).toHaveValue('Technical Issue');
    expect(screen.getByLabelText('Message *')).toHaveValue('I need help with setting up my dashboard.');
  });
  
  test('displays success message after successful submission', async () => {
    // Mock global timers
    jest.useFakeTimers();
    
    render(<ContactSupport />);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Your Name *'), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText('Email Address *'), {
      target: { value: 'john@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Subject *'), {
      target: { value: 'Technical Issue' }
    });
    
    fireEvent.change(screen.getByLabelText('Message *'), {
      target: { value: 'I need help with setting up my dashboard.' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Submit Request'));
    
    // Should show loading state
    expect(screen.getByText('Submitting...')).toBeInTheDocument();
    
    // Fast-forward timer to simulate API response
    jest.advanceTimersByTime(1500);
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Support Request Submitted')).toBeInTheDocument();
    });
    
    // Check if success message has correct content
    expect(screen.getByText('Thank you for contacting support. We\'ll get back to you as soon as possible.')).toBeInTheDocument();
    expect(screen.getByText('Submit Another Request')).toBeInTheDocument();
    
    // Reset timers
    jest.useRealTimers();
  });
  
  test('going back to form after successful submission', async () => {
    // Mock global timers
    jest.useFakeTimers();
    
    render(<ContactSupport />);
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText('Your Name *'), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText('Email Address *'), {
      target: { value: 'john@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Subject *'), {
      target: { value: 'Technical Issue' }
    });
    
    fireEvent.change(screen.getByLabelText('Message *'), {
      target: { value: 'Test message' }
    });
    
    fireEvent.click(screen.getByText('Submit Request'));
    jest.advanceTimersByTime(1500);
    
    // Wait for success message and "Submit Another Request" button
    await waitFor(() => {
      expect(screen.getByText('Submit Another Request')).toBeInTheDocument();
    });
    
    // Click on "Submit Another Request"
    fireEvent.click(screen.getByText('Submit Another Request'));
    
    // Form should be visible again with empty fields
    expect(screen.getByLabelText('Your Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Your Name *')).toHaveValue('');
    
    // Reset timers
    jest.useRealTimers();
  });
}); 