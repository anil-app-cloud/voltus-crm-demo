import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HelpCenter from '../dashboard/HelpCenter';

describe('HelpCenter Component', () => {
  test('renders help center with all categories', () => {
    render(<HelpCenter />);
    
    // Check if the main title is displayed
    expect(screen.getByText('Help Center')).toBeInTheDocument();
    
    // Check if all categories are displayed
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    expect(screen.getByText('Customer Management')).toBeInTheDocument();
    expect(screen.getByText('Booking System')).toBeInTheDocument();
    expect(screen.getByText('Invoicing')).toBeInTheDocument();
    expect(screen.getByText('Communications')).toBeInTheDocument();
    expect(screen.getByText('Settings & Profile')).toBeInTheDocument();
  });
  
  test('search functionality works', () => {
    render(<HelpCenter />);
    
    // Get all accordion items before search
    const allQuestions = screen.getAllByRole('button');
    const initialQuestionCount = allQuestions.length;
    
    // Search for a specific term
    const searchInput = screen.getByPlaceholderText('Search for help topics...');
    fireEvent.change(searchInput, { target: { value: 'invoice' } });
    
    // After search, only invoice-related questions should be visible
    expect(screen.getByText('How to generate an invoice?')).toBeInTheDocument();
    expect(screen.getByText('How to mark an invoice as paid?')).toBeInTheDocument();
    
    // Customer-related questions should not be visible
    expect(screen.queryByText('How to add a new customer?')).not.toBeInTheDocument();
    
    // Filtered questions should be less than initial count
    const filteredQuestions = screen.getAllByRole('button').filter(
      button => button.textContent !== 'Contact Support for more help'
    );
    expect(filteredQuestions.length).toBeLessThan(initialQuestionCount);
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    
    // All questions should be visible again
    expect(screen.getByText('How to add a new customer?')).toBeInTheDocument();
  });
  
  test('accordion functionality works', () => {
    render(<HelpCenter />);
    
    // Initially, no answers should be visible
    const questionText = 'How to add a new customer?';
    const answerText = 'To add a new customer, navigate to the Customers section';
    
    // Answer should not be visible initially
    expect(screen.queryByText(answerText, { exact: false })).not.toBeInTheDocument();
    
    // Click on a question to expand it
    const questionButton = screen.getByText(questionText);
    fireEvent.click(questionButton);
    
    // Answer should now be visible
    expect(screen.getByText(answerText, { exact: false })).toBeInTheDocument();
    
    // Click again to collapse
    fireEvent.click(questionButton);
    
    // Answer should not be visible again
    expect(screen.queryByText(answerText, { exact: false })).not.toBeInTheDocument();
  });
  
  test('displays no results message when search has no matches', () => {
    render(<HelpCenter />);
    
    // Search for a term that won't match any content
    const searchInput = screen.getByPlaceholderText('Search for help topics...');
    fireEvent.change(searchInput, { target: { value: 'xyznonexistentterm' } });
    
    // No results message should be visible
    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText('Try another search term or browse all categories')).toBeInTheDocument();
    
    // Clear search button should work
    const clearButton = screen.getByText('Clear Search');
    fireEvent.click(clearButton);
    
    // After clearing, all categories should be visible again
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    expect(screen.queryByText('No results found')).not.toBeInTheDocument();
  });
}); 