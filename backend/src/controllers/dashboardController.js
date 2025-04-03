const { pool, executeWithRetry } = require('../config/database');

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    // Get basic stats
    const [dashboardStats] = await pool.query('SELECT * FROM dashboard_stats ORDER BY updated_at DESC LIMIT 1');
    
    // Get recent activity
    const [recentActivity] = await pool.query('SELECT * FROM recent_activities ORDER BY timestamp DESC LIMIT 10');
    
    // Calculate transport modes from orders
    const [transportModes] = await pool.query(`
      SELECT transport_mode, COUNT(*) as count 
      FROM orders 
      GROUP BY transport_mode
    `);
    
    // Calculate total orders for percentage calculation
    const [totalOrdersResult] = await pool.query('SELECT COUNT(*) as total FROM orders');
    const totalOrders = totalOrdersResult[0]?.total || 0;
    
    // Transform transport modes data for frontend
    const formattedTransportModes = transportModes.map(mode => ({
      mode: mode.transport_mode.charAt(0).toUpperCase() + mode.transport_mode.slice(1),
      percentage: totalOrders > 0 ? Math.round((mode.count / totalOrders) * 100) : 0
    }));
    
    // Get top destinations from orders
    const [topDestinations] = await pool.query(`
      SELECT destination, COUNT(*) as count 
      FROM orders 
      GROUP BY destination 
      ORDER BY count DESC
      LIMIT 5
    `);
    
    const formattedDestinations = topDestinations.map(dest => ({
      name: dest.destination,
      count: dest.count
    }));
    
    // Combine all data
    const stats = {
      ...(dashboardStats[0] || {}),
      recentActivity,
      transportModes: formattedTransportModes.length > 0 ? formattedTransportModes : [
        { mode: 'Sea', percentage: 65 },
        { mode: 'Air', percentage: 25 },
        { mode: 'Road', percentage: 8 },
        { mode: 'Rail', percentage: 2 }
      ],
      topDestinations: formattedDestinations.length > 0 ? formattedDestinations : [
        { name: 'United States', count: 142 },
        { name: 'China', count: 89 },
        { name: 'Germany', count: 65 },
        { name: 'United Kingdom', count: 52 },
        { name: 'Australia', count: 47 }
      ]
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

// Get financial summary
const getFinancialSummary = async (req, res) => {
  try {
    // Get total revenue from invoices
    const [revenueResult] = await executeWithRetry(async () => await pool.query('SELECT SUM(total_amount) as total_revenue FROM invoices'));
    
    // Get invoice counts by status
    const [invoiceStatusCounts] = await executeWithRetry(async () => await pool.query(`
      SELECT 
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_invoices,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_invoices,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_invoices
      FROM invoices
    `));
    
    const financialSummary = {
      total_revenue: revenueResult[0].total_revenue || 0,
      paid_invoices: invoiceStatusCounts[0].paid_invoices || 0,
      pending_invoices: invoiceStatusCounts[0].pending_invoices || 0,
      overdue_invoices: invoiceStatusCounts[0].overdue_invoices || 0
    };
    
    res.json(financialSummary);
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({ message: 'Error fetching financial summary' });
  }
};

// Get recent customers
const getRecentCustomers = async (req, res) => {
  try {
    const [rows] = await executeWithRetry(async () => await pool.query('SELECT * FROM customers ORDER BY created_at DESC LIMIT 5'));
    
    // Make sure IDs are in the expected format for the frontend
    const customers = rows.map(customer => {
      // If ID is numeric or starts with 'c', keep as is
      return customer;
    });
    
    res.json(customers);
  } catch (error) {
    console.error('Error fetching recent customers:', error);
    res.status(500).json({ message: 'Error fetching recent customers' });
  }
};

// Get recent bookings
const getRecentBookings = async (req, res) => {
  try {
    const [rows] = await executeWithRetry(async () => await pool.query(`
      SELECT b.*, c.company_name as customer_name 
      FROM bookings b 
      JOIN customers c ON b.customer_id = c.id 
      ORDER BY b.created_at DESC 
      LIMIT 5
    `));
    res.json(rows);
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({ message: 'Error fetching recent bookings' });
  }
};

// Update dashboard stats
const updateDashboardStats = async (req, res) => {
  const { total_customers, total_orders, total_revenue, pending_bookings } = req.body;
  
  try {
    const [rows] = await executeWithRetry(async () => await pool.query('SELECT * FROM dashboard_stats LIMIT 1'));
    
    if (rows.length === 0) {
      // Insert new stats
      await executeWithRetry(async () => await pool.query(
        'INSERT INTO dashboard_stats (id, total_customers, total_orders, total_revenue, pending_bookings) VALUES (UUID(), ?, ?, ?, ?)',
        [total_customers, total_orders, total_revenue, pending_bookings]
      ));
    } else {
      // Update existing stats
      await executeWithRetry(async () => await pool.query(
        'UPDATE dashboard_stats SET total_customers = ?, total_orders = ?, total_revenue = ?, pending_bookings = ? WHERE id = ?',
        [total_customers, total_orders, total_revenue, pending_bookings, rows[0].id]
      ));
    }
    
    res.json({ message: 'Dashboard stats updated successfully' });
  } catch (error) {
    console.error('Error updating dashboard stats:', error);
    res.status(500).json({ message: 'Error updating dashboard stats' });
  }
};

// Add recent activity
const addRecentActivity = async (req, res) => {
  try {
    const { type, action, user, timestamp } = req.body;
    
    if (!type || !action || !user) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    await executeWithRetry(async () => await pool.query(
      'INSERT INTO recent_activities (id, type, action, user, timestamp) VALUES (UUID(), ?, ?, ?, ?)',
      [type, action, user, timestamp || new Date().toISOString()]
    ));

    res.status(201).json({ message: 'Activity added successfully' });
  } catch (error) {
    console.error('Error adding recent activity:', error);
    res.status(500).json({ error: 'Failed to add activity' });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    // In a real app, this would use the authenticated user's ID
    // For this example, we'll get or create a user with ID 1
    const [userRows] = await executeWithRetry(async () => await pool.query('SELECT * FROM users WHERE id = 1'));
    
    let userData;
    if (userRows.length === 0) {
      // If no user exists, create one
      const now = new Date().toISOString();
      const defaultUser = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        role: 'admin',
        title: 'Logistics Manager',
        phone: '+1 (555) 123-4567',
        created_at: now,
        last_login: now,
        avatar: 'https://randomuser.me/api/portraits/men/42.jpg'
      };
      
      await executeWithRetry(async () => await pool.query(
        `INSERT INTO users (id, first_name, last_name, email, role, title, phone, created_at, last_login, avatar)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          defaultUser.first_name,
          defaultUser.last_name,
          defaultUser.email,
          defaultUser.role,
          defaultUser.title,
          defaultUser.phone,
          defaultUser.created_at,
          defaultUser.last_login,
          defaultUser.avatar
        ]
      ));
      
      userData = {
        id: 1,
        ...defaultUser
      };
    } else {
      userData = userRows[0];
    }
    
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

module.exports = {
  getDashboardStats,
  getFinancialSummary,
  getRecentCustomers,
  getRecentBookings,
  updateDashboardStats,
  addRecentActivity,
  getUserProfile
}; 