// tests/auth.test.js
const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../database/setup');
const User = require('../database/models/User');
const bcrypt = require('bcryptjs');

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const passwordHash = await bcrypt.hash('AdminPass123!', 10);
  await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    passwordHash,
    role: 'admin',
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Authentication', () => {
  test('login returns JWT token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'AdminPass123!' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('protected route rejects missing token', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(401);
  });

  test('admin can access /users', async () => {
    const login = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'AdminPass123!' });

    const token = login.body.token;

    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });
});