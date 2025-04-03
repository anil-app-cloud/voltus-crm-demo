import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Automatically clean up after each test
afterEach(() => {
  cleanup();
});

// Mock window.URL.createObjectURL/revokeObjectURL
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn(() => 'mock-url');
  window.URL.revokeObjectURL = vi.fn();
}

// Cache original createElement
const originalCreateElement = document.createElement.bind(document);

// Mock document.createElement for elements we're using in our tests
global.document.createElement = vi.fn((element: string) => {
  const el = originalCreateElement(element);
  
  if (element === 'a') {
    el.click = vi.fn();
  }
  
  return el;
}) as typeof document.createElement;

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
    args[0]?.includes?.('Error: Not implemented')
  ) {
    return;
  }
  originalConsoleError(...args);
}; 