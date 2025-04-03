const { pool, executeWithRetry } = require('../config/database');

// Get financial reports
const getFinancialReports = async (req, res) => {
  const { period = 'month' } = req.query;
  
  try {
    let query = '';
    
    if (period === 'week') {
      query = `
        SELECT 
          DATE_FORMAT(issue_date, '%Y-%m-%d') as date,
          COALESCE(SUM(total_amount), 0) as total,
          COUNT(*) as count
        FROM invoices
        WHERE issue_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE_FORMAT(issue_date, '%Y-%m-%d')
        ORDER BY date ASC
      `;
    } else if (period === 'month') {
      query = `
        SELECT 
          DATE_FORMAT(issue_date, '%Y-%m-%d') as date,
          COALESCE(SUM(total_amount), 0) as total,
          COUNT(*) as count
        FROM invoices
        WHERE issue_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE_FORMAT(issue_date, '%Y-%m-%d')
        ORDER BY date ASC
      `;
    } else if (period === 'quarter') {
      query = `
        SELECT 
          DATE_FORMAT(issue_date, '%Y-%m') as date,
          COALESCE(SUM(total_amount), 0) as total,
          COUNT(*) as count
        FROM invoices
        WHERE issue_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
        GROUP BY DATE_FORMAT(issue_date, '%Y-%m')
        ORDER BY date ASC
      `;
    } else if (period === 'year') {
      query = `
        SELECT 
          DATE_FORMAT(issue_date, '%Y-%m') as date,
          COALESCE(SUM(total_amount), 0) as total,
          COUNT(*) as count
        FROM invoices
        WHERE issue_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
        GROUP BY DATE_FORMAT(issue_date, '%Y-%m')
        ORDER BY date ASC
      `;
    } else {
      return res.status(400).json({ message: 'Invalid period parameter' });
    }
    
    const [rows] = await executeWithRetry(() => pool.query(query)) || [[]];
    
    // Also get summary statistics
    const [[totalRevenue]] = await executeWithRetry(() => pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices')) || [[{ total: 0 }]];
    const [[paidInvoices]] = await executeWithRetry(() => pool.query('SELECT COUNT(*) as count FROM invoices WHERE status = "paid"')) || [[{ count: 0 }]];
    const [[pendingInvoices]] = await executeWithRetry(() => pool.query('SELECT COUNT(*) as count FROM invoices WHERE status = "due" OR status = "due_soon"')) || [[{ count: 0 }]];
    const [[overdueInvoices]] = await executeWithRetry(() => pool.query('SELECT COUNT(*) as count FROM invoices WHERE status = "overdue"')) || [[{ count: 0 }]];
    
    res.json({
      data: rows || [],
      summary: {
        total_revenue: totalRevenue.total || 0,
        paid_invoices: paidInvoices.count || 0,
        pending_invoices: pendingInvoices.count || 0,
        overdue_invoices: overdueInvoices.count || 0
      }
    });
  } catch (error) {
    console.error('Error generating financial reports:', error);
    res.status(500).json({ message: 'Error generating financial reports', error: error.message });
  }
};

// Get shipping reports
const getShippingReports = async (req, res) => {
  const { period = 'month' } = req.query;
  
  try {
    let query = '';
    
    if (period === 'week') {
      query = `
        SELECT 
          transport_mode,
          COUNT(*) as count
        FROM bookings
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY transport_mode
      `;
    } else if (period === 'month') {
      query = `
        SELECT 
          transport_mode,
          COUNT(*) as count
        FROM bookings
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY transport_mode
      `;
    } else if (period === 'quarter') {
      query = `
        SELECT 
          transport_mode,
          COUNT(*) as count
        FROM bookings
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
        GROUP BY transport_mode
      `;
    } else if (period === 'year') {
      query = `
        SELECT 
          transport_mode,
          COUNT(*) as count
        FROM bookings
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
        GROUP BY transport_mode
      `;
    } else {
      return res.status(400).json({ message: 'Invalid period parameter' });
    }
    
    const [transportMode] = await executeWithRetry(() => pool.query(query)) || [[]];
    
    // Get origin-destination pairs
    const [routes] = await executeWithRetry(() => pool.query(`
      SELECT 
        COALESCE(origin, 'Unknown') as origin,
        COALESCE(destination, 'Unknown') as destination,
        COUNT(*) as count
      FROM bookings
      WHERE origin IS NOT NULL AND destination IS NOT NULL
      GROUP BY origin, destination
      ORDER BY count DESC
      LIMIT 10
    `)) || [[]];
    
    // Get status distribution
    const [statusDistribution] = await executeWithRetry(() => pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM bookings
      GROUP BY status
    `)) || [[]];
    
    res.json({
      transport_mode: transportMode || [],
      routes: routes || [],
      status: statusDistribution || []
    });
  } catch (error) {
    console.error('Error generating shipping reports:', error);
    res.status(500).json({ message: 'Error generating shipping reports', error: error.message });
  }
};

// Get customer reports
const getCustomerReports = async (req, res) => {
  try {
    // Get top customers by revenue
    const [topCustomers] = await executeWithRetry(() => pool.query(`
      SELECT 
        c.id,
        c.company_name,
        c.contact_person,
        COALESCE(SUM(i.total_amount), 0) as total_revenue,
        COUNT(i.id) as invoice_count
      FROM customers c
      LEFT JOIN invoices i ON c.id = i.customer_id
      GROUP BY c.id
      ORDER BY total_revenue DESC
      LIMIT 10
    `)) || [[]];
    
    // Get customer acquisition over time
    const [customerAcquisition] = await executeWithRetry(() => pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM customers
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `)) || [[]];
    
    // Get customer status distribution
    const [statusDistribution] = await executeWithRetry(() => pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM customers
      GROUP BY status
    `)) || [[]];
    
    res.json({
      topCustomers: topCustomers || [],
      customerAcquisition: customerAcquisition || [],
      statusDistribution: statusDistribution || []
    });
  } catch (error) {
    console.error('Error generating customer reports:', error);
    res.status(500).json({ message: 'Error generating customer reports', error: error.message });
  }
};

module.exports = {
  getFinancialReports,
  getShippingReports,
  getCustomerReports
}; 