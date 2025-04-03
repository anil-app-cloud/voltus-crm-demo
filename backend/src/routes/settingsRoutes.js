const express = require('express');
const router = express.Router();

// GET user settings
router.get('/user', (req, res) => {
  try {
    // Return demo user settings
    res.json({
      user: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        jobTitle: 'Sales Manager',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        timezone: 'America/New_York'
      },
      company: {
        name: 'Acme Logistics',
        website: 'www.acmelogistics.com',
        industry: 'Transportation',
        taxId: 'US123456789',
        regNumber: 'B12345',
        foundedYear: 2010,
        address: {
          street: '123 Commerce St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA'
        }
      },
      interface: {
        theme: 'light',
        language: 'en',
        compactMode: false,
        tableRows: 10,
        dateFormat: 'MM/DD/YYYY'
      },
      notifications: {
        email: {
          newCustomer: true,
          newOrder: true,
          orderStatus: true,
          paymentReceived: true,
          invoiceDue: true,
          systemUpdates: false
        },
        sms: {
          newOrder: true,
          orderStatus: false,
          paymentReceived: false
        },
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '07:00'
        }
      },
      dashboard: {
        showRevenue: true,
        showBookings: true,
        showCustomers: true,
        layout: 'default'
      },
      security: {
        twoFactorEnabled: true,
        lastPasswordChange: '2023-12-15T00:00:00.000Z',
        sessions: [
          {
            device: 'Chrome on Windows',
            location: 'New York, USA',
            lastActive: '2024-03-28T14:35:22.000Z'
          },
          {
            device: 'Mobile App on iOS',
            location: 'Boston, USA',
            lastActive: '2024-03-27T18:12:45.000Z'
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user settings'
    });
  }
});

module.exports = router; 