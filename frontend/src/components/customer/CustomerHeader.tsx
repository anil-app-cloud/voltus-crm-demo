import React, { useState } from 'react';
import { Edit, Save, X, Mail, Phone, Globe, Building, MapPin, Calendar, UserCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Customer } from '../../types';
import { Badge } from '../ui/badge';

interface CustomerHeaderProps {
  customer: Customer;
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: (customerData: any) => void;
  onCancel?: () => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ 
  customer,
  isEditing = false,
  onEdit = () => {},
  onSave = () => {},
  onCancel = () => {} 
}) => {
  const [editFormData, setEditFormData] = useState<any>({
    company_name: customer?.company_name || '',
    customer_type: customer?.customer_type || 'Shipping Client',
    phone: customer?.phone || '',
    email: customer?.email || '',
    website: customer?.website || '',
    address: typeof customer?.address === 'string' 
      ? customer.address 
      : customer?.address && typeof customer.address === 'object'
        ? `${customer.address.street || ''}, ${customer.address.city || ''}, ${customer.address.state || ''} ${customer.address.zipcode || ''}`
        : ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editFormData);
  };

  if (!customer) {
    return (
      <div className="bg-white p-6 border-b shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1">Customer Details</h1>
          <p className="text-muted-foreground text-sm">Loading customer data...</p>
        </div>
      </div>
    );
  }

  const initials = customer.company_name 
    ? customer.company_name.split(' ').map(word => word[0] || '').join('').substring(0, 2) 
    : 'CU';
  
  const formattedAddress = typeof customer.address === 'string' 
    ? customer.address 
    : customer.address && typeof customer.address === 'object'
      ? `${customer.address.street || ''}, ${customer.address.city || ''}, ${customer.address.state || ''} ${customer.address.zipcode || ''}`
      : 'No address provided';

  const activeSinceDate = customer.active_since || customer.created_at;
  
  if (isEditing) {
    return (
      <div className="bg-white p-6 border-b shadow-sm rounded-lg transition-all duration-300 hover:shadow-md animate-fadeIn">
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1">Customer Details</h1>
          <p className="text-muted-foreground text-sm">
            Editing customer information
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="animate-slideInBottom">
          <div className="flex gap-5">
            <div className="bg-primary text-white w-16 h-16 rounded flex items-center justify-center text-xl font-semibold transition-all duration-300 hover:scale-105 shadow-md">
              {initials}
            </div>
            
            <div className="flex-1">
              <div className="mb-4">
                <Label htmlFor="company_name" className="text-sm font-medium text-gray-700">Company Name</Label>
                <Input 
                  id="company_name" 
                  name="company_name" 
                  value={editFormData.company_name} 
                  onChange={handleInputChange} 
                  className="mb-2 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                
                <Label htmlFor="customer_type" className="text-sm font-medium text-gray-700">Customer Type</Label>
                <Input 
                  id="customer_type" 
                  name="customer_type" 
                  value={editFormData.customer_type} 
                  onChange={handleInputChange}
                  className="mb-2 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    value={editFormData.email} 
                    onChange={handleInputChange}
                    className="transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={editFormData.phone} 
                    onChange={handleInputChange}
                    className="transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="website" className="text-sm font-medium text-gray-700">Website</Label>
                  <Input 
                    id="website" 
                    name="website" 
                    value={editFormData.website} 
                    onChange={handleInputChange}
                    className="transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={editFormData.address} 
                    onChange={handleInputChange}
                    className="transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button type="submit" className="flex items-center gap-1 transition-all duration-200 hover:scale-105">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-1 transition-all duration-200 hover:bg-red-50">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 border-b shadow-sm rounded-lg transition-all duration-300 hover:shadow-md animate-fadeIn">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold mb-1 flex items-center">
            <span className="text-primary">{customer.company_name}</span>
            <Badge variant="outline" className="ml-3 text-xs">{customer.status || 'Active'}</Badge>
          </h1>
          <p className="text-muted-foreground text-sm flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Active Since {activeSinceDate 
              ? new Date(activeSinceDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              : 'N/A'}
            {customer.id && <span className="ml-3 text-xs text-gray-500">ID: {customer.id}</span>}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEdit} 
          className="transition-all duration-200 hover:bg-primary/10 hover:scale-105 hover:shadow-sm"
        >
          <Edit className="h-4 w-4 mr-2" /> Edit Details
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 animate-fadeInUp">
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Email</p>
            <p className="text-sm font-medium">{customer.email || 'Not provided'}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Phone className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Phone</p>
            <p className="text-sm font-medium">{customer.phone || 'Not provided'}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Building className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Type</p>
            <p className="text-sm font-medium">{customer.customer_type || 'Shipping Client'}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Address</p>
            <p className="text-sm font-medium">{formattedAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHeader; 