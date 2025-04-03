import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPdfContent } from '../../../utils/pdfUtils';

// Mock necessary functions for testing PDF creation
const mockHtmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Test Invoice</title>
    </head>
    <body>
      <h1>Invoice Test</h1>
      <p>This is a test invoice</p>
    </body>
  </html>
`;

// We need to mock Blob for this test
global.Blob = vi.fn().mockImplementation((content, options) => ({
  content,
  options,
  size: 0,
  type: options.type,
}));

describe('Invoice PDF Export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a PDF blob with correct HTML content', () => {
    const pdfBlob = createPdfContent(mockHtmlContent);
    
    // Check that we created a Blob with the right MIME type
    expect(pdfBlob).toBeDefined();
    expect(pdfBlob.type).toBe('application/pdf');
    
    // Check that our HTML content is in the Blob
    const content = pdfBlob.content[0] as string;
    expect(content).toContain('%PDF-1.4');
    expect(content).toContain(mockHtmlContent);
  });
  
  it('creates a PDF blob with a valid PDF header', () => {
    const pdfBlob = createPdfContent(mockHtmlContent);
    
    // Check that our blob starts with a valid PDF header
    const content = pdfBlob.content[0] as string;
    expect(content.trim().startsWith('%PDF-1.4')).toBe(true);
  });
}); 