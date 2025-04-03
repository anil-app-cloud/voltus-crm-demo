import React from 'react';
import { ArrowDown, ArrowUp, Download } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { FinancialSummary, Invoice } from '../../../types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';

interface FinancialsTabProps {
  financialSummary: FinancialSummary;
  invoices: Invoice[];
}

const FinancialsTab: React.FC<FinancialsTabProps> = ({ financialSummary, invoices }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      // Prepare financial summary data
      const summaryData = [{
        'Total Lifetime Value': formatCurrency(financialSummary.total_lifetime_value),
        'Lifetime Value Change': `${financialSummary.total_lifetime_value_change}%`,
        'Accounts Receivable': formatCurrency(financialSummary.accounts_receivable),
        'Receivable Change': `${financialSummary.accounts_receivable_change}%`,
        'Average Order Value': formatCurrency(financialSummary.average_order_value),
        'Order Value Change': `${financialSummary.average_order_value_change}%`,
        'Average Days to Pay': `${financialSummary.average_days_to_pay} days`,
        'Days to Pay Change': `${financialSummary.average_days_to_pay_change} days`
      }];

      // Prepare invoice data
      const invoiceData = invoices.map(invoice => ({
        'Invoice Number': invoice.invoice_number,
        'Amount': formatCurrency(invoice.total_amount),
        'Due Date': new Date(invoice.due_date).toLocaleDateString(),
        'Payment Date': invoice.payment_date ? new Date(invoice.payment_date).toLocaleDateString() : 'Not paid',
        'Status': invoice.status,
        'Days Late': invoice.status === 'paid' && invoice.payment_date ? 
          Math.round((new Date(invoice.payment_date).getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)) :
          'N/A'
      }));

      const fileName = `financial_export_${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv' || format === 'excel') {
        const wb = XLSX.utils.book_new();
        
        // Add summary sheet
        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Financial Summary');
        
        // Set summary column widths
        const summaryColWidths = [
          { wch: 20 }, // Total Lifetime Value
          { wch: 20 }, // Lifetime Value Change
          { wch: 20 }, // Accounts Receivable
          { wch: 20 }, // Receivable Change
          { wch: 20 }, // Average Order Value
          { wch: 20 }, // Order Value Change
          { wch: 20 }, // Average Days to Pay
          { wch: 20 }  // Days to Pay Change
        ];
        summaryWs['!cols'] = summaryColWidths;

        // Add invoices sheet
        const invoicesWs = XLSX.utils.json_to_sheet(invoiceData);
        XLSX.utils.book_append_sheet(wb, invoicesWs, 'Invoices');
        
        // Set invoices column widths
        const invoicesColWidths = [
          { wch: 15 }, // Invoice Number
          { wch: 15 }, // Amount
          { wch: 12 }, // Due Date
          { wch: 12 }, // Payment Date
          { wch: 12 }, // Status
          { wch: 10 }  // Days Late
        ];
        invoicesWs['!cols'] = invoicesColWidths;

        try {
          if (format === 'csv') {
            XLSX.writeFile(wb, `${fileName}.csv`);
            toast.success('Financial data exported successfully as CSV');
          } else {
            XLSX.writeFile(wb, `${fileName}.xlsx`);
            toast.success('Financial data exported successfully as Excel');
          }
        } catch (error) {
          console.error('Error writing file:', error);
          // Fallback to blob download
          const wbout = format === 'csv' 
            ? XLSX.write(wb, { bookType: 'csv', type: 'binary' })
            : XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
          
          const blob = new Blob([s2ab(wbout)], {
            type: format === 'csv' 
              ? 'text/csv;charset=utf-8' 
              : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${fileName}.${format === 'csv' ? 'csv' : 'xlsx'}`;
          a.click();
          window.URL.revokeObjectURL(url);
          toast.success(`Financial data exported successfully as ${format.toUpperCase()}`);
        }
      } else if (format === 'pdf') {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Add title
        doc.setFontSize(16);
        doc.text('Financial Export', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);
        
        // Add financial summary table
        autoTable(doc, {
          startY: 30,
          head: [['Metric', 'Value', 'Change']],
          body: [
            ['Total Lifetime Value', formatCurrency(financialSummary.total_lifetime_value), `${financialSummary.total_lifetime_value_change}%`],
            ['Accounts Receivable', formatCurrency(financialSummary.accounts_receivable), `${financialSummary.accounts_receivable_change}%`],
            ['Average Order Value', formatCurrency(financialSummary.average_order_value), `${financialSummary.average_order_value_change}%`],
            ['Average Days to Pay', `${financialSummary.average_days_to_pay} days`, `${financialSummary.average_days_to_pay_change} days`]
          ],
          theme: 'grid',
          styles: { 
            fontSize: 9,
            cellPadding: 3,
            overflow: 'linebreak',
            halign: 'left'
          },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 50 },
            2: { cellWidth: 30 }
          },
          margin: { top: 30, left: 14, right: 14, bottom: 20 }
        });
        
        // Add invoice history table
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Invoice History', 14, 15);
        
        const invoiceTableData = invoiceData.map(invoice => [
          invoice['Invoice Number'],
          invoice['Amount'],
          invoice['Due Date'],
          invoice['Payment Date'],
          invoice['Status'],
          invoice['Days Late'].toString()
        ]);
        
        autoTable(doc, {
          startY: 25,
          head: [['Invoice #', 'Amount', 'Due Date', 'Paid Date', 'Status', 'Days Late']],
          body: invoiceTableData,
          theme: 'grid',
          styles: { 
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak',
            halign: 'left'
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 30 },
            2: { cellWidth: 25 },
            3: { cellWidth: 25 },
            4: { cellWidth: 25 },
            5: { cellWidth: 20 }
          },
          margin: { top: 30, left: 14, right: 14, bottom: 20 }
        });
        
        try {
          const blob = doc.output('blob');
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${fileName}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          toast.success('Financial data exported successfully as PDF');
        } catch (error) {
          console.error('Error saving PDF:', error);
          toast.error('Failed to export PDF. Please try again.');
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export financial data. Please try again.');
    }
  };

  // Helper function to convert string to array buffer
  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Financial Overview</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="mb-1 text-sm text-muted-foreground">Total Lifetime Value</div>
              <div className="text-2xl font-semibold">{formatCurrency(financialSummary.total_lifetime_value)}</div>
              <div className="text-sm mt-1 flex items-center">
                {financialSummary.total_lifetime_value_change > 0 ? (
                  <span className="text-green-600 flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" /> {financialSummary.total_lifetime_value_change}% from last year
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <ArrowDown className="h-4 w-4 mr-1" /> {Math.abs(financialSummary.total_lifetime_value_change)}% from last year
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-1 text-sm text-muted-foreground">Accounts Receivable</div>
              <div className="text-2xl font-semibold">{formatCurrency(financialSummary.accounts_receivable)}</div>
              <div className="text-sm mt-1 flex items-center">
                {financialSummary.accounts_receivable_change > 0 ? (
                  <span className="text-green-600 flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" /> {financialSummary.accounts_receivable_change}% from last month
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <ArrowDown className="h-4 w-4 mr-1" /> {Math.abs(financialSummary.accounts_receivable_change)}% from last month
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-1 text-sm text-muted-foreground">Average Order Value</div>
              <div className="text-2xl font-semibold">{formatCurrency(financialSummary.average_order_value)}</div>
              <div className="text-sm mt-1 flex items-center">
                {financialSummary.average_order_value_change > 0 ? (
                  <span className="text-green-600 flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" /> {financialSummary.average_order_value_change}% from last year
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <ArrowDown className="h-4 w-4 mr-1" /> {Math.abs(financialSummary.average_order_value_change)}% from last year
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-1 text-sm text-muted-foreground">Average Days to Pay</div>
              <div className="text-2xl font-semibold">{financialSummary.average_days_to_pay} days</div>
              <div className="text-sm mt-1 flex items-center">
                {financialSummary.average_days_to_pay_change > 0 ? (
                  <span className="text-red-600 flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" /> {financialSummary.average_days_to_pay_change} days from last quarter
                  </span>
                ) : (
                  <span className="text-green-600 flex items-center">
                    <ArrowDown className="h-4 w-4 mr-1" /> {Math.abs(financialSummary.average_days_to_pay_change)} days from last quarter
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Payment Terms</h3>
        
        <Card className="p-6">
          <div className="mb-2">
            <div className="font-semibold">Standard Payment Terms</div>
            <div className="font-medium mt-1">Net 30 - Payment due within 30 days of invoice date</div>
          </div>
          
          <div className="mb-2">
            <div className="text-sm font-medium">Early Payment Discount:</div>
            <div className="text-sm">2% discount if paid within 10 days</div>
          </div>
          
          <div>
            <div className="text-sm font-medium">Late Payment Fee:</div>
            <div className="text-sm">1.5% per month on overdue balances</div>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Payment History</h3>
        
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date Due</TableHead>
                <TableHead>Date Paid</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoice_number}</TableCell>
                  <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                  <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {invoice.payment_date ? new Date(invoice.payment_date).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={invoice.status.replace(/\s+/g, '') as any}>
                      {invoice.status}
                      {invoice.status === 'paid' && invoice.payment_date && 
                        ` (${Math.round((new Date(invoice.payment_date).getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))} days late)`
                      }
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default FinancialsTab; 