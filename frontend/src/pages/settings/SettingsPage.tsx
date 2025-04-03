import React, { useState, useEffect } from 'react';
import { Save, User, Building, BellRing, Shield, CreditCard, Mail, Phone, Globe, MapPin } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Textarea } from '../../components/ui/textarea';
import { getUserSettings, updateUserSettings } from '../../lib/api';
import axios from 'axios';

// Helper function to check if an error is an axios cancellation error
const isCancelError = (error: any): boolean => {
  return axios.isCancel(error) || 
    (error && error.message === 'Request cancelled - duplicate in flight') ||
    (error && error.code === 'ERR_CANCELED');
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [userSettings, setUserSettings] = useState({
    theme: 'light',
    notifications: true,
    emailAlerts: true,
    language: 'en',
    timezone: 'America/New_York',
    dashboardLayout: 'default'
  });
  const [settingsChanged, setSettingsChanged] = useState(false);
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getUserSettings();
        setUserSettings(settings);
      } catch (error) {
        // Only log non-cancellation errors
        if (!isCancelError(error)) {
          console.error('Error fetching user settings:', error);
        }
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleSettingChange = (setting: string, value: any) => {
    setUserSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    setSettingsChanged(true);
  };
  
  const handleSave = async () => {
    setSaving(true);
    try {
      // Save using API
      await updateUserSettings(userSettings);
      setSettingsChanged(false);
      // Show success message
      window.alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      window.alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-3xl">
            <TabsTrigger value="profile" onClick={() => setActiveTab('profile')}>
              <User className="mr-2 h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="company" onClick={() => setActiveTab('company')}>
              <Building className="mr-2 h-4 w-4" /> Company
            </TabsTrigger>
            <TabsTrigger value="notifications" onClick={() => setActiveTab('notifications')}>
              <BellRing className="mr-2 h-4 w-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="security" onClick={() => setActiveTab('security')}>
              <Shield className="mr-2 h-4 w-4" /> Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/3 space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input defaultValue="John" />
                  </div>
                  <div className="w-full md:w-1/3 space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input defaultValue="Doe" />
                  </div>
                  <div className="w-full md:w-1/3 space-y-2">
                    <label className="text-sm font-medium">Job Title</label>
                    <Input defaultValue="Logistics Manager" />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2 space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                        <Mail className="h-4 w-4" />
                      </span>
                      <Input className="rounded-l-none" defaultValue="john.doe@example.com" />
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                        <Phone className="h-4 w-4" />
                      </span>
                      <Input className="rounded-l-none" defaultValue="+1 (555) 123-4567" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Biography</label>
                  <Textarea defaultValue="Experienced logistics professional with over 8 years in the freight forwarding industry. Specialized in international shipping and supply chain optimization." rows={4} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                    <img src="https://randomuser.me/api/portraits/men/42.jpg" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" onClick={() => window.alert('Choose a file to upload')}>Choose File</Button>
                    <p className="text-sm text-muted-foreground">Recommended dimensions: 200x200px. Max file size: 5MB.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input defaultValue="WorldZone Logistics Inc." />
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2 space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                        <Globe className="h-4 w-4" />
                      </span>
                      <Input className="rounded-l-none" defaultValue="https://worldzonelogistics.com" />
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 space-y-2">
                    <label className="text-sm font-medium">Industry</label>
                    <Input defaultValue="Logistics & Supply Chain" />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/3 space-y-2">
                    <label className="text-sm font-medium">Tax ID / VAT Number</label>
                    <Input defaultValue="US123456789" />
                  </div>
                  <div className="w-full md:w-1/3 space-y-2">
                    <label className="text-sm font-medium">Registration Number</label>
                    <Input defaultValue="REG-987654321" />
                  </div>
                  <div className="w-full md:w-1/3 space-y-2">
                    <label className="text-sm font-medium">Founded Year</label>
                    <Input defaultValue="2005" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Street Address</label>
                  <Input defaultValue="123 Shipping Lane" />
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2 space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Input defaultValue="Portland" />
                  </div>
                  <div className="w-full md:w-1/4 space-y-2">
                    <label className="text-sm font-medium">State/Province</label>
                    <Input defaultValue="Oregon" />
                  </div>
                  <div className="w-full md:w-1/4 space-y-2">
                    <label className="text-sm font-medium">Zip/Postal Code</label>
                    <Input defaultValue="97201" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <Input defaultValue="United States" />
                </div>
                <div className="pt-2">
                  <Button variant="outline" onClick={() => window.alert('Address verified successfully!')}>
                    <MapPin className="mr-2 h-4 w-4" /> Verify Address
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Logo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <div className="w-32 h-32 rounded bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                    <img src="https://placehold.co/300x300/e2e8f0/64748b?text=Logo" alt="Company Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" onClick={() => window.alert('Choose a file to upload')}>Choose File</Button>
                    <p className="text-sm text-muted-foreground">Recommended dimensions: 300x300px. Max file size: 10MB.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="email-orders" defaultChecked />
                  <label htmlFor="email-orders" className="text-sm font-medium">New bookings and orders</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="email-status" defaultChecked />
                  <label htmlFor="email-status" className="text-sm font-medium">Shipment status updates</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="email-invoices" defaultChecked />
                  <label htmlFor="email-invoices" className="text-sm font-medium">New invoices</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="email-payments" defaultChecked />
                  <label htmlFor="email-payments" className="text-sm font-medium">Payment confirmations</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="email-system" defaultChecked />
                  <label htmlFor="email-system" className="text-sm font-medium">System alerts</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="email-marketing" />
                  <label htmlFor="email-marketing" className="text-sm font-medium">Marketing and promotional messages</label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SMS Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="sms-orders" />
                  <label htmlFor="sms-orders" className="text-sm font-medium">New bookings and orders</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sms-status" defaultChecked />
                  <label htmlFor="sms-status" className="text-sm font-medium">Shipment status updates</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sms-delivery" defaultChecked />
                  <label htmlFor="sms-delivery" className="text-sm font-medium">Delivery notifications</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sms-urgent" defaultChecked />
                  <label htmlFor="sms-urgent" className="text-sm font-medium">Urgent alerts</label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Frequency</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="immediate">Immediate</option>
                    <option value="hourly">Hourly Digest</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Digest</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quiet Hours (No SMS)</label>
                  <div className="flex space-x-4">
                    <div className="w-1/2">
                      <Input type="time" defaultValue="22:00" />
                    </div>
                    <div className="w-1/2">
                      <Input type="time" defaultValue="07:00" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input type="password" />
                </div>
                <div className="pt-2">
                  <Button>Update Password</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Two-factor authentication is enabled</h3>
                    <p className="text-sm text-muted-foreground">Your account is secured with authenticator app.</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Recovery Codes</h3>
                  <p className="text-sm text-muted-foreground mb-4">Recovery codes can be used to access your account in the event you lose access to your device.</p>
                  <Button variant="outline">View Recovery Codes</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Windows PC - Chrome</h3>
                      <p className="text-sm text-muted-foreground">Portland, USA · Current session</p>
                    </div>
                    <Button variant="ghost" disabled>Active</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">MacBook Pro - Safari</h3>
                      <p className="text-sm text-muted-foreground">Portland, USA · Last active 2 days ago</p>
                    </div>
                    <Button variant="outline" size="sm">Sign Out</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">iPhone 12 - Safari</h3>
                      <p className="text-sm text-muted-foreground">Seattle, USA · Last active 5 days ago</p>
                    </div>
                    <Button variant="outline" size="sm">Sign Out</Button>
                  </div>
                </div>
                <div className="pt-2">
                  <Button variant="destructive">Sign Out All Other Sessions</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">API Key</h3>
                      <p className="text-sm text-muted-foreground">For developers to access the WorldZone API</p>
                    </div>
                    <Button variant="outline">Generate API Key</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage; 