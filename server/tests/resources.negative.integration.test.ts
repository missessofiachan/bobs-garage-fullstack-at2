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
  expect(res.body).toHaveProperty('access');
  return res.body.access as string;
}

describe('Additional negative validations for services/staff', () => {
  const agent = request.agent(app as any);
  const adminEmail = `admin+neg+${Math.floor(Math.random() * 1e9)}@example.com`;
  const adminPassword = 'AdminNeg!123';

  beforeAll(async () => {
    await sequelize.sync();
    await User.create({
      email: adminEmail,
      passwordHash: await hashPasswordFn(adminPassword),
      role: 'admin',
    } as any);
  });

  test('services: invalid id param on get/update/delete -> 400', async () => {
    const adminAccess = await loginAndGetAccess(
      agent,
      adminEmail,
      adminPassword,
    );

    const g = await agent.get('/api/services/abc');
    expect([400, 404]).toContain(g.status);

    const u = await agent
      .put('/api/services/abc')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ price: 10 });
    expect([400, 404]).toContain(u.status);

    const d = await agent
      .delete('/api/services/abc')
      .set('Authorization', `Bearer ${adminAccess}`);
    expect([400, 404]).toContain(d.status);
  });

  test('services: update with invalid payload -> 400', async () => {
    const adminAccess = await loginAndGetAccess(
      agent,
      adminEmail,
      adminPassword,
    );
    // first create a service
    const c = await agent
      .post('/api/services')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ name: 'Neg Svc', price: 50, description: 'ok' });
    expect([200, 201]).toContain(c.status);
    const id = c.body.id;

    // invalid payload fields
    const u = await agent
      .put(`/api/services/${id}`)
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ price: -100, imageUrl: 'not-a-url' });
    expect(u.status).toBe(400);

    // cleanup
    const d = await agent
      .delete(`/api/services/${id}`)
      .set('Authorization', `Bearer ${adminAccess}`);
    expect([200, 204]).toContain(d.status);
  });

  test('staff: invalid id param on get/update/delete -> 400', async () => {
    const adminAccess = await loginAndGetAccess(
      agent,
      adminEmail,
      adminPassword,
    );

    const g = await agent.get('/api/staff/abc');
    expect([400, 404]).toContain(g.status);

    const u = await agent
      .put('/api/staff/abc')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ role: 'x' });
    expect([400, 404]).toContain(u.status);

    const d = await agent
      .delete('/api/staff/abc')
      .set('Authorization', `Bearer ${adminAccess}`);
    expect([400, 404]).toContain(d.status);
  });

  test('staff: create/update invalid payload -> 400', async () => {
    const adminAccess = await loginAndGetAccess(
      agent,
      adminEmail,
      adminPassword,
    );

    // invalid url
    const cBad = await agent
      .post('/api/staff')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ name: 'Bob', photoUrl: 'not-a-url' });
    expect(cBad.status).toBe(400);

    // create ok
    const c = await agent
      .post('/api/staff')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({
        name: 'Alice',
        role: 'Mechanic',
        bio: 'pro',
        photoUrl: 'https://example.com/a.png',
      });
    expect([200, 201]).toContain(c.status);
    const id = c.body.id;

    // update invalid URL
    const u = await agent
      .put(`/api/staff/${id}`)
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ photoUrl: 'nope' });
    expect(u.status).toBe(400);

    // cleanup
    const d = await agent
      .delete(`/api/staff/${id}`)
      .set('Authorization', `Bearer ${adminAccess}`);
    expect([200, 204]).toContain(d.status);
  });
});
