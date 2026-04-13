// Supertest allows us to send HTTP requests directly to the Express app
const request = require('supertest');

// Import the Express app (without starting the server) + Sequelize connection
const { app, sequelize } = require('../app');

// Import models used in this test file
const { User, Service, IpRecord } = require('../database/models');

// ------------------------------
// Test Setup
// ------------------------------

// Before running any tests, reset the database and insert a sample user.
// Using sync({ force: true }) ensures a clean, predictable state.
beforeAll(async () => {
  await sequelize.sync({ force: true });

  await User.create({
    name: 'Test User',
    email: 'test@example.com',
    role: 'client'
  });
});

// After all tests complete, close the DB connection
// This prevents Jest from hanging due to open handles.
afterAll(async () => {
  await sequelize.close();
});

// ------------------------------
// Test Cases
// ------------------------------

// Test: GET /users should return a list of users
test('GET /users returns list of users', async () => {
  const res = await request(app).get('/users');

  expect(res.statusCode).toBe(200);           // Endpoint should succeed
  expect(Array.isArray(res.body)).toBe(true); // Response should be an array
  expect(res.body.length).toBeGreaterThan(0); // At least one user should exist
});

// Test: POST /users should validate required fields
test('POST /users validates required fields', async () => {
  // Send invalid data (missing required fields)
  const res = await request(app).post('/users').send({ name: '' });

  expect(res.statusCode).toBe(400);           // Should reject invalid input
  expect(res.body.error).toBeDefined();       // Error message should be present
});