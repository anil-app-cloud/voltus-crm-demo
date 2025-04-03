import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, Clipboard } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../components/ui/select';
import { Communication, Customer } from '../../types';

interface CommunicationModalProps {
  isOpen: boolean;
  communication: Communication | null;
  onClose: () => void;
  onSave: (data: Partial<Communication>) => void;
  customers: Customer[];
}

const CommunicationModal: React.FC<CommunicationModalProps> = ({
  isOpen,
  communication,
  onClose,
  onSave,
  customers
}) => {
  const [type, setType] = useState<string>('email');
  const [customerId, setCustomerId] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [toName, setToName] = useState<string>('');
  const [toTitle, setToTitle] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (communication) {
      setType(communication.type);
      setCustomerId(communication.customer_id?.toString() || '');
      setSubject(communication.subject || '');
      setContent(communication.content || '');
      setSummary(communication.summary || '');
      setDurationMinutes(communication.duration_minutes || 0);
      setToName(communication.to_name || '');
      setToTitle(communication.to_title || '');
    } else {
      // Reset form for new communication
      setType('email');
      setCustomerId('');
      setSubject('');
      setContent('');
      setSummary('');
      setDurationMinutes(0);
      setToName('');
      setToTitle('');
    }
    setErrors({});
  }, [communication]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerId) {
      newErrors.customerId = 'Please select a customer';
    }

    if (type === 'email') {
      if (!subject) newErrors.subject = 'Subject is required for emails';
      if (!content) newErrors.content = 'Content is required for emails';
      if (!toName) newErrors.toName = 'Recipient name is required for emails';
    }

    if (type === 'call') {
      if (!summary) newErrors.summary = 'Summary is required for calls';
      if (!toName) newErrors.toName = 'Contact name is required for calls';
    }

    if (type === 'note' && !content) {
      newErrors.content = 'Content is required for notes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      // Create base communication data with required fields
      const data: Partial<Communication> = {
        type: type as 'email' | 'call' | 'note',
        customer_id: customerId,
        date: new Date().toISOString(),
        status: 'internal' as 'sent' | 'completed' | 'internal',
        tags: [],
        from_name: 'Current User', // Would typically come from auth context
        from_title: 'Staff', // Would typically come from auth context
      };
      
      // Add type-specific fields and ensure all required fields are set
      if (type === 'email') {
        data.subject = subject;
        data.content = content;  // Required field
        data.to_name = toName;
        data.to_title = toTitle || 'Contact';
        data.sender_name = data.from_name;
      } else if (type === 'call') {
        data.subject = 'Call Record';  // Default subject for calls
        data.summary = summary;
        data.content = summary;  // Required field - use summary as content for database consistency
        data.duration_minutes = durationMinutes;
        data.to_name = toName;
        data.to_title = toTitle || 'Contact';
      } else if (type === 'note') {
        data.subject = 'Internal Note';  // Default subject for notes
        data.content = content;  // Required field
      }
      
      // Validate critical fields one more time
      const missingFields = [];
      if (!data.customer_id) missingFields.push('Customer');
      if (!data.type) missingFields.push('Type');
      if (!data.subject) missingFields.push('Subject');
      if (!data.content) missingFields.push('Content');
      
      if (missingFields.length > 0) {
        setIsSubmitting(false);
        alert(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      console.log('Submitting communication data:', data);
      onSave(data);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer">Customer</Label>
              <Select 
                value={customerId} 
                onValueChange={(value) => {
                  setCustomerId(value);
                  console.log('Customer selected:', value);
                }}
              >
                <SelectTrigger className={`mt-1 ${errors.customerId ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {customers && customers.length > 0 ? (
                    customers.map((customer) => (
                      <SelectItem 
                        key={customer.id} 
                        value={customer.id.toString()} // Ensure ID is string
                      >
                        {customer.company_name || `${customer.first_name} ${customer.last_name}`}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">
                      No customers available. Please try again.
                    </div>
                  )}
                </SelectContent>
              </Select>
              {process.env.NODE_ENV !== 'production' && (
                <div className="mt-1 text-xs text-gray-400">
                  {customers.length} customers loaded
                </div>
              )}
              {errors.customerId && (
                <p className="text-sm text-red-500 mt-1">{errors.customerId}</p>
              )}
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email specific fields */}
            {type === 'email' && (
              <>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={`mt-1 ${errors.subject ? 'border-red-500' : ''}`}
                  />
                  {errors.subject && (
                    <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="content">Email Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={`mt-1 min-h-[200px] ${errors.content ? 'border-red-500' : ''}`}
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500 mt-1">{errors.content}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="toName">To Name</Label>
                  <Input
                    id="toName"
                    type="text"
                    value={toName}
                    onChange={(e) => setToName(e.target.value)}
                    className={`mt-1 ${errors.toName ? 'border-red-500' : ''}`}
                  />
                  {errors.toName && (
                    <p className="text-sm text-red-500 mt-1">{errors.toName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="toTitle">To Title</Label>
                  <Input
                    id="toTitle"
                    type="text"
                    value={toTitle}
                    onChange={(e) => setToTitle(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Call specific fields */}
            {type === 'call' && (
              <>
                <div>
                  <Label htmlFor="toName">Contact Name</Label>
                  <Input
                    id="toName"
                    type="text"
                    value={toName}
                    onChange={(e) => setToName(e.target.value)}
                    className={`mt-1 ${errors.toName ? 'border-red-500' : ''}`}
                  />
                  {errors.toName && (
                    <p className="text-sm text-red-500 mt-1">{errors.toName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="toTitle">Contact Title</Label>
                  <Input
                    id="toTitle"
                    type="text"
                    value={toTitle}
                    onChange={(e) => setToTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="summary">Call Summary</Label>
                  <Textarea
                    id="summary"
                    placeholder="Summarize the call..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className={`mt-1 min-h-[150px] ${errors.summary ? 'border-red-500' : ''}`}
                  />
                  {errors.summary && (
                    <p className="text-sm text-red-500 mt-1">{errors.summary}</p>
                  )}
                </div>
              </>
            )}

            {/* Note specific fields */}
            {type === 'note' && (
              <div>
                <Label htmlFor="content">Note Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your note here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`mt-1 min-h-[200px] ${errors.content ? 'border-red-500' : ''}`}
                />
                {errors.content && (
                  <p className="text-sm text-red-500 mt-1">{errors.content}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className={isSubmitting ? 'opacity-70' : ''}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Communication'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CommunicationModal;