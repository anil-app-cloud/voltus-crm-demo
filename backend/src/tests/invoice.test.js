const request = require('supertest');
const app = require('../server');
require('./mockUtils');  // This will set up the mocks
const { pool } = require('../database');

// Sample mock data
const mockCustomerId = 'c1';
const mockBookingId = 'b1';
const mockInvoiceId = '550e8400-e29b-41d4-a716-446655440000'; // Using UUID format
const mockInvoice = {
  id: mockInvoiceId,
  invoice_number: 'INV-0001',
  booking_id: mockBookingId,
  customer_id: mockCustomerId,
  amount: 1000,
  tax_amount: 100,
  total_amount: 1100,
  status: 'due',
  issue_date: '2023-05-01',
  due_date: '2023-06-01',
  payment_date: null,
  created_by: 'u1',
  created_at: '2023-05-01T00:00:00.000Z',
  updated_at: '2023-05-01T00:00:00.000Z'
};

// Clean up resources
afterAll(done => {
  pool.end().then(() => done());
});

describe('Invoice API', () => {
  const mockCustomer = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    company_name: 'Test Company',
    contact_person: 'Test User',
    email: 'test@example.com',
    phone: '+1 (555) 000-0000',
    address: '123 Test Street',
    city: 'Test City',
    country: 'United States',
    customer_type: 'Test Client',
    status: 'active'
  };

  const mockInvoice = {
    customer_id: '550e8400-e29b-41d4-a716-446655440000',
    invoice_number: 'INV-2023-001',
    status: 'pending',
    total_amount: 1500.00,
    issue_date: '2023-06-01',
    due_date: '2023-06-15',
    items: [
      {
        description: 'Shipping Service',
        quantity: 1,
        unit_price: 1500.00,
        amount: 1500.00
      }
    ]
  };

  let mockInvoiceId;

  beforeAll(async () => {
    // Create test customer if it doesn't exist
    await request(app)
      .post('/api/customers')
      .send(mockCustomer)
      .catch(() => {
        // Ignore error if customer already exists
      });
  });

  it('POST /api/invoices - Should create a new invoice', async () => {
    const response = await request(app)
      .post('/api/invoices')
      .send(mockInvoice)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('invoice_number');
    expect(response.body).toHaveProperty('customer_id', mockInvoice.customer_id);
    expect(response.body).toHaveProperty('total_amount', mockInvoice.total_amount);

    mockInvoiceId = response.body.id;
  });

  it('GET /api/invoices - Should get all invoices', async () => {
    const response = await request(app)
      .get('/api/invoices')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('invoice_number');
  });

  it('GET /api/invoices/:id - Get invoice by ID', async () => {
    const response = await request(app)
      .get(`/api/invoices/${mockInvoiceId}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('id', mockInvoiceId);
    expect(response.body).toHaveProperty('customer_id', mockInvoice.customer_id);
    expect(response.body).toHaveProperty('total_amount', mockInvoice.total_amount);
  });

  it('PATCH /api/invoices/:id - Update invoice status', async () => {
    const statusUpdate = {
      status: 'paid'
    };

    const response = await request(app)
      .patch(`/api/invoices/${mockInvoiceId}`)
      .send(statusUpdate)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Invoice status updated successfully');
  });

  it('PUT /api/invoices/:id - Update invoice', async () => {
    const updatedInvoice = {
      ...mockInvoice,
      total_amount: 2000.00,
      items: [
        {
          description: 'Updated Shipping Service',
          quantity: 1,
          unit_price: 2000.00,
          amount: 2000.00
        }
      ]
    };

    const response = await request(app)
      .put(`/api/invoices/${mockInvoiceId}`)
      .send(updatedInvoice)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Invoice updated successfully');
  });

  it('DELETE /api/invoices/:id - Delete invoice', async () => {
    const response = await request(app)
      .delete(`/api/invoices/${mockInvoiceId}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Invoice deleted successfully');
  });
}); 