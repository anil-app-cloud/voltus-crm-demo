import React from 'react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Mail, Phone, UserCircle, Calendar, Plus, Star, StarOff } from 'lucide-react';
import { Contact } from '../../../types';

interface ContactsTabProps {
  contacts: Contact[];
}

const ContactsTab: React.FC<ContactsTabProps> = ({ contacts }) => {
  if (!contacts || contacts.length === 0) {
    return (
      <div className="p-6 text-center animate-fadeIn">
        <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 max-w-md mx-auto">
          <UserCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Contacts Found</h3>
          <p className="text-gray-500">This customer does not have any contacts listed yet.</p>
          <Button variant="outline" size="sm" className="mt-4 animate-pulse-soft">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">All Contacts</h2>
        <Button variant="outline" size="sm" className="transition-all duration-200 hover:bg-primary/10 hover:scale-105">
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>
      
      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <Card key={contact.id} className="p-4 hover:shadow-md transition-all duration-300 animate-slideInBottom border border-gray-200" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-semibold shadow-md">
                  {contact.first_name?.[0]}{contact.last_name?.[0] || ''}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="font-medium text-lg flex items-center">
                      {contact.first_name} {contact.last_name}
                      {contact.is_primary && (
                        <Star className="h-4 w-4 text-amber-500 ml-2" />
                      )}
                    </div>
                    <div className="text-gray-500 text-sm">{contact.title || 'Contact'}</div>
                  </div>
                  
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    {contact.email && (
                      <Button variant="outline" size="sm" className="flex items-center gap-1 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600">
                        <Mail className="h-4 w-4" />
                        <span className="hidden sm:inline">Email</span>
                      </Button>
                    )}
                    {contact.phone && (
                      <Button variant="outline" size="sm" className="flex items-center gap-1 transition-all duration-200 hover:bg-green-50 hover:text-green-600">
                        <Phone className="h-4 w-4" />
                        <span className="hidden sm:inline">Call</span>
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="flex items-start">
                    <Mail className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm">{contact.email || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-sm">{contact.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  {contact.department && (
                    <div className="flex items-start">
                      <UserCircle className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="text-sm">{contact.department}</p>
                      </div>
                    </div>
                  )}
                  
                  {contact.last_contacted_at && (
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Last Contacted</p>
                        <p className="text-sm">{new Date(contact.last_contacted_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {contact.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-500 mb-1">Notes</p>
                    <p className="text-sm bg-gray-50 p-2 rounded">{contact.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContactsTab; 