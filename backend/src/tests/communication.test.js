const request = require('supertest');
const app = require('../server');
const db = require('../database');

describe('Communications API', () => {
  let testCustomerId;
  let testCommunicationId;

  beforeAll(async () => {
    // Create a test customer
    const [result] = await db.query(
      'INSERT INTO customers (company_name, contact_person, email) VALUES (?, ?, ?) RETURNING id',
      ['Test Company', 'John Test', 'test@example.com']
    );
    testCustomerId = result.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testCommunicationId) {
      await db.query('DELETE FROM communications WHERE id = ?', [testCommunicationId]);
    }
    if (testCustomerId) {
      await db.query('DELETE FROM customers WHERE id = ?', [testCustomerId]);
    }
  });

  describe('POST /api/communications', () => {
    it('should create a new communication', async () => {
      const newComm = {
        customer_id: testCustomerId,
        type: 'call',
        summary: 'Test call summary',
        duration_minutes: 30,
        to_name: 'Test Contact',
        to_title: 'Manager',
        from_name: 'John Doe',
        from_title: 'Account Manager',
        tags: ['test', 'important']
      };

      const response = await request(app)
        .post('/api/communications')
        .send(newComm)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.customer_id).toBe(testCustomerId);
      expect(response.body.type).toBe('call');
      
      testCommunicationId = response.body.id;
    });

    it('should fail to create communication with invalid customer_id', async () => {
      const invalidComm = {
        customer_id: 999999,
        type: 'call',
        summary: 'Test call summary'
      };

      await request(app)
        .post('/api/communications')
        .send(invalidComm)
        .expect(400);
    });
  });

  describe('GET /api/communications', () => {
    it('should return all communications', async () => {
      const response = await request(app)
        .get('/api/communications')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/communications/:id', () => {
    it('should return a specific communication', async () => {
      const response = await request(app)
        .get(`/api/communications/${testCommunicationId}`)
        .expect(200);

      expect(response.body.id).toBe(testCommunicationId);
      expect(response.body.type).toBe('call');
    });

    it('should return 404 for non-existent communication', async () => {
      await request(app)
        .get('/api/communications/999999')
        .expect(404);
    });
  });

  describe('PUT /api/communications/:id', () => {
    it('should update an existing communication', async () => {
      const updates = {
        summary: 'Updated test summary',
        tags: ['test', 'updated']
      };

      const response = await request(app)
        .put(`/api/communications/${testCommunicationId}`)
        .send(updates)
        .expect(200);

      expect(response.body.summary).toBe(updates.summary);
      expect(JSON.parse(response.body.tags)).toEqual(updates.tags);
    });
  });

  describe('DELETE /api/communications/:id', () => {
    it('should delete an existing communication', async () => {
      await request(app)
        .delete(`/api/communications/${testCommunicationId}`)
        .expect(200);

      // Verify it's deleted
      await request(app)
        .get(`/api/communications/${testCommunicationId}`)
        .expect(404);
    });
  });
}); 