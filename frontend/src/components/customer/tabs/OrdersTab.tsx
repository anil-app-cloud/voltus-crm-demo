import React from 'react';
import { Button } from '../../ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { AlertCircle, Package, ArrowDownToLine, Eye, Calendar, DollarSign, Truck, Ship, Plane } from 'lucide-react';
import { Order } from '../../../types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';

interface OrdersTabProps {
  orders?: Order[] | null;
}

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return 'Not specified';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const getStatusBadge = (status: string | undefined) => {
  const statusClass = {
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    'in-transit': 'bg-amber-100 text-amber-800 border-amber-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    pending: 'bg-gray-100 text-gray-800 border-gray-200',
  }[status?.toLowerCase() || 'pending'] || 'bg-gray-100 text-gray-800 border-gray-200';
  
  return <Badge className={`${statusClass} px-3 py-1 text-xs font-medium capitalize`}>{status || 'Processing'}</Badge>;
};

const getTransportIcon = (mode: string | undefined) => {
  switch(mode?.toLowerCase()) {
    case 'sea':
      return <Ship className="h-5 w-5 text-blue-500" />;
    case 'air':
      return <Plane className="h-5 w-5 text-sky-500" />;
    case 'road':
      return <Truck className="h-5 w-5 text-amber-500" />;
    default:
      return <Package className="h-5 w-5 text-gray-500" />;
  }
};

const OrdersTab: React.FC<OrdersTabProps> = ({ orders }) => {
  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    if (!orders || orders.length === 0) {
      toast.error('No orders available to export');
      return;
    }

    try {
      // Prepare data for export
      const exportData = orders.map(order => ({
        'Order Number': order.order_number || `#${order.id.slice(-6)}`,
        'Order Date': order.order_date ? new Date(order.order_date).toLocaleDateString() : 
                     new Date(order.created_at || Date.now()).toLocaleDateString(),
        'Status': order.status || 'Processing',
        'Amount': formatCurrency(order.amount || order.total_amount),
        'Transport Mode': order.transport_mode || 'Not specified',
        'Origin': order.origin || 'Not specified',
        'Destination': order.destination || 'Not specified',
        'Payment Terms': order.payment_terms || 'Not specified',
        'Invoice Number': order.invoice_number || 'Not specified',
        'Notes': order.notes || ''
      }));

      const fileName = `orders_export_${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv' || format === 'excel') {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        const colWidths = [
          { wch: 15 }, // Order Number
          { wch: 12 }, // Order Date
          { wch: 12 }, // Status
          { wch: 15 }, // Amount
          { wch: 15 }, // Transport Mode
          { wch: 20 }, // Origin
          { wch: 20 }, // Destination
          { wch: 20 }, // Payment Terms
          { wch: 15 }, // Invoice Number
          { wch: 30 }  // Notes
        ];
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, 'Orders');
        
        try {
          if (format === 'csv') {
            XLSX.writeFile(wb, `${fileName}.csv`);
            toast.success('Orders exported successfully as CSV');
          } else {
            XLSX.writeFile(wb, `${fileName}.xlsx`);
            toast.success('Orders exported successfully as Excel');
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
          toast.success(`Orders exported successfully as ${format.toUpperCase()}`);
        }
      } else if (format === 'pdf') {
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        
        // Add title
        doc.setFontSize(16);
        doc.text('Orders Export', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);
        
        // Create table
        const tableData = exportData.map(row => [
          row['Order Number'],
          row['Order Date'],
          row['Status'],
          row['Amount'],
          row['Transport Mode'],
          `${row['Origin']} → ${row['Destination']}`,
          row['Payment Terms'],
          row['Invoice Number']
        ]);
        
        autoTable(doc, {
          startY: 30,
          head: [['Order #', 'Date', 'Status', 'Amount', 'Transport', 'Route', 'Payment Terms', 'Invoice #']],
          body: tableData,
          theme: 'grid',
          styles: { 
            fontSize: 8, 
            cellPadding: 2,
            overflow: 'linebreak',
            halign: 'left'
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 25 },
            2: { cellWidth: 20 },
            3: { cellWidth: 25 },
            4: { cellWidth: 20 },
            5: { cellWidth: 35 },
            6: { cellWidth: 25 },
            7: { cellWidth: 20 }
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
          toast.success('Orders exported successfully as PDF');
        } catch (error) {
          console.error('Error saving PDF:', error);
          toast.error('Failed to export PDF. Please try again.');
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export orders. Please try again.');
    }
  };

  // Helper function to convert string to array buffer
  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="p-6 text-center animate-fadeIn">
        <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 max-w-md mx-auto">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-500">This customer does not have any orders yet.</p>
          <div className="flex gap-2 justify-center mt-4">
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Order History</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="transition-all duration-200 hover:bg-primary/10 hover:scale-105">
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="transition-all duration-200 hover:bg-primary/10 hover:scale-105">
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="transition-all duration-200 hover:bg-primary/10 hover:scale-105">
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {orders.map((order, index) => (
          <Card key={order.id} className="overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300 animate-slideInBottom" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                {getTransportIcon(order.transport_mode)}
                <div>
                  <h3 className="font-medium text-gray-900">
                    Order {order.order_number || `#${order.id.slice(-6)}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(order.created_at || order.order_date || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(order.status)}
                <Button variant="ghost" size="sm" className="flex items-center gap-1 opacity-70 hover:opacity-100">
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">View</span>
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-md flex items-start">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="text-sm font-medium">
                      {order.order_date ? new Date(order.order_date).toLocaleDateString() : 
                       new Date(order.created_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md flex items-start">
                  <DollarSign className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="text-sm font-medium">{formatCurrency(order.amount || order.total_amount)}</p>
                  </div>
                </div>
                
                {order.payment_terms && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-500">Payment Terms</p>
                    <p className="text-sm font-medium">{order.payment_terms}</p>
                  </div>
                )}
                
                {order.invoice_number && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-500">Invoice</p>
                    <p className="text-sm font-medium">{order.invoice_number}</p>
                  </div>
                )}
                
                {order.origin && order.destination && (
                  <div className="bg-gray-50 p-3 rounded-md col-span-2">
                    <p className="text-sm text-gray-500">Route</p>
                    <p className="text-sm font-medium">{order.origin} → {order.destination}</p>
                  </div>
                )}
              </div>
              
              {order.items && order.items.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {order.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm bg-gray-50 p-3 rounded">{order.notes}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrdersTab; 