import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Mail, 
  MessageCircle, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';

const ContactSupport: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    priority: 'normal'
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formState.name || !formState.email || !formState.subject || !formState.message) {
      setStatus('error');
      setErrorMessage('Please fill in all required fields');
      return;
    }
    
    setStatus('submitting');
    
    // Simulate API call
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form on success
      setFormState({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
        priority: 'normal'
      });
      
      setStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to submit your request. Please try again.');
    }
  };

  // Support contact information
  const supportContacts = [
    {
      icon: <Phone className="h-4 w-4" />,
      title: 'Phone Support',
      details: '+1 (555) 123-4567',
      availability: 'Mon-Fri: 9AM - 6PM EST'
    },
    {
      icon: <Mail className="h-4 w-4" />,
      title: 'Email Support',
      details: 'support@voltuscrm.com',
      availability: '24/7 response within 24 hours'
    },
    {
      icon: <MessageCircle className="h-4 w-4" />,
      title: 'Live Chat',
      details: 'Available on website',
      availability: 'Mon-Fri: 8AM - 8PM EST'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Contact Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {supportContacts.map((contact, index) => (
            <div key={index} className="flex items-start">
              <div className="p-2 rounded-md bg-primary/10 mr-3">
                {contact.icon}
              </div>
              <div>
                <h3 className="font-medium text-sm">{contact.title}</h3>
                <p className="text-sm">{contact.details}</p>
                <p className="text-xs text-muted-foreground">{contact.availability}</p>
              </div>
            </div>
          ))}
        </div>
        
        {status === 'success' ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <h3 className="font-medium">Support Request Submitted</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Thank you for contacting support. We'll get back to you as soon as possible.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setStatus('idle')}
            >
              Submit Another Request
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input 
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input 
                    id="subject"
                    name="subject"
                    value={formState.subject}
                    onChange={handleInputChange}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formState.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing Question</SelectItem>
                      <SelectItem value="account">Account Management</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea 
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleInputChange}
                  placeholder="Please describe your issue or question in detail"
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formState.priority}
                  onValueChange={(value) => handleSelectChange('priority', value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - General Question</SelectItem>
                    <SelectItem value="normal">Normal - Need Help</SelectItem>
                    <SelectItem value="high">High - System Issue</SelectItem>
                    <SelectItem value="urgent">Urgent - Critical Problem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        )}
      </CardContent>
      {status !== 'success' && (
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button variant="outline">Cancel</Button>
          <Button 
            disabled={status === 'submitting'} 
            onClick={handleSubmit}
            className="flex items-center gap-2"
          >
            {status === 'submitting' ? (
              <div className="h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            {status === 'submitting' ? 'Submitting...' : 'Submit Request'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ContactSupport; 