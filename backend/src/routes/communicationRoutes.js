const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// GET all communications
router.get('/', customerController.getAllCommunications);

// GET communication by ID
router.get('/:id', customerController.getCommunicationById);

// GET customer communications
router.get('/customer/:id', customerController.getCustomerCommunications);

// POST create new communication
router.post('/', customerController.createCommunication);

// PUT update communication
router.put('/:id', customerController.updateCommunication);

// DELETE communication
router.delete('/:id', customerController.deleteCommunication);

module.exports = router; 