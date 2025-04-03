import React, { useState } from 'react';
import { 
  Search, 
  BarChart2, 
  Users, 
  Calendar, 
  FileText, 
  MessageCircle, 
  Settings, 
  HelpCircle, 
  ChevronRight, 
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';

const HelpCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Help topics organized by category
  const helpTopics = [
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      icon: <BarChart2 className="h-4 w-4" />,
      questions: [
        {
          id: 'dashboard-1',
          question: 'How to read the dashboard statistics?',
          answer: 'The dashboard statistics section displays key metrics like total customers, active bookings, revenue, and pending invoices. Each card shows the current value and percentage change from previous period, with green indicating improvement and red indicating decline.'
        },
        {
          id: 'dashboard-2',
          question: 'How to customize dashboard layout?',
          answer: 'You can customize your dashboard layout by clicking the settings icon in the top-right corner of the dashboard. From there, you can drag and drop widgets, hide unnecessary information, and save your preferred layout.'
        },
        {
          id: 'dashboard-3',
          question: 'What does the financial summary show?',
          answer: 'The financial summary provides an overview of your revenue, paid and unpaid invoices, and overall financial health. The chart visualizes trends over time, and you can toggle between monthly, quarterly, and yearly views.'
        }
      ]
    },
    {
      id: 'customers',
      title: 'Customer Management',
      icon: <Users className="h-4 w-4" />,
      questions: [
        {
          id: 'customers-1',
          question: 'How to add a new customer?',
          answer: 'To add a new customer, navigate to the Customers section and click the "Add New Customer" button. Fill in the required information in the form and click Save. The new customer will be immediately available in your customer list.'
        },
        {
          id: 'customers-2',
          question: 'How to filter and search customers?',
          answer: 'Use the search bar at the top of the Customers page to search by name, email, or phone number. You can also use the filter options to narrow down results by status, creation date, or other criteria.'
        }
      ]
    },
    {
      id: 'bookings',
      title: 'Booking System',
      icon: <Calendar className="h-4 w-4" />,
      questions: [
        {
          id: 'bookings-1',
          question: 'How to create a new booking?',
          answer: 'To create a new booking, go to the Bookings page and click "New Booking". Select a customer from the dropdown (or create a new one), choose the service, date, and time. Add any notes if needed and save the booking.'
        },
        {
          id: 'bookings-2',
          question: 'How to reschedule a booking?',
          answer: 'Find the booking you want to reschedule in the Bookings list, click the "Edit" button, and modify the date and time. The system will automatically update the schedule and notify the customer if notifications are enabled.'
        }
      ]
    },
    {
      id: 'invoices',
      title: 'Invoicing',
      icon: <FileText className="h-4 w-4" />,
      questions: [
        {
          id: 'invoices-1',
          question: 'How to generate an invoice?',
          answer: 'To generate an invoice, go to the Invoices page and click "Create Invoice". Select the customer and add line items for products or services. The system calculates totals automatically. You can then save as draft or send directly to the customer.'
        },
        {
          id: 'invoices-2',
          question: 'How to mark an invoice as paid?',
          answer: 'Open the invoice from the Invoices list, click the "Mark as Paid" button, and confirm the payment details (date, amount, and method). This will update the invoice status and reflect in your financial reports.'
        }
      ]
    },
    {
      id: 'communications',
      title: 'Communications',
      icon: <MessageCircle className="h-4 w-4" />,
      questions: [
        {
          id: 'communications-1',
          question: 'How to send a message to a customer?',
          answer: 'From the Communications page, click "New Message", select the customer from the dropdown, write your message, and send. All communication history with that customer will be stored in their profile for easy reference.'
        }
      ]
    },
    {
      id: 'settings',
      title: 'Settings & Profile',
      icon: <Settings className="h-4 w-4" />,
      questions: [
        {
          id: 'settings-1',
          question: 'How to update your profile information?',
          answer: 'Click on your profile picture in the top-right corner and select "Your Profile". From there, you can edit your personal information, change your password, and update notification preferences.'
        },
        {
          id: 'settings-2',
          question: 'How to change system settings?',
          answer: 'Navigate to the Settings page from the main menu. Here you can configure application-wide settings like business details, tax rates, working hours, and integration with other services.'
        }
      ]
    }
  ];

  // Filter topics based on search term
  const filteredTopics = searchTerm
    ? helpTopics.map(category => ({
        ...category,
        questions: category.questions.filter(q => 
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
          q.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : helpTopics;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Help Center
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for help topics..."
            className="pl-8"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredTopics.length === 0 ? (
          <div className="text-center py-8">
            <Info className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try another search term or browse all categories
            </p>
            <Button variant="outline" onClick={() => setSearchTerm('')}>
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTopics.map(category => (
              <div key={category.id}>
                <h3 className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                  {category.icon}
                  <span className="ml-2">{category.title}</span>
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map(item => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="text-base font-normal hover:no-underline py-3">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
            
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HelpCenter; 