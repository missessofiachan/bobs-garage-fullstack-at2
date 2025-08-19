import request from 'supertest';
import { describe, test, expect, beforeAll } from 'vitest';
import { app } from '../src/app.js';
import { sequelize } from '../src/config/sequelize.js';

describe('Auth negative cases', () => {
  const agent = request.agent(app as any);
  const rnd = Math.floor(Math.random() * 1_000_000);
  const email = `neg+${rnd}@example.com`;

  beforeAll(async () => {
    await sequelize.sync();
  });

  test('register -> 400 on invalid payload', async () => {
    const res = await agent
      .post('/api/auth/register')
      // missing email, short password
      .send({ password: 'short' })
      .set('Accept', 'application/json');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('register duplicate -> 409', async () => {
    const password = 'ChangeMe!123';
    const r1 = await agent.post('/api/auth/register').send({ email, password });
    expect([200, 201]).toContain(r1.status);
    const r2 = await agent.post('/api/auth/register').send({ email, password });
    expect(r2.status).toBe(409);
  });

  test('login -> 401 invalid credentials', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({ email: 'not-a-user@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('refresh -> 401 when no cookie', async () => {
    const res = await request(app as any).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });
});
