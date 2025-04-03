import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { RefreshCw } from 'lucide-react';
import { Booking } from '../../../types';

interface BookingListCardProps {
  className?: string;
  bookings: Booking[];
  error?: string | null;
  onRetry?: () => void;
}

const BookingListCard: React.FC<BookingListCardProps> = ({
  className,
  bookings,
  error,
  onRetry
}) => {
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-destructive mb-4">{error}</p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{booking.booking_number}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.origin} → {booking.destination}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={
                  booking.status === 'completed' ? 'success' :
                  booking.status === 'in_progress' ? 'warning' :
                  booking.status === 'cancelled' ? 'destructive' : 
                  'default'
                }>
                  {booking.status}
                </Badge>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingListCard; 