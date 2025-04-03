import { Booking } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Animate, FadeIn } from '../ui/animate';
import Skeleton, { SkeletonText } from '../ui/skeleton';

interface BookingListCardProps {
  className?: string;
  bookings: Booking[];
  error: string | null;
  onRetry: () => void;
  children?: (booking: Booking) => React.ReactNode;
  loading?: boolean;
}

const BookingListCard = ({ className, bookings, error, onRetry, children, loading = false }: BookingListCardProps) => {
  if (loading) {
    return (
      <Card className={className} loading>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Loading bookings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <SkeletonText className="h-5 w-40" style={{ animationDelay: `${i * 100}ms` }} />
                  <Skeleton className="h-6 w-20 rounded-full" style={{ animationDelay: `${i * 100 + 50}ms` }} />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" style={{ animationDelay: `${i * 100 + 100}ms` }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Error loading bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <FadeIn>
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={onRetry} variant="outline" size="sm" animation="bounce">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </FadeIn>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200 animate-pulse-soft';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>Recent Bookings</CardTitle>
        <CardDescription>Latest shipping bookings</CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        {bookings.length === 0 ? (
          <FadeIn>
            <p className="text-center text-sm text-muted-foreground p-2">No bookings found</p>
          </FadeIn>
        ) : (
          <div className="space-y-2">
            <Animate type="fade-in" staggerChildren={true} staggerDelay={100}>
              {bookings.map(booking => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between group p-2 rounded-md hover:bg-muted/30 transition-colors duration-200"
                >
                  <div>
                    <h4 className="font-medium group-hover:text-primary transition-colors duration-200">{booking.booking_number}</h4>
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(booking.status)} transition-all duration-300 group-hover:scale-105`}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  {children && children(booking)}
                </div>
              ))}
            </Animate>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export type { BookingListCardProps };
export default BookingListCard; 