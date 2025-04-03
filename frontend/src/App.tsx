import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/dashboard/DashboardPage';
import BookingsPage from './pages/bookings/BookingsPage';
import BookingDetailsPage from './pages/bookings/BookingDetailsPage';
import CommunicationsPage from './pages/communications/CommunicationsPage';
import ReportsPage from './pages/reports/ReportsPage';
import InvoicesPage from './pages/invoices/InvoicesPage';
import SettingsPage from './pages/settings/SettingsPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import ProfilePage from './pages/profile/ProfilePage';
import { ThemeProvider } from './lib/theme';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="voltus-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/bookings/:id" element={<BookingDetailsPage />} />
          <Route path="/communications" element={<CommunicationsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/customers/:id" element={<CustomerDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 