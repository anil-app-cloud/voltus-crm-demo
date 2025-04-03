const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// GET financial reports
router.get('/financial', reportController.getFinancialReports);

// GET shipping reports
router.get('/shipping', reportController.getShippingReports);

// GET customer reports
router.get('/customers', reportController.getCustomerReports);

module.exports = router; 