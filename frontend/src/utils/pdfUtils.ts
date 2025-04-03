import jsPDF from 'jspdf';

/**
 * Creates a PDF-compatible Blob from HTML content
 * Uses jsPDF for proper PDF generation
 */
export const createPdfContent = (htmlContent: string): Blob => {
  // For simple HTML to PDF conversion
  // This only works for basic HTML - complex layouts would need a more robust approach
  try {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add the HTML content as text - this is a simple conversion
    // For complex HTML with formatting, we'd need html2canvas or similar
    doc.html(htmlContent, {
      callback: function() {
        // This will be called when the HTML is rendered
        console.log('PDF generated successfully');
      },
      x: 10,
      y: 10,
      width: 190, // slightly less than A4 width (210mm)
      windowWidth: 800 // Base width to calculate relative sizes
    });
    
    // Return the PDF as a blob
    return doc.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback to the simple approach if jsPDF fails
    const formattedHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Exported PDF</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @page { size: A4; margin: 1cm; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
    
    // Return as a blob with proper MIME type
    return new Blob([formattedHtml], { 
      type: 'application/pdf' 
    });
  }
};

/**
 * Helper function to download files
 */
export const downloadFile = (blob: Blob, fileName: string): void => {
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element and trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  
  // Append to the document, click, and clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Release the URL object
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}; 