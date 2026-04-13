// Supertest allows us to make HTTP requests directly against the Express app,
// without needing to start the actual server.
const request = require('supertest');

const { sequelize, User, Service, IpRecord } = require('../database/models');

// Run once before all tests.
// This creates fresh database tables for a clean test environment.
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

// Run once after all tests.
// Properly closes the DB connection to avoid Jest open-handle warnings.
afterAll(async () => {
  await sequelize.close();
});

// -------------------------------------------------------------
// TEST: Successful creation of a Service via POST /services
// -------------------------------------------------------------
test('POST /services creates a service', async () => {
  // Send a valid POST request with required fields.
  const res = await request(app)
    .post('/services')
    .send({ name: 'InternalDashboard', description: 'Main dashboard' });

  // Expect the server to confirm creation with HTTP 201.
  expect(res.statusCode).toBe(201);

  // The created service should return an ID assigned by Sequelize.
  expect(res.body.id).toBeDefined();

  // Ensure the name stored matches the input.
  expect(res.body.name).toBe('InternalDashboard');
});

// -------------------------------------------------------------
// TEST: Service creation should fail validation when `name` is missing
// -------------------------------------------------------------
test('POST /services returns 400 when name missing', async () => {
  // Send a request missing the required `name` field.
  const res = await request(app)
    .post('/services')
    .send({ description: 'No name here' });

  // Server should respond with 400 Bad Request.
  expect(res.statusCode).toBe(400);

  // Error message should be included in the response.
  expect(res.body.error).toBeDefined();
});