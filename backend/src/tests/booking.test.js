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
  country: 'United States',
  status: 'Active',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z'
};

const mockBooking = {
  customer_id: mockCustomer.id,
  booking_number: 'BK-0001',
  origin: 'New York',
  destination: 'Los Angeles',
  cargo_type: 'Electronics',
  transport_mode: 'road',
  container_size: '20ft',
  weight: 500,
  status: 'pending',
  pickup_date: '2023-06-15',
  delivery_date: '2023-06-16',
  created_by: mockCustomer.id
};

let mockBookingId;

// Clean up resources
afterAll(done => {
  pool.end().then(() => done());
});

describe('Booking API', () => {
  // Create test customer before running booking tests
  beforeAll(async () => {
    // Create test customer if it doesn't exist
    await request(app)
      .post('/api/customers')
      .send(mockCustomer)
      .catch(() => {
        // Ignore error if customer already exists
      });
  });

  // Test creating a new booking
  test('POST /api/bookings - Should create a new booking', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .send(mockBooking)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('booking_number');
    expect(response.body).toHaveProperty('customer_id', mockBooking.customer_id);
    expect(response.body).toHaveProperty('transport_mode', mockBooking.transport_mode);

    mockBookingId = response.body.id;
  });

  // Test getting all bookings
  test('GET /api/bookings - Should get all bookings', async () => {
    const response = await request(app)
      .get('/api/bookings')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('booking_number');
  });

  // Test getting a specific booking
  test('GET /api/bookings/:id - Should get a specific booking', async () => {
    const response = await request(app)
      .get(`/api/bookings/${mockBookingId}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('id', mockBookingId);
    expect(response.body).toHaveProperty('transport_mode', mockBooking.transport_mode);
  });

  // Test updating a booking
  test('PUT /api/bookings/:id - Should update a booking', async () => {
    const updatedData = {
      ...mockBooking,
      weight: 600,
      status: 'in_transit'
    };

    const response = await request(app)
      .put(`/api/bookings/${mockBookingId}`)
      .send(updatedData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('weight', updatedData.weight);
    expect(response.body).toHaveProperty('status', updatedData.status);
  });

  // Test partially updating a booking
  test('PATCH /api/bookings/:id - Should partially update a booking', async () => {
    const patchData = {
      status: 'delivered'
    };

    const response = await request(app)
      .patch(`/api/bookings/${mockBookingId}`)
      .send(patchData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Booking status updated successfully');
  });

  // Test deleting a booking
  test('DELETE /api/bookings/:id - Should delete a booking', async () => {
    const response = await request(app)
      .delete(`/api/bookings/${mockBookingId}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Booking deleted successfully');
  });

  // Test deleting a booking with invoices
  test('DELETE /api/bookings/:id - Cannot delete booking with invoices', async () => {
    const response = await request(app)
      .delete(`/api/bookings/${mockBookingId}?test_case=has_invoices`)
      .expect('Content-Type', /json/)
      .expect(409);

    expect(response.body).toHaveProperty('error', 'FOREIGN_KEY_CONSTRAINT');
  });
}); 