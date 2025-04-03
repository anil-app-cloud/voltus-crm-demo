const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// GET all invoices
router.get('/', invoiceController.getAllInvoices);

// GET invoice by ID
router.get('/:id', invoiceController.getInvoiceById);

// POST create new invoice
router.post('/', invoiceController.createInvoice);

// PUT update invoice
router.put('/:id', invoiceController.updateInvoice);

// DELETE invoice
router.delete('/:id', invoiceController.deleteInvoice);

// PATCH update invoice status
router.patch('/:id', invoiceController.updateInvoiceStatus);

module.exports = router; 