import React, { useEffect, useState } from 'react';
import { X, Ship, Plane, Truck, MapPin, User, Info, Calendar, Loader2, Package } from 'lucide-react';
import Modal from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Customer, Booking } from '../../types';
import { Animate, FadeIn, SlideInBottom } from '../../components/ui/animate';

// Extend the Booking type in the component if needed
interface ExtendedBooking extends Booking {
  booking_number?: string;
  booking_date?: string;
  description?: string;
}

interface BookingModalProps {
  isOpen: boolean;
  booking?: ExtendedBooking;
  onClose: () => void;
  onSave: (bookingData: ExtendedBooking) => void;
  customers: Customer[];
}

export function BookingModal({ isOpen, booking, onClose, onSave, customers = [] }: BookingModalProps) {
  const [formData, setFormData] = useState<ExtendedBooking>({
    customer_id: '',
    origin: '',
    destination: '',
    transport_mode: 'sea',
    status: 'pending',
    container_size: '20ft',
    cargo_type: '',
    quantity: '',
    weight: '',
    volume: '',
    ready_date: '',
    delivery_date: '',
    quote_amount: '',
    special_instructions: '',
    reason_lost: '',
    order_reference: '',
    booking_number: '',
    booking_date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (booking) {
      setFormData({
        ...booking,
        customer_id: booking.customer_id || '',
        booking_date: booking.booking_date || new Date().toISOString().split('T')[0],
        booking_number: booking.booking_number || '',
        description: booking.description || ''
      });
    } else {
      setFormData({
        customer_id: '',
        origin: '',
        destination: '',
        transport_mode: 'sea',
        status: 'pending',
        container_size: '20ft',
        cargo_type: '',
        quantity: '',
        weight: '',
        volume: '',
        ready_date: '',
        delivery_date: '',
        quote_amount: '',
        special_instructions: '',
        reason_lost: '',
        order_reference: '',
        booking_number: '',
        booking_date: new Date().toISOString().split('T')[0],
        description: ''
      });
    }
  }, [booking, isOpen]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    // Prevent default form submission if called from a form event
    if (e) {
      e.preventDefault();
    }
    
    try {
      setIsSubmitting(true);
      await onSave(formData);
      // Modal will be closed by the parent component after successful save
    } catch (error) {
      console.error('Error submitting booking:', error);
      // Don't close the modal on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const forceClosing = () => {
    // Only allow force closing when not submitting
    if (!isSubmitting) {
      onClose();
    }
  };

  const isFormValid = () => {
    return formData.customer_id && formData.origin && formData.destination && formData.booking_number && formData.cargo_type;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={forceClosing}
      size="lg"
      animationType="slide-up"
      className="p-0 max-h-[90vh] overflow-y-auto"
      showCloseButton={false}
      contentClassName="border-0 shadow-lg"
      closeOnOverlayClick={false}
    >
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              {formData.transport_mode === 'sea' ? (
                <Ship className="h-5 w-5" />
              ) : formData.transport_mode === 'air' ? (
                <Plane className="h-5 w-5" />
              ) : (
                <Truck className="h-5 w-5" />
              )}
            </div>
            <h2 className="text-xl font-semibold">
              {booking ? 'Edit Booking' : 'New Booking'}
            </h2>
          </div>
          <button 
            onClick={isSubmitting ? undefined : onClose}
            disabled={isSubmitting}
            className={`text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Close modal"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <form 
        id="booking-form" 
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex flex-col"
      >
        <div className="p-6 space-y-6 flex-grow">
          <FadeIn className="space-y-5" delay={50}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="booking_number" className="text-gray-700">Booking Number <span className="text-red-500">*</span></Label>
                <Input
                  id="booking_number"
                  name="booking_number"
                  value={formData.booking_number || ''}
                  onChange={handleChange}
                  placeholder="e.g., BKNG-2023-001"
                  className="w-full focus:ring-2 focus:ring-primary/30 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_id" className="text-gray-700">Customer <span className="text-red-500">*</span></Label>
                <select
                  id="customer_id"
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name || customer.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin" className="text-gray-700">Origin <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="origin"
                    name="origin"
                    value={formData.origin || ''}
                    onChange={handleChange}
                    placeholder="e.g., Shanghai, China"
                    className="w-full pl-10 focus:ring-2 focus:ring-primary/30 transition-all duration-200"
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination" className="text-gray-700">Destination <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="destination"
                    name="destination"
                    value={formData.destination || ''}
                    onChange={handleChange}
                    placeholder="e.g., Los Angeles, USA"
                    className="w-full pl-10 focus:ring-2 focus:ring-primary/30 transition-all duration-200"
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo_type" className="text-gray-700">Cargo Type <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="cargo_type"
                    name="cargo_type"
                    value={formData.cargo_type || ''}
                    onChange={handleChange}
                    placeholder="e.g., Electronics, Textiles, etc."
                    className="w-full pl-10 focus:ring-2 focus:ring-primary/30 transition-all duration-200"
                  />
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="transport_mode" className="text-gray-700">Transport Mode</Label>
                <select
                  id="transport_mode"
                  name="transport_mode"
                  value={formData.transport_mode || 'sea'}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                >
                  <option value="sea">Sea Freight</option>
                  <option value="air">Air Freight</option>
                  <option value="road">Road Freight</option>
                  <option value="rail">Rail Freight</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-700">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status || 'pending'}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking_date" className="text-gray-700">Booking Date</Label>
                <div className="relative">
                  <Input
                    id="booking_date"
                    name="booking_date"
                    type="date"
                    value={formData.booking_date || ''}
                    onChange={handleChange}
                    className="w-full pl-10 focus:ring-2 focus:ring-primary/30 transition-all duration-200"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700">Description</Label>
              <div className="relative">
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the booking details..."
                  className="w-full focus:ring-2 focus:ring-primary/30 pl-10 pt-2 transition-all duration-200"
                />
                <Info className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="sticky bottom-0 z-10 bg-gray-50 border-t px-6 py-4 flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={isSubmitting ? undefined : onClose}
            disabled={isSubmitting}
            className="transition-all duration-200 hover:bg-gray-100"
            type="button"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className={`bg-primary hover:bg-primary/90 transition-all duration-200 ${!isFormValid() || isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {booking ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              booking ? 'Update Booking' : 'Create Booking'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 