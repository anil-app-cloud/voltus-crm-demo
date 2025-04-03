const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// GET all customers
router.get('/', customerController.getAllCustomers);

// GET customer by ID
router.get('/:id', customerController.getCustomerById);

// POST create new customer
router.post('/', customerController.createCustomer);

// PUT update customer
router.put('/:id', customerController.updateCustomer);

// DELETE customer
router.delete('/:id', customerController.deleteCustomer);

// GET customer contacts
router.get('/:id/contacts', customerController.getCustomerContacts);

// GET customer orders
router.get('/:id/orders', customerController.getCustomerOrders);

// GET customer communications
router.get('/:id/communications', customerController.getCustomerCommunications);

// GET customer booking enquiries
router.get('/:id/booking-enquiries', customerController.getCustomerBookingEnquiries);

// GET customer activities
router.get('/:id/activities', customerController.getCustomerActivities);

// GET customer financial summary
router.get('/:id/financial-summary', customerController.getCustomerFinancialSummary);

// GET customer invoices
router.get('/:id/invoices', customerController.getCustomerInvoices);

// GET customer details (all data for the details page)
router.get('/:id/details', customerController.getCustomerDetails);

// GET communications
router.get('/communications', customerController.getCustomerCommunications);

module.exports = router; 