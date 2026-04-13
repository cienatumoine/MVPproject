// Supertest allows us to simulate HTTP requests against the Express app
const request = require('supertest');


const { sequelize, User, Service, IpRecord } = require('../database/models');

let testUser;
let testService;

// -----------------------------------------------
// Test Setup
// -----------------------------------------------

// Runs once before all tests:
// 1. Recreates the database schema using sync({ force: true })
// 2. Inserts a user and a service to support IP Record creation
beforeAll(async () => {
  // Reset database for a clean testing environment
  await sequelize.sync({ force: true });

  // Create a user to associate with the IP record
  testUser = await User.create({
    name: 'IP Owner',
    email: 'ipowner@example.com',
    role: 'sec'
  });

  // Create a service for the IP record association
  testService = await Service.create({
    name: 'ReportingTool',
    description: 'Reports'
  });
});

// Runs once after all tests finish
// Ensures Sequelize closes the connection (prevents open handle warnings)
afterAll(async () => {
  await sequelize.close();
});

// -----------------------------------------------
// Test Cases
// -----------------------------------------------

// Test creating a valid IP record
test('POST /ips creates a new IP record', async () => {
  const res = await request(app)
    .post('/ips')
    .send({
      ipAddress: '203.0.113.10',
      label: 'Office IP',
      userId: testUser.id,
      serviceId: testService.id
    });

  // Expect success status and correct values returned
  expect(res.statusCode).toBe(201);
  expect(res.body.id).toBeDefined();
  expect(res.body.ipAddress).toBe('203.0.113.10');
});

// Test validation behavior for missing required fields
test('POST /ips returns 400 when required fields missing', async () => {
  const res = await request(app)
    .post('/ips')
    .send({
      // Missing ipAddress, userId, serviceId
      label: 'Missing IP'
    });

  // Expect validation failure
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toBeDefined();
});