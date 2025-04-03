import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ship, Plane, Truck, Map, ArrowLeft, ArrowRight, Calendar, Clock, FileText, Package, Edit, Clipboard, X } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { getBookingById, getCustomerDetails } from '../../lib/api';
import { Booking, Customer } from '../../types';
import Skeleton from '../../components/ui/skeleton';

const BookingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch booking details
        const bookingResponse = await getBookingById(id);
        const bookingData = (bookingResponse as any).data;
        setBooking(bookingData);
        
        // Fetch customer details if we have customer_id
        if (bookingData.customer_id) {
          try {
            const customerResponse = await getCustomerDetails(bookingData.customer_id);
            setCustomer((customerResponse as any).data?.customer || null);
          } catch (customerError) {
            console.error('Error fetching customer details:', customerError);
            // Don't set an error state here, just log it
          }
        }
      } catch (err: any) {
        console.error('Error fetching booking details:', err);
        setError(err.response?.data?.message || 'Failed to load booking details');
      } finally {
        setIsLoading(false);
        // Delay setting page as loaded for smoother animations
        setTimeout(() => setIsPageLoaded(true), 100);
      }
    };
    
    fetchBookingDetails();
  }, [id]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTransportIcon = (mode: string | undefined) => {
    switch(mode) {
      case 'sea':
        return <Ship className="h-6 w-6" />;
      case 'air':
        return <Plane className="h-6 w-6" />;
      case 'road':
        return <Truck className="h-6 w-6" />;
      case 'rail':
        return <Truck className="h-6 w-6" />;
      default:
        return <Package className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch(status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'outline';
      case 'in_progress':
        return 'secondary';
      case 'completed':
        return 'success';
      case 'lost':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleEditBooking = () => {
    // Navigate to edit page or open modal
    navigate(`/bookings?edit=${id}`);
  };

  const handleGoBack = () => {
    navigate('/bookings');
  };

  // Render loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 space-y-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Render error state
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Card className="border-red-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center">
                <X className="mr-2 h-5 w-5" />
                Error Loading Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleGoBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Bookings
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Card className="border-amber-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-amber-600 flex items-center">
                <Clipboard className="mr-2 h-5 w-5" />
                Booking Not Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">The booking you're looking for could not be found.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleGoBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Bookings
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`space-y-8 transition-all duration-500 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 animate-fade-in">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="mb-2 hover:bg-transparent hover:text-primary pl-0"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Bookings
            </Button>
            <h1 className="text-3xl font-bold flex items-center animate-slide-in-left">
              <span className="bg-primary/10 text-primary p-2 rounded-full mr-3">
                {getTransportIcon(booking.transport_mode)}
              </span>
              Booking #{booking.booking_number}
            </h1>
            <p className="text-muted-foreground mt-1 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
              {customer?.company_name || 'Unknown Customer'} • Created on {formatDate(booking.created_at)}
            </p>
          </div>

          <div className="flex items-center space-x-4 animate-slide-in-right">
            <Badge variant={getStatusColor(booking.status)} className="text-sm px-3 py-1">
              {booking.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <Button 
              onClick={handleEditBooking}
              className="animate-pop"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Booking
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-md transition-all duration-300 animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg font-medium flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking Number</p>
                  <p className="font-medium">{booking.booking_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quote Amount</p>
                  <p className="font-medium">{formatCurrency(booking.quote_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transport Mode</p>
                  <div className="flex items-center font-medium">
                    {getTransportIcon(booking.transport_mode)}
                    <span className="ml-2">{booking.transport_mode?.charAt(0).toUpperCase() + booking.transport_mode?.slice(1)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Reference</p>
                  <p className="font-medium">{booking.order_reference || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Container Size</p>
                  <p className="font-medium">{booking.container_size || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cargo Type</p>
                  <p className="font-medium">{booking.cargo_type || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all duration-300 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg font-medium flex items-center">
                <Map className="h-5 w-5 mr-2 text-primary" />
                Shipment Route
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col items-start space-y-1">
                    <Badge variant="outline" className="mb-1">Origin</Badge>
                    <p className="font-medium text-lg">{booking.origin}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>Ready: {formatDate(booking.ready_date)}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 px-4 flex flex-col items-center">
                    <div className="w-full flex items-center justify-center relative">
                      <div className="h-0.5 bg-gray-200 w-full absolute"></div>
                      <div className="relative z-10 bg-white px-2">
                        <ArrowRight className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {booking.transport_mode?.charAt(0).toUpperCase() + booking.transport_mode?.slice(1)} Transport
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant="outline" className="mb-1">Destination</Badge>
                    <p className="font-medium text-lg">{booking.destination}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>Delivery: {formatDate(booking.delivery_date)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border p-4 bg-muted/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Shipment Timeline</p>
                    <Badge variant={getStatusColor(booking.status)}>
                      {booking.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 bg-primary rounded-full" style={{ width: `${booking.status === 'completed' ? 100 : booking.status === 'in_progress' ? 60 : booking.status === 'confirmed' ? 30 : 10}%` }}></div>
                    <div className="h-2 bg-gray-200 rounded-full flex-1"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 hover:shadow-md transition-all duration-300 animate-slide-in-bottom" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg font-medium flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                Cargo Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Cargo Type</p>
                  <p className="font-medium text-lg">{booking.cargo_type || 'N/A'}</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Weight</p>
                  <p className="font-medium text-lg">{booking.weight || 'N/A'} {booking.weight ? 'kg' : ''}</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Volume</p>
                  <p className="font-medium text-lg">{booking.volume || 'N/A'} {booking.volume ? 'm³' : ''}</p>
                </div>
              </div>
              
              {booking.special_instructions && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Special Instructions</h3>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                    {booking.special_instructions}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all duration-300 animate-slide-in-bottom" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg font-medium flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                      1
                    </div>
                    <div className="h-10 w-0.5 bg-gray-200 mt-1"></div>
                  </div>
                  <div>
                    <p className="font-medium">Booking Created</p>
                    <p className="text-sm text-muted-foreground">{formatDate(booking.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`h-6 w-6 rounded-full ${booking.status !== 'pending' ? 'bg-primary' : 'bg-gray-200'} flex items-center justify-center text-white text-xs`}>
                      2
                    </div>
                    <div className="h-10 w-0.5 bg-gray-200 mt-1"></div>
                  </div>
                  <div>
                    <p className="font-medium">Booking Confirmed</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.status !== 'pending' ? 'Confirmed' : 'Awaiting confirmation'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`h-6 w-6 rounded-full ${booking.status === 'in_progress' || booking.status === 'completed' ? 'bg-primary' : 'bg-gray-200'} flex items-center justify-center text-white text-xs`}>
                      3
                    </div>
                    <div className="h-10 w-0.5 bg-gray-200 mt-1"></div>
                  </div>
                  <div>
                    <p className="font-medium">Shipment In Progress</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.status === 'in_progress' ? 'In transit' : 
                       booking.status === 'completed' ? 'Completed' : 'Not started'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`h-6 w-6 rounded-full ${booking.status === 'completed' ? 'bg-primary' : 'bg-gray-200'} flex items-center justify-center text-white text-xs`}>
                      4
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Delivery Complete</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.status === 'completed' ? 
                        `Delivered on ${formatDate(booking.delivery_date)}` : 
                        `Expected on ${formatDate(booking.delivery_date)}`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default BookingDetailsPage; 