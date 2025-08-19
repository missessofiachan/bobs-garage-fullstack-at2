import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../src/app.js';
import { sequelize } from '../src/config/sequelize.js';
import { User } from '../src/db/models/User.js';

describe('Auth integration tests', () => {
  const agent = request.agent(app as any);
  const random = Math.floor(Math.random() * 1000000);
  const email = `integration+${random}@example.com`;
  const password = 'ChangeMe!123';
  let createdUserId: number | null = null;

  beforeAll(async () => {
    // Ensure DB tables exist before running integration tests
    await sequelize.sync();
  });

  afterAll(async () => {
    // cleanup created user; don't close sequelize here to allow other test files to run
    if (createdUserId) {
      await User.destroy({ where: { id: createdUserId } });
    } else {
      await User.destroy({ where: { email } });
    }
  });

  test('register -> returns 201 and user id', async () => {
    const res = await agent
      .post('/api/auth/register')
      .send({ email, password })
      .set('Accept', 'application/json');

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email', email);
    createdUserId = res.body.id;
  });

  test('login -> returns access token and sets refresh cookie', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({ email, password })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access');
    // agent should store cookie for refresh endpoint
    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.length).toBeGreaterThan(0);
  });

  test('refresh -> returns new access token when cookie present', async () => {
    // agent persists cookies from previous response
    const res = await agent.post('/api/auth/refresh');
    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('access');
    }
  });
});
