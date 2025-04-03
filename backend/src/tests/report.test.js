const request = require('supertest');
const app = require('../server');
require('./mockUtils'); // This will set up the mocks
const { pool } = require('../database');

// Clean up resources
afterAll(done => {
  pool.end().then(() => done());
});

describe('Report API', () => {
  // Test getting financial reports
  test('GET /api/reports/financial - Should get financial reports', async () => {
    // Mock database responses for financial reports
    const mockData = [
      { amount: 1000, date: '2023-01-01' }
    ];
    
    const mockSummary = {
      totalRevenue: 5000,
      paidInvoices: 10,
      pendingInvoices: 5,
      overdueInvoices: 2
    };
    
    pool.query
      .mockResolvedValueOnce([mockData, []]) // Financial data
      .mockResolvedValueOnce([[mockSummary], []]); // Summary data

    const response = await request(app)
      .get('/api/reports/financial')
      .query({ period: 'month' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('summary');
  });

  // Test getting financial reports with different periods
  test('GET /api/reports/financial with different periods', async () => {
    const periods = ['week', 'month', 'quarter', 'year'];
    
    for (const period of periods) {
      // Reset mock for each period
      const mockData = [
        { amount: 1000, date: '2023-01-01' }
      ];
      
      const mockSummary = {
        totalRevenue: 5000,
        paidInvoices: 10,
        pendingInvoices: 5,
        overdueInvoices: 2
      };
      
      pool.query
        .mockResolvedValueOnce([mockData, []]) // Financial data
        .mockResolvedValueOnce([[mockSummary], []]); // Summary data

      const response = await request(app)
        .get('/api/reports/financial')
        .query({ period })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('summary');
    }
  });

  // Test getting shipping reports
  test('GET /api/reports/shipping - Should get shipping reports', async () => {
    // Mock database responses for shipping reports
    const mockTransportModes = [
      { transport_mode: 'air', count: 5 }, 
      { transport_mode: 'sea', count: 3 }
    ];
    
    const mockRoutes = [
      { origin: 'New York', destination: 'Los Angeles', count: 4 }
    ];
    
    const mockStatusDistribution = [
      { status: 'pending', count: 3 }, 
      { status: 'completed', count: 7 }
    ];
    
    pool.query
      .mockResolvedValueOnce([mockTransportModes, []]) // Transport modes
      .mockResolvedValueOnce([mockRoutes, []]) // Routes
      .mockResolvedValueOnce([mockStatusDistribution, []]); // Status distribution

    const response = await request(app)
      .get('/api/reports/shipping')
      .query({ period: 'month' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('transport_mode');
    expect(response.body).toHaveProperty('routes');
    expect(response.body).toHaveProperty('status');
    expect(Array.isArray(response.body.transport_mode)).toBeTruthy();
    expect(Array.isArray(response.body.routes)).toBeTruthy();
    expect(Array.isArray(response.body.status)).toBeTruthy();
  });

  // Test getting shipping reports with different periods
  test('GET /api/reports/shipping with different periods', async () => {
    const periods = ['week', 'month', 'quarter', 'year'];
    
    for (const period of periods) {
      // Reset mock for each period
      const mockTransportModes = [
        { transport_mode: 'air', count: 5 }, 
        { transport_mode: 'sea', count: 3 }
      ];
      
      const mockRoutes = [
        { origin: 'New York', destination: 'Los Angeles', count: 4 }
      ];
      
      const mockStatusDistribution = [
        { status: 'pending', count: 3 }, 
        { status: 'completed', count: 7 }
      ];
      
      pool.query
        .mockResolvedValueOnce([mockTransportModes, []]) // Transport modes
        .mockResolvedValueOnce([mockRoutes, []]) // Routes
        .mockResolvedValueOnce([mockStatusDistribution, []]); // Status distribution

      const response = await request(app)
        .get('/api/reports/shipping')
        .query({ period })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('transport_mode');
      expect(response.body).toHaveProperty('routes');
      expect(response.body).toHaveProperty('status');
    }
  });

  // Test getting customer reports
  test('GET /api/reports/customers - Should get customer reports', async () => {
    // Mock database responses for customer reports
    const mockTopCustomers = [
      { id: 'c1', company_name: 'Company A', revenue: 5000 }, 
      { id: 'c2', company_name: 'Company B', revenue: 3000 }
    ];
    
    const mockAcquisition = [
      { month: 'January', count: 5 }, 
      { month: 'February', count: 7 }
    ];
    
    const mockStatusDistribution = [
      { status: 'active', count: 15 }, 
      { status: 'inactive', count: 3 }
    ];
    
    pool.query
      .mockResolvedValueOnce([mockTopCustomers, []]) // Top customers
      .mockResolvedValueOnce([mockAcquisition, []]) // Customer acquisition
      .mockResolvedValueOnce([mockStatusDistribution, []]); // Status distribution

    const response = await request(app)
      .get('/api/reports/customers')
      .query({ period: 'month' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('topCustomers');
    expect(response.body).toHaveProperty('customerAcquisition');
    expect(response.body).toHaveProperty('statusDistribution');
    expect(Array.isArray(response.body.topCustomers)).toBeTruthy();
    expect(Array.isArray(response.body.customerAcquisition)).toBeTruthy();
    expect(Array.isArray(response.body.statusDistribution)).toBeTruthy();
  });

  // Test getting customer reports with different periods
  test('GET /api/reports/customers with different periods', async () => {
    const periods = ['week', 'month', 'quarter', 'year'];
    
    for (const period of periods) {
      // Reset mock for each period
      const mockTopCustomers = [
        { id: 'c1', company_name: 'Company A', revenue: 5000 }, 
        { id: 'c2', company_name: 'Company B', revenue: 3000 }
      ];
      
      const mockAcquisition = [
        { month: 'January', count: 5 }, 
        { month: 'February', count: 7 }
      ];
      
      const mockStatusDistribution = [
        { status: 'active', count: 15 }, 
        { status: 'inactive', count: 3 }
      ];
      
      pool.query
        .mockResolvedValueOnce([mockTopCustomers, []]) // Top customers
        .mockResolvedValueOnce([mockAcquisition, []]) // Customer acquisition
        .mockResolvedValueOnce([mockStatusDistribution, []]); // Status distribution

      const response = await request(app)
        .get('/api/reports/customers')
        .query({ period })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('topCustomers');
      expect(response.body).toHaveProperty('customerAcquisition');
      expect(response.body).toHaveProperty('statusDistribution');
    }
  });
}); 