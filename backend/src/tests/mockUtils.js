// Mock connection for the database module
const mockConnection = {
  beginTransaction: jest.fn().mockResolvedValue(true),
  query: jest.fn(),
  commit: jest.fn().mockResolvedValue(true),
  rollback: jest.fn().mockResolvedValue(true),
  release: jest.fn()
};

// Mock the database module
jest.mock('../database', () => {
  return {
    pool: {
      query: jest.fn(),
      end: jest.fn().mockResolvedValue(true),
      getConnection: jest.fn().mockResolvedValue(mockConnection)
    },
    mockConnection // Export mockConnection through the database mock
  };
});

// Import the mocked module
const { pool } = require('../database');

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Reset mockConnection.query to a new mock function
  mockConnection.query = jest.fn();
});

// Export the pool for tests to use
module.exports = {
  pool
}; 