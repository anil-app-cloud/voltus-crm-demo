const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET dashboard stats
router.get('/stats', dashboardController.getDashboardStats);

// GET financial summary
router.get('/financial-summary', dashboardController.getFinancialSummary);

// GET recent customers
router.get('/recent-customers', dashboardController.getRecentCustomers);

// GET recent bookings
router.get('/recent-bookings', dashboardController.getRecentBookings);

// GET user profile
router.get('/user-profile', dashboardController.getUserProfile);

// POST update dashboard stats
router.post('/stats', dashboardController.updateDashboardStats);

// POST add recent activity
router.post('/activity', dashboardController.addRecentActivity);

module.exports = router; 