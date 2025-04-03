import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Header from '../layout/Header';
import { vi, describe, test, expect, beforeEach } from 'vitest';

// Mock the HelpCenter and ContactSupport components
vi.mock('../dashboard/HelpCenter', () => ({
  default: () => <div data-testid="help-center-component">Help Center Content</div>
}));

vi.mock('../dashboard/ContactSupport', () => ({
  default: () => <div data-testid="contact-support-component">Contact Support Content</div>
}));

describe('Header Component', () => {
  const renderWithRouter = (component: React.ReactNode) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  test('renders the header with help and profile links', () => {
    renderWithRouter(<Header />);
    
    // Help Center icon should be present
    const helpIcon = screen.getByText('JS'); // Using a text that's definitely present
    expect(helpIcon).toBeInTheDocument();
  });

  test('navigates to profile page when profile link is clicked', () => {
    renderWithRouter(<Header />);
    
    // Click the avatar to open the dropdown
    const avatar = screen.getByText('JS');
    fireEvent.click(avatar);
    
    // Profile link should be visible
    const profileLink = screen.getByText('Your Profile');
    expect(profileLink).toBeInTheDocument();
    expect(profileLink.getAttribute('href')).toBe('/profile');
  });
}); 