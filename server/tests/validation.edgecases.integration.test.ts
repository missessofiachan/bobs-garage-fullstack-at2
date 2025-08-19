import request from 'supertest';
import { describe, test, expect, beforeAll } from 'vitest';
import { app } from '../src/app.js';
import { sequelize } from '../src/config/sequelize.js';
import { User } from '../src/db/models/User.js';
import { hashPassword as hashPasswordFn } from '../src/utils/hash.js';

async function loginAndGetAccess(agent: any, email: string, password: string) {
  const res = await agent
    .post('/api/auth/login')
    .send({ email, password })
    .set('Accept', 'application/json');
  expect(res.status).toBe(200);
  return res.body.access as string;
}

describe('Validation edge cases across endpoints', () => {
  const agent = request.agent(app as any);
  const adminEmail = `admin+val+${Math.floor(Math.random() * 1e9)}@example.com`;
  const adminPassword = 'AdminVal!123';

  beforeAll(async () => {
    await sequelize.sync();
    await User.create({ email: adminEmail, passwordHash: await hashPasswordFn(adminPassword), role: 'admin' } as any);
  });

  test('services: missing body fields -> 400; price must be nonnegative; imageUrl must be URL', async () => {
    const access = await loginAndGetAccess(agent, adminEmail, adminPassword);

    // Missing required fields
    const missing = await agent
      .post('/api/services')
      .set('Authorization', `Bearer ${access}`)
      .send({});
    expect(missing.status).toBe(400);

    // Bad price and bad url
    const bad = await agent
      .post('/api/services')
      .set('Authorization', `Bearer ${access}`)
      .send({ name: 'A', price: -5, description: 'x', imageUrl: 'not-a-url' });
    expect(bad.status).toBe(400);
  });

  test('staff: name required; photoUrl must be URL', async () => {
    const access = await loginAndGetAccess(agent, adminEmail, adminPassword);

    // Missing name
    const missing = await agent
      .post('/api/staff')
      .set('Authorization', `Bearer ${access}`)
      .send({ role: 'Mechanic' });
    expect(missing.status).toBe(400);

    // Bad URL
    const bad = await agent
      .post('/api/staff')
      .set('Authorization', `Bearer ${access}`)
      .send({ name: 'Bob', role: 'Mechanic', photoUrl: 'nope' });
    expect(bad.status).toBe(400);
  });

  test('users: update profile invalid email -> 400; unauthorized without token', async () => {
    // No token
    const unauth = await agent.put('/api/users/me').send({ email: 'x@example.com' });
    expect(unauth.status).toBe(401);

    const access = await loginAndGetAccess(agent, adminEmail, adminPassword);

    const bad = await agent
      .put('/api/users/me')
      .set('Authorization', `Bearer ${access}`)
      .send({ email: 'bad-email' });
    expect([400, 409]).toContain(bad.status);
  });
});
