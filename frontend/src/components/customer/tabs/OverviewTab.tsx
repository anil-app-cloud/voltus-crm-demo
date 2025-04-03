import React from 'react';
import { ArrowDown, ArrowUp, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { CustomerDetails } from '../../../types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';

interface OverviewTabProps {
  data: CustomerDetails;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ data }) => {
  const [showAllContacts, setShowAllContacts] = React.useState(false);
  
  // Custom style for fade-in animation (in case Tailwind doesn't have animate-fadeIn)
  const fadeInStyle = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.5s ease-out forwards;
    }
  `;
  
  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      // Prepare financial summary data
      const summaryData = [{
        'Total Orders': formatCurrency(data.financialSummary?.total_orders || 0),
        'Orders Change': `${data.financialSummary?.total_orders_change || 0}% from last year`,
        'Accounts Receivable': formatCurrency(data.financialSummary?.accounts_receivable || 0),
        'Receivable Change': `${data.financialSummary?.accounts_receivable_change || 0}% from last month`,
        'Average Days to Pay': `${data.financialSummary?.average_days_to_pay || 0} days`,
        'Days to Pay Change': `${data.financialSummary?.average_days_to_pay_change || 0} days from last quarter`,
        'Current Orders': formatCurrency(data.financialSummary?.current_orders || 0),
        'Current Orders Change': `${data.financialSummary?.current_orders_change || 0} new orders this month`
      }];

      // Prepare recent orders data
      const ordersData = data.recentOrders?.map(order => ({
        'Order Number': order.order_number,
        'Date': new Date(order.order_date || order.created_at).toLocaleDateString(),
        'Amount': formatCurrency(order.amount || order.total_amount || 0),
        'Status': order.status,
        'Payment Terms': order.payment_terms || 'Standard Terms'
      })) || [];

      // Prepare communications data
      const communicationsData = data.recentCommunications?.map(comm => ({
        'Type': comm.type,
        'Date': new Date(comm.date).toLocaleDateString(),
        'From': `${comm.from_name || comm.sender_name || 'Unknown'} (${comm.from_title || 'Staff'})`,
        'To': `${comm.to_name || comm.recipient_name || 'Customer'} (${comm.to_title || 'Contact'})`,
        'Content': comm.type === 'call' ? 
          `Duration: ${comm.duration_minutes || comm.duration || 0} minutes\nSummary: ${comm.summary || 'No summary available'}` :
          comm.content || 'No content available'
      })) || [];

      const fileName = `overview_export_${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv' || format === 'excel') {
        const wb = XLSX.utils.book_new();
        
        // Add summary sheet
        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
        
        // Add orders sheet
        if (ordersData.length > 0) {
          const ordersWs = XLSX.utils.json_to_sheet(ordersData);
          XLSX.utils.book_append_sheet(wb, ordersWs, 'Recent Orders');
        }
        
        // Add communications sheet
        if (communicationsData.length > 0) {
          const commsWs = XLSX.utils.json_to_sheet(communicationsData);
          XLSX.utils.book_append_sheet(wb, commsWs, 'Recent Communications');
        }

        try {
          if (format === 'csv') {
            XLSX.writeFile(wb, `${fileName}.csv`);
            toast.success('Overview data exported successfully as CSV');
          } else {
            XLSX.writeFile(wb, `${fileName}.xlsx`);
            toast.success('Overview data exported successfully as Excel');
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
          toast.success(`Overview data exported successfully as ${format.toUpperCase()}`);
        }
      } else if (format === 'pdf') {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Add title
        doc.setFontSize(16);
        doc.text('Overview Export', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);
        
        // Add summary table
        autoTable(doc, {
          startY: 30,
          head: [['Metric', 'Value']],
          body: Object.entries(summaryData[0]),
          theme: 'grid',
          styles: { 
            fontSize: 9,
            cellPadding: 3,
            overflow: 'linebreak',
            halign: 'left'
          },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 90 }
          },
          margin: { top: 30, left: 14, right: 14, bottom: 20 }
        });

        // Add recent orders table if available
        if (ordersData.length > 0) {
          doc.addPage();
          doc.setFontSize(14);
          doc.text('Recent Orders', 14, 15);
          
          autoTable(doc, {
            startY: 25,
            head: [['Order #', 'Date', 'Amount', 'Status', 'Payment Terms']],
            body: ordersData.map(order => [
              order['Order Number'],
              order['Date'],
              order['Amount'],
              order['Status'],
              order['Payment Terms']
            ]),
            theme: 'grid',
            styles: { 
              fontSize: 8,
              cellPadding: 2,
              overflow: 'linebreak',
              halign: 'left'
            },
            columnStyles: {
              0: { cellWidth: 30 },
              1: { cellWidth: 25 },
              2: { cellWidth: 30 },
              3: { cellWidth: 25 },
              4: { cellWidth: 40 }
            },
            margin: { top: 30, left: 14, right: 14, bottom: 20 }
          });
        }

        // Add communications table if available
        if (communicationsData.length > 0) {
          doc.addPage();
          doc.setFontSize(14);
          doc.text('Recent Communications', 14, 15);
          
          autoTable(doc, {
            startY: 25,
            head: [['Type', 'Date', 'From', 'To', 'Content']],
            body: communicationsData.map(comm => [
              comm['Type'],
              comm['Date'],
              comm['From'],
              comm['To'],
              comm['Content']
            ]),
            theme: 'grid',
            styles: { 
              fontSize: 8,
              cellPadding: 2,
              overflow: 'linebreak',
              halign: 'left'
            },
            columnStyles: {
              0: { cellWidth: 20 },
              1: { cellWidth: 25 },
              2: { cellWidth: 35 },
              3: { cellWidth: 35 },
              4: { cellWidth: 50 }
            },
            margin: { top: 30, left: 14, right: 14, bottom: 20 }
          });
        }

        try {
          const blob = doc.output('blob');
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${fileName}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          toast.success('Overview data exported successfully as PDF');
        } catch (error) {
          console.error('Error saving PDF:', error);
          toast.error('Failed to export PDF. Please try again.');
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export overview data. Please try again.');
    }
  };

  // Helper function to convert string to array buffer
  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  };

  if (!data) {
    return (
      <div className="p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Loading customer overview data...</p>
        </div>
      </div>
    );
  }

  const { 
    financialSummary = {}, 
    recentOrders = [], 
    recentCommunications = [], 
    keyContacts = [], 
    currentBookingEnquiries = [], 
    recentActivities = [] 
  } = data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  return (
    <div>
      {/* Include the custom animation style */}
      <style dangerouslySetInnerHTML={{ __html: fadeInStyle }} />
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Financial Summary</h3>
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
              <div className="mb-1 text-sm text-muted-foreground">Total Orders</div>
              <div className="text-2xl font-semibold">{formatCurrency(financialSummary?.total_orders || 0)}</div>
              <div className="text-sm mt-1 flex items-center">
                {(financialSummary?.total_orders_change || 0) > 0 ? (
                  <span className="text-green-600 flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" /> {financialSummary?.total_orders_change || 0}% from last year
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <ArrowDown className="h-4 w-4 mr-1" /> {Math.abs(financialSummary?.total_orders_change || 0)}% from last year
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-1 text-sm text-muted-foreground">Accounts Receivable</div>
              <div className="text-2xl font-semibold">{formatCurrency(financialSummary?.accounts_receivable || 0)}</div>
              <div className="text-sm mt-1 flex items-center">
                {(financialSummary?.accounts_receivable_change || 0) > 0 ? (
                  <span className="text-green-600 flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" /> {financialSummary?.accounts_receivable_change || 0}% from last month
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <ArrowDown className="h-4 w-4 mr-1" /> {Math.abs(financialSummary?.accounts_receivable_change || 0)}% from last month
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-1 text-sm text-muted-foreground">Average Days to Pay</div>
              <div className="text-2xl font-semibold">{financialSummary?.average_days_to_pay || 0} days</div>
              <div className="text-sm mt-1 flex items-center">
                {(financialSummary?.average_days_to_pay_change || 0) > 0 ? (
                  <span className="text-red-600 flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" /> {financialSummary?.average_days_to_pay_change || 0} days from last quarter
                  </span>
                ) : (
                  <span className="text-green-600 flex items-center">
                    <ArrowDown className="h-4 w-4 mr-1" /> {Math.abs(financialSummary?.average_days_to_pay_change || 0)} days from last quarter
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-1 text-sm text-muted-foreground">Current Orders</div>
              <div className="text-2xl font-semibold">{formatCurrency(financialSummary?.current_orders || 0)}</div>
              <div className="text-sm mt-1 flex items-center">
                <span className="text-green-600 flex items-center">
                  {financialSummary?.current_orders_change || 0} new orders this month
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <Button variant="link" size="sm">
            View All
          </Button>
        </div>
        
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Terms</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell>{new Date(order.order_date || order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{formatCurrency(order.amount || order.total_amount || 0)}</TableCell>
                    <TableCell>
                      <Badge variant={order.status as any}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>{order.payment_terms || 'Standard Terms'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">No recent orders found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Communications</h3>
          <Button variant="link" size="sm">
            View All
          </Button>
        </div>
        
        <div className="space-y-4">
          {recentCommunications.length > 0 ? (
            recentCommunications.map((comm) => (
              <Card key={comm.id} className="overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-200">
                <CardHeader className="bg-muted/30 p-4 flex flex-row items-center justify-between border-b">
                  <div>
                    <div className="text-sm font-medium capitalize flex items-center">
                      {comm.type === 'email' ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs mr-2">Email</span>
                      ) : comm.type === 'call' ? (
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs mr-2">Call</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs mr-2">{comm.type}</span>
                      )}
                      {new Date(comm.date).toLocaleDateString()}
                    </div>
                  </div>
                  {comm.type === 'email' && (
                    <div className="text-right text-sm">
                      <div><span className="text-gray-500">From:</span> <span className="font-medium">{comm.from_name || comm.sender_name || 'Unknown'}</span> <span className="text-gray-400">({comm.from_title || 'Staff'})</span></div>
                      <div><span className="text-gray-500">To:</span> <span className="font-medium">{comm.to_name || comm.recipient_name || 'Customer'}</span> <span className="text-gray-400">({comm.to_title || 'Contact'})</span></div>
                    </div>
                  )}
                  {comm.type === 'call' && (
                    <div className="text-right text-sm">
                      <div><span className="text-gray-500">Between:</span> <span className="font-medium">{comm.from_name || comm.sender_name || 'Unknown'}</span> and <span className="font-medium">{comm.to_name || comm.recipient_name || 'Customer'}</span></div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4 bg-white">
                  {comm.type === 'email' ? (
                    <div className="whitespace-pre-line text-sm">{comm.content || 'No content available'}</div>
                  ) : comm.type === 'call' ? (
                    <div className="text-sm">
                      <div className="mb-2"><span className="font-medium text-gray-700">Call Duration:</span> {comm.duration_minutes || comm.duration || 0} minutes</div>
                      <div><span className="font-medium text-gray-700">Summary:</span> {comm.summary || 'No summary available'}</div>
                    </div>
                  ) : (
                    <div className="text-sm">{comm.content || 'No content available'}</div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-4 text-center">
              <p className="text-muted-foreground">No recent communications found</p>
            </Card>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Key Contacts</h3>
            <Button variant="outline" size="sm">
              Add
            </Button>
          </div>
          
          <div className="space-y-4">
            {keyContacts.length > 0 ? (
              <>
                {(showAllContacts ? keyContacts : keyContacts.slice(0, 5)).map((contact, index) => (
                  <Card 
                    key={contact.id} 
                    className={`p-4 flex items-center hover:shadow-md transition-all duration-300 border border-gray-200 ${
                      index >= 5 ? 'animate-fadeIn' : ''
                    }`}
                    style={{
                      animationDelay: index >= 5 ? `${(index - 5) * 100}ms` : '0ms'
                    }}
                  >
                    <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium mr-4 shadow-sm">
                      {contact.initials || contact.first_name?.[0] + contact.last_name?.[0] || 'CT'}
                    </div>
                    <div className="flex-1 grid grid-cols-1 gap-0.5">
                      <div className="font-medium text-base">{contact.first_name} {contact.last_name}</div>
                      <div className="text-muted-foreground text-sm font-medium">{contact.title}</div>
                      <div className="text-sm text-blue-600">{contact.email}</div>
                      <div className="text-sm text-gray-600">{contact.phone}</div>
                    </div>
                  </Card>
                ))}
                
                {/* Show View All / View Less button if there are more than 5 contacts */}
                {keyContacts.length > 5 && (
                  <div className="text-center pt-3 mt-2 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAllContacts(!showAllContacts)}
                      className="transition-all duration-300 hover:bg-blue-50 font-medium mt-2"
                    >
                      {showAllContacts ? (
                        <>View Less <ChevronUp className="ml-2 h-4 w-4" /></>
                      ) : (
                        <>View All Contacts ({keyContacts.length}) <ChevronDown className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-4 text-center">
                <p className="text-muted-foreground">No key contacts found</p>
              </Card>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Current Booking Enquiries</h3>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
            
            {currentBookingEnquiries.length > 0 ? (
              currentBookingEnquiries.map((booking) => (
                <Card key={booking.id} className="mb-4 p-4 hover:shadow-md transition-all duration-300 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-medium text-base">Booking #{booking.booking_number}</div>
                    <Badge variant={(booking.status || 'pending') as any} className="ml-2">{booking.status}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="border-r border-gray-100 pr-2">
                      <div className="text-muted-foreground font-medium">Origin</div>
                      <div className="text-gray-800">{booking.origin || 'Not specified'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground font-medium">Destination</div>
                      <div className="text-gray-800">{booking.destination || 'Not specified'}</div>
                    </div>
                    <div className="border-r border-gray-100 pr-2">
                      <div className="text-muted-foreground font-medium">Ready Date</div>
                      <div className="text-gray-800">{booking.ready_date ? new Date(booking.ready_date).toLocaleDateString() : 'Not specified'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground font-medium">Quote Amount</div>
                      <div className="text-gray-800 font-medium">{formatCurrency(booking.quote_amount || 0)}</div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-4 text-center">
                <p className="text-muted-foreground">No current booking enquiries found</p>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab; 