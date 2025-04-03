const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
  test('GET /api/dashboard/stats returns dashboard statistics', async () => {
    const response = await request(app).get('/api/dashboard/stats');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('total_customers');
    expect(response.body).toHaveProperty('total_orders');
    expect(response.body).toHaveProperty('total_revenue');
    expect(response.body).toHaveProperty('pending_bookings');
    expect(response.body).toHaveProperty('recent_activity');
  });

  test('GET /api/dashboard/financial-summary returns financial data', async () => {
    const response = await request(app).get('/api/dashboard/financial-summary');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('total_revenue');
    expect(response.body).toHaveProperty('paid_invoices');
    expect(response.body).toHaveProperty('pending_invoices');
    expect(response.body).toHaveProperty('overdue_invoices');
  });

  test('GET /api/dashboard/recent-customers returns customer data', async () => {
    const response = await request(app).get('/api/dashboard/recent-customers');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('company_name');
      expect(response.body[0]).toHaveProperty('status');
    }
  });

  test('GET /api/dashboard/recent-bookings returns booking data', async () => {
    const response = await request(app).get('/api/dashboard/recent-bookings');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('customer_name');
      expect(response.body[0]).toHaveProperty('origin');
      expect(response.body[0]).toHaveProperty('destination');
    }
  });

  test('GET /api/customers/c1 returns specific customer', async () => {
    const response = await request(app).get('/api/customers/c1');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id', 'c1');
    expect(response.body).toHaveProperty('company_name');
    expect(response.body).toHaveProperty('email');
  });
}); 