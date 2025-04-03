require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { closePool } = require('./config/database');
const customerRoutes = require('./routes/customerRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/settings', settingsRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Only start the server if this file is run directly
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    
    // Close the HTTP server first to stop accepting new connections
    server.close(() => {
      console.log('HTTP server closed');
      
      // Then close database connections
      closePool().then(() => {
        console.log('All connections closed. Exiting process.');
        process.exit(0);
      }).catch(err => {
        console.error('Error during shutdown:', err);
        process.exit(1);
      });
    });

    // Force close after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      console.error('Forcing server shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  // Register signal handlers
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app; 