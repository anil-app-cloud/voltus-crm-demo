import React, { useState } from 'react';
import { BellIcon, Search, User, MessageCircle, HelpCircle, X, Check, LogOut, Settings, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Dropdown } from '../ui/dropdown';
import HelpCenter from '../dashboard/HelpCenter';
import ContactSupport from '../dashboard/ContactSupport';
import { ThemeToggle } from '../ui/theme-toggle';
import { ThemeCustomizer } from '../ui/theme-customizer';

const Header = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New booking request', message: 'A new booking has been created', time: '10 minutes ago', read: false },
    { id: 2, title: 'Invoice paid', message: 'Invoice #INV-2023-004 has been paid', time: '2 hours ago', read: false },
    { id: 3, title: 'Shipment update', message: 'Order #ORD-2023-003 is now in transit', time: '5 hours ago', read: false },
    { id: 4, title: 'New customer', message: 'New customer account created', time: '1 day ago', read: true },
    { id: 5, title: 'System maintenance', message: 'Scheduled maintenance on Sunday', time: '2 days ago', read: true },
  ]);

  const [messages, setMessages] = useState([
    { id: 1, name: 'Thomas Anderson', avatar: 'TA', message: 'Can you update me on my shipment?', time: '15 minutes ago', read: false },
    { id: 2, name: 'Sarah Connor', avatar: 'SC', message: 'Thanks for the quick response!', time: '3 hours ago', read: false },
    { id: 3, name: 'James Kirk', avatar: 'JK', message: 'Please send the invoice again', time: '1 day ago', read: true },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showContactSupport, setShowContactSupport] = useState(false);

  const helpTopics = [
    { id: 1, title: 'Creating bookings', link: '#', description: 'Learn how to create and manage booking requests' },
    { id: 2, title: 'Managing invoices', link: '#', description: 'How to create, send and track invoices' },
    { id: 3, title: 'Tracking shipments', link: '#', description: 'Monitor your shipments in real-time' },
    { id: 4, title: 'Customer management', link: '#', description: 'Best practices for managing customer data' },
    { id: 5, title: 'Contact support', link: '#', description: 'Get help from our customer support team' },
  ];

  const searchResults = [
    { id: 1, type: 'Customer', title: 'Acme Corp', url: '/customers/1' },
    { id: 2, type: 'Invoice', title: 'INV-2023-004', url: '/invoices' },
    { id: 3, type: 'Booking', title: 'BK-2023-012', url: '/bookings' },
  ];

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
  };

  const markAllMessagesAsRead = () => {
    setMessages(messages.map(message => ({
      ...message,
      read: true
    })));
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markMessageAsRead = (id: number) => {
    setMessages(messages.map(message => 
      message.id === id ? { ...message, read: true } : message
    ));
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowSearchResults(true);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value === '') {
      setShowSearchResults(false);
    }
  };

  const handleLogout = () => {
    // In a real app, this would clear authentication tokens, session data, etc.
    console.log('User logged out');
    // For demo purposes, redirect to login page after small delay
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  const handleContactSupport = () => {
    setShowHelpCenter(false);
    setShowContactSupport(true);
  };

  const handleCloseModals = () => {
    setShowHelpCenter(false);
    setShowContactSupport(false);
  };

  return (
    <>
      <div className="header fixed top-0 left-64 right-0 h-16 bg-white border-b z-10 flex justify-between items-center px-6 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="h-10 w-64 rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearch}
              onFocus={() => searchQuery && setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            />
            {showSearchResults && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-white border rounded-md shadow-lg z-50">
                <div className="p-2 border-b text-xs font-medium text-gray-500">Search Results</div>
                {searchResults.map(result => (
                  <a 
                    key={result.id} 
                    href={result.url}
                    className="block px-4 py-2 hover:bg-gray-50 text-sm flex items-center"
                  >
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 mr-2">{result.type}</span>
                    {result.title}
                  </a>
                ))}
                <div className="p-2 border-t text-center">
                  <a href="#" className="text-xs text-primary hover:underline">View all results</a>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-5">
          <ThemeToggle />
          <ThemeCustomizer />
          <Dropdown
            trigger={
              <button 
                className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setShowHelpCenter(true)}
              >
                <HelpCircle className="h-5 w-5" />
              </button>
            }
            align="right"
            width={320}
            open={false} // We're using custom modal instead
          >
            <div></div>
          </Dropdown>

          <Dropdown
            trigger={
              <button className="relative text-gray-500 hover:text-gray-700">
                <MessageCircle className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {messages.filter(m => !m.read).length}
                </span>
              </button>
            }
            align="right"
            width={320}
          >
            <div className="py-2 px-1">
              <div className="flex items-center justify-between px-3 pb-2 mb-1 border-b">
                <div className="text-sm font-medium">Messages</div>
                {messages.some(m => !m.read) && (
                  <button 
                    className="text-xs text-primary hover:underline flex items-center"
                    onClick={markAllMessagesAsRead}
                  >
                    <Check className="h-3 w-3 mr-1" /> Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex items-start p-3 hover:bg-gray-50 cursor-pointer ${!message.read ? 'bg-blue-50' : ''}`}
                      onClick={() => markMessageAsRead(message.id)}
                    >
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback>{message.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className="text-sm font-medium truncate">{message.name}</p>
                          <span className="text-xs text-gray-500">{message.time}</span>
                        </div>
                        <p className="text-xs text-gray-600 truncate">{message.message}</p>
                      </div>
                      {!message.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 ml-1"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-sm text-gray-500">
                    No messages
                  </div>
                )}
              </div>
              <div className="px-3 pt-2 mt-1 border-t">
                <div className="flex justify-between">
                  <button 
                    className="text-sm text-primary hover:underline"
                  >
                    View all messages
                  </button>
                  <button 
                    className="text-sm text-primary hover:underline flex items-center"
                  >
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">New Message</span>
                  </button>
                </div>
              </div>
            </div>
          </Dropdown>

          <Dropdown
            trigger={
              <button className="relative text-gray-500 hover:text-gray-700">
                <BellIcon className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {notifications.filter(n => !n.read).length}
                </span>
              </button>
            }
            align="right"
            width={320}
          >
            <div className="py-2 px-1">
              <div className="flex items-center justify-between px-3 pb-2 mb-1 border-b">
                <div className="text-sm font-medium">Notifications</div>
                {notifications.some(n => !n.read) && (
                  <button 
                    className="text-xs text-primary hover:underline flex items-center"
                    onClick={markAllNotificationsAsRead}
                  >
                    <Check className="h-3 w-3 mr-1" /> Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`relative p-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex justify-between items-baseline">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      {!notification.read && (
                        <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-primary"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-sm text-gray-500">
                    No notifications
                  </div>
                )}
              </div>
              <div className="px-3 pt-2 mt-1 border-t">
                <div className="flex justify-between">
                  <button className="text-sm text-primary hover:underline">
                    View all notifications
                  </button>
                  <button className="text-sm text-primary hover:underline">
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </Dropdown>

          <div className="flex items-center space-x-3 pl-5 border-l border-gray-200">
            <div className="text-right pr-2">
              <div className="text-sm font-medium">John Smith</div>
              <div className="text-xs text-gray-500">Admin</div>
            </div>
            <Dropdown
              trigger={
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
              }
              align="right"
              width={220}
            >
              <div className="py-2">
                <div className="px-4 py-3 border-b">
                  <div className="text-sm font-medium">John Smith</div>
                  <div className="text-xs text-gray-500">john.smith@example.com</div>
                </div>
                <div className="py-1">
                  <a 
                    href="/profile" 
                    className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <UserCircle className="h-4 w-4 mr-3 text-gray-500" />
                    Your Profile
                  </a>
                  <a 
                    href="/settings" 
                    className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-3 text-gray-500" />
                    Settings
                  </a>
                  <div className="border-t my-1"></div>
                  <button 
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Help Center Modal */}
      {showHelpCenter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Help Center</h2>
              <button 
                onClick={handleCloseModals}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <HelpCenter />
              <div className="mt-4 pt-4 border-t text-center">
                <button 
                  onClick={handleContactSupport}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Contact Support Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support Modal */}
      {showContactSupport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Contact Support</h2>
              <button 
                onClick={handleCloseModals}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <ContactSupport />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header; 