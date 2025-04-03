import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { BookingEnquiry } from '../../../types';
import { Ship, Plane, Truck, Calendar, DollarSign, Package } from 'lucide-react';

interface BookingEnquiriesTabProps {
  bookings: BookingEnquiry[];
}

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return 'Not specified';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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

const getStatusColor = (status: string | undefined): string => {
  switch(status?.toLowerCase()) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'in-progress':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'completed':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const BookingEnquiriesTab: React.FC<BookingEnquiriesTabProps> = ({ bookings }) => {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="p-6 text-center animate-fadeIn">
        <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 max-w-md mx-auto">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Booking Enquiries</h3>
          <p className="text-gray-500">This customer does not have any booking enquiries yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6">Booking Enquiries</h2>
      
      <div className="space-y-6">
        {bookings.map((booking, index) => (
          <Card key={booking.id} className="overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300 animate-slideInBottom" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  {getTransportIcon(booking.transport_mode)}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Booking {booking.booking_number || `#${booking.id.slice(-6)}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(booking.created_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(booking.status)} px-3 py-1 text-xs font-medium capitalize`}>
                  {booking.status || 'Pending'}
                </Badge>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-500 mb-1">Origin</div>
                    <div className="font-medium">{booking.origin || 'Not specified'}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-500 mb-1">Destination</div>
                    <div className="font-medium">{booking.destination || 'Not specified'}</div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md flex items-start">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Ready Date</div>
                      <div className="font-medium">
                        {booking.ready_date ? new Date(booking.ready_date).toLocaleDateString() : 'Not specified'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md flex items-start">
                    <DollarSign className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Quote Amount</div>
                      <div className="font-medium">{formatCurrency(booking.quote_amount)}</div>
                    </div>
                  </div>
                  
                  {booking.cargo_type && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-sm text-gray-500 mb-1">Cargo Type</div>
                      <div className="font-medium">{booking.cargo_type}</div>
                    </div>
                  )}
                  
                  {booking.transport_mode && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-sm text-gray-500 mb-1">Transport Mode</div>
                      <div className="font-medium capitalize flex items-center">
                        {getTransportIcon(booking.transport_mode)}
                        <span className="ml-2">{booking.transport_mode}</span>
                      </div>
                    </div>
                  )}
                  
                  {(booking.container_size || booking.quantity) && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-sm text-gray-500 mb-1">Containers</div>
                      <div className="font-medium">
                        {booking.quantity ? `${booking.quantity} × ` : ''}{booking.container_size || 'Standard'}
                      </div>
                    </div>
                  )}
                  
                  {(booking.weight || booking.volume) && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-sm text-gray-500 mb-1">Dimensions</div>
                      <div className="font-medium">
                        {booking.weight ? `${booking.weight} kg` : ''}
                        {booking.weight && booking.volume ? ' | ' : ''}
                        {booking.volume ? `${booking.volume} CBM` : ''}
                      </div>
                    </div>
                  )}
                  
                  {booking.delivery_date && (
                    <div className="bg-gray-50 p-3 rounded-md flex items-start">
                      <Calendar className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Delivery Date</div>
                        <div className="font-medium">{new Date(booking.delivery_date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                  
                  {booking.order_reference && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-sm text-gray-500 mb-1">Order Reference</div>
                      <div className="font-medium">{booking.order_reference}</div>
                    </div>
                  )}
                </div>
                
                {booking.notes && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-500 mb-1">Notes</div>
                    <div className="p-3 border rounded-md bg-gray-50">{booking.notes}</div>
                  </div>
                )}
                
                {booking.reason_lost && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-500 mb-1">Reason Lost</div>
                    <div className="p-3 border rounded-md bg-red-50 text-red-700">{booking.reason_lost}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BookingEnquiriesTab; 