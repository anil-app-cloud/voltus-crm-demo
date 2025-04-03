const request = require('supertest');
const app = require('../server');
require('./mockUtils'); // This will set up the mocks
const { pool } = require('../database');

// Clean up resources
afterAll(done => {
  pool.end().then(() => done());
});

describe('Dashboard API', () => {
  // Test getting dashboard stats
  test('GET /api/dashboard/stats - Should get dashboard statistics', async () => {
    // Mock the database responses for various stats queries
    const mockStats = {
      id: 'stats1',
      total_customers: 10,
      total_orders: 20,
      total_revenue: 5000,
      pending_bookings: 5,
      updated_at: new Date().toISOString(),
      recent_activity: []
    };
    
    pool.query.mockResolvedValueOnce([[mockStats], []]); // Return stats directly

    const response = await request(app)
      .get('/api/dashboard/stats')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('total_customers');
    expect(response.body).toHaveProperty('total_orders');
    expect(response.body).toHaveProperty('total_revenue');
  });

  // Test getting financial summary
  test('GET /api/dashboard/financial-summary - Should get financial summary', async () => {
    // Mock the database response
    const mockSummary = { 
      total_revenue: 10000,
      paid_invoices: 5,
      pending_invoices: 3,
      overdue_invoices: 1
    };
    
    pool.query.mockResolvedValueOnce([[mockSummary], []]);

    const response = await request(app)
      .get('/api/dashboard/financial-summary')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('total_revenue');
    expect(response.body).toHaveProperty('paid_invoices');
  });

  // Test getting recent customers
  test('GET /api/dashboard/recent-customers - Should get recent customers', async () => {
    // Mock the database response
    const mockCustomers = [
      { id: 'c1', company_name: 'Company A', contact_person: 'John Doe', country: 'United States', created_at: '2023-01-01' },
      { id: 'c2', company_name: 'Company B', contact_person: 'Jane Smith', country: 'United States', created_at: '2023-01-02' },
      { id: 'c3', company_name: 'Company C', contact_person: 'Bob Johnson', country: 'United States', created_at: '2023-01-03' },
      { id: 'c4', company_name: 'Company D', contact_person: 'Alice Brown', country: 'United States', created_at: '2023-01-04' },
      { id: 'c5', company_name: 'Company E', contact_person: 'Charlie Green', country: 'United States', created_at: '2023-01-05' }
    ];
    pool.query.mockResolvedValueOnce([mockCustomers, []]);

    const response = await request(app)
      .get('/api/dashboard/recent-customers')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBe(5);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('company_name');
  });

  // Test getting recent bookings
  test('GET /api/dashboard/recent-bookings - Should get recent bookings', async () => {
    // Mock the database response
    const mockBookings = [
      { id: 'b1', origin: 'New York', destination: 'Los Angeles', customer_name: 'John Doe' },
      { id: 'b2', origin: 'Chicago', destination: 'Houston', customer_name: 'Jane Smith' },
      { id: 'b3', origin: 'Miami', destination: 'Seattle', customer_name: 'Bob Johnson' },
      { id: 'b4', origin: 'Boston', destination: 'Denver', customer_name: 'Alice Brown' }
    ];
    pool.query.mockResolvedValueOnce([mockBookings, []]);

    const response = await request(app)
      .get('/api/dashboard/recent-bookings')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBe(3);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('customer_name');
  });

  // Test updating dashboard stats
  test('POST /api/dashboard/stats - Should update dashboard stats', async () => {
    const statsData = {
      total_customers: 100,
      total_orders: 50,
      total_revenue: 15000,
      pending_bookings: 10
    };

    // Mock the database response for the upsert operation
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

    const response = await request(app)
      .post('/api/dashboard/stats')
      .send(statsData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('updated successfully');
  });

  // Test adding recent activity
  test('POST /api/dashboard/activity - Should add recent activity', async () => {
    const activityData = {
      type: 'customer',
      action: 'created',
      user: 'admin',
      timestamp: new Date().toISOString()
    };

    // Mock the database response for the insert operation
    pool.query.mockResolvedValueOnce([{ insertId: 'a1' }, []]);
    
    const mockActivity = {
      id: 'a1',
      ...activityData,
      message: 'Activity added successfully'
    };
    
    pool.query.mockResolvedValueOnce([[mockActivity], []]);

    const response = await request(app)
      .post('/api/dashboard/activity')
      .send(activityData)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'Activity added successfully');
  });
}); 