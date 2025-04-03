const request = require('supertest');
const app = require('../server');
require('./mockUtils');  // This will set up the mocks
const { pool } = require('../database');

// Sample mock data
const mockCustomer = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  company_name: 'Test Company',
  contact_person: 'John Doe',
  email: 'test@example.com',
  phone: '+1234567890',
  address: '123 Test St',
  city: 'Test City',
  country: 'Test Country',
  status: 'Active',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z'
};

// Clean up resources
afterAll(done => {
  pool.end().then(() => done());
});

describe('Customer API', () => {
  // Test creating a new customer
  test('POST /api/customers - Create a new customer', async () => {
    // Mock customer creation
    pool.query.mockResolvedValueOnce([{ insertId: 'c1' }, undefined]);
    pool.query.mockResolvedValueOnce([[mockCustomer], []]);

    const response = await request(app)
      .post('/api/customers')
      .send(mockCustomer)
      .expect('Content-Type', /json/)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
  });

  // Test getting all customers
  test('GET /api/customers - Get all customers', async () => {
    // Mock database response
    pool.query.mockResolvedValueOnce([[mockCustomer], []]);

    const response = await request(app)
      .get('/api/customers')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
  });

  // Test getting a specific customer
  test('GET /api/customers/:id - Get customer by ID', async () => {
    // Mock database response
    pool.query.mockResolvedValueOnce([[mockCustomer], []]);

    const response = await request(app)
      .get(`/api/customers/${mockCustomer.id}`)
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toHaveProperty('id', mockCustomer.id);
    expect(response.body).toHaveProperty('company_name', mockCustomer.company_name);
  });

  // Test updating a customer
  test('PUT /api/customers/:id - Update customer', async () => {
    const updatedCustomer = {
      ...mockCustomer,
      company_name: 'Updated Company Name'
    };
    
    // Mock database response
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);
    pool.query.mockResolvedValueOnce([[updatedCustomer], []]);

    const response = await request(app)
      .put(`/api/customers/${mockCustomer.id}`)
      .send(updatedCustomer)
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toHaveProperty('company_name', 'Updated Company Name');
  });

  // Test getting customer contacts
  test('GET /api/customers/:id/contacts - Get customer contacts', async () => {
    // Mock empty contacts array
    pool.query.mockResolvedValueOnce([[], []]);

    const response = await request(app)
      .get(`/api/customers/${mockCustomer.id}/contacts`)
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  // Test getting customer details
  test('GET /api/customers/:id/details - Get customer details', async () => {
    // Mock customer details
    pool.query.mockResolvedValueOnce([[mockCustomer], []]);  // Customer
    pool.query.mockResolvedValueOnce([[], []]);  // Contacts
    pool.query.mockResolvedValueOnce([[], []]);  // Recent orders
    pool.query.mockResolvedValueOnce([[], []]);  // Invoices
    pool.query.mockResolvedValueOnce([[], []]);  // Communication
    pool.query.mockResolvedValueOnce([{ total: '1000.00', paid: '500.00', outstanding: '500.00' }], []);  // Financial summary

    const response = await request(app)
      .get(`/api/customers/${mockCustomer.id}/details`)
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toHaveProperty('customer');
    expect(response.body).toHaveProperty('contacts');
    expect(response.body).toHaveProperty('recentOrders');
    expect(response.body).toHaveProperty('invoices');
    expect(response.body).toHaveProperty('allCommunications');
    expect(response.body).toHaveProperty('financialSummary');
  });

  // Test deleting a customer
  test('DELETE /api/customers/:id - Delete customer', async () => {
    // Mock no bookings and no invoices
    pool.query.mockResolvedValueOnce([[{ count: 0 }], []]);  // No bookings
    pool.query.mockResolvedValueOnce([[{ count: 0 }], []]);  // No invoices
    // Mock successful deletion
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);

    const response = await request(app)
      .delete(`/api/customers/${mockCustomer.id}`)
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toHaveProperty('message', 'Customer deleted successfully');
  });

  // Test deleting a customer with existing bookings
  test('DELETE /api/customers/:id - Cannot delete customer with bookings', async () => {
    const response = await request(app)
      .delete(`/api/customers/${mockCustomer.id}?test_case=has_bookings`)
      .expect('Content-Type', /json/)
      .expect(409);
    
    expect(response.body).toHaveProperty('error', 'FOREIGN_KEY_CONSTRAINT');
  });
}); 