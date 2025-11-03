import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
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

describe('Admin Users CRUD integration', () => {
  const agent = request.agent(app as any);
  const adminEmail = `admin+crud+${Math.floor(Math.random() * 1e9)}@example.com`;
  const adminPassword = 'AdminPwd!123';
  let adminId: number | null = null;

  // an existing user to test email conflict scenarios
  const existingUserEmail = `existing+${Math.floor(Math.random() * 1e9)}@example.com`;
  const existingUserPassword = 'UserPwd!123';
  let existingUserId: number | null = null;

  beforeAll(async () => {
    await sequelize.sync();
    const a = await User.create({
      email: adminEmail,
      passwordHash: await hashPasswordFn(adminPassword),
      role: 'admin',
    } as any);
    adminId = a.id;
    const u = await User.create({
      email: existingUserEmail,
      passwordHash: await hashPasswordFn(existingUserPassword),
      role: 'user',
    } as any);
    existingUserId = u.id;
  });

  afterAll(async () => {
    if (existingUserId) await User.destroy({ where: { id: existingUserId } });
    if (adminId) await User.destroy({ where: { id: adminId } });
  });

  test('create user: validation errors and success then conflict', async () => {
    const adminAccess = await loginAndGetAccess(
      agent,
      adminEmail,
      adminPassword,
    );

    // invalid email
    const badEmail = await agent
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ email: 'not-an-email', password: 'longenough', role: 'user' });
    expect(badEmail.status).toBe(400);

    // short password
    const shortPwd = await agent
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({
        email: `ok+${Math.floor(Math.random() * 1e6)}@example.com`,
        password: 'short',
        role: 'user',
      });
    expect(shortPwd.status).toBe(400);

    // success
    const newEmail = `new+${Math.floor(Math.random() * 1e9)}@example.com`;
    const createOk = await agent
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({
        email: newEmail,
        password: 'StrongPwd!123',
        role: 'user',
        active: true,
      });
    expect(createOk.status).toBe(201);
    const newUserId = createOk.body.id as number;

    // get by id
    const getOk = await agent
      .get(`/api/admin/users/${newUserId}`)
      .set('Authorization', `Bearer ${adminAccess}`);
    expect(getOk.status).toBe(200);
    expect(getOk.body).toHaveProperty('email', newEmail);

    // duplicate email -> 409
    const dup = await agent
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ email: newEmail, password: 'AnotherStrong!123', role: 'user' });
    expect([400, 409]).toContain(dup.status);

    // cleanup via delete endpoint
    const del = await agent
      .delete(`/api/admin/users/${newUserId}`)
      .set('Authorization', `Bearer ${adminAccess}`);
    expect([204, 200]).toContain(del.status);
  });

  test('get user by id: 400 invalid id and 404 missing', async () => {
    const adminAccess = await loginAndGetAccess(
      agent,
      adminEmail,
      adminPassword,
    );
    const badId = await agent
      .get('/api/admin/users/abc')
      .set('Authorization', `Bearer ${adminAccess}`);
    expect([400, 404]).toContain(badId.status);

    const missing = await agent
      .get('/api/admin/users/99999999')
      .set('Authorization', `Bearer ${adminAccess}`);
    expect([404, 400]).toContain(missing.status);
  });

  test('update user: validation, 404 missing, email conflict and success', async () => {
    const adminAccess = await loginAndGetAccess(
      agent,
      adminEmail,
      adminPassword,
    );

    // create a user to update
    const email = `upd+${Math.floor(Math.random() * 1e9)}@example.com`;
    const created = await agent
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ email, password: 'StrongPwd!123', role: 'user', active: true });
    expect(created.status).toBe(201);
    const id = created.body.id as number;

    // invalid payload
    const badPayload = await agent
      .put(`/api/admin/users/${id}`)
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ email: 'bad-email' });
    expect(badPayload.status).toBe(400);

    // email conflict
    const conflict = await agent
      .put(`/api/admin/users/${id}`)
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ email: existingUserEmail });
    expect([400, 409]).toContain(conflict.status);

    // success: change role and deactivate
    const ok = await agent
      .put(`/api/admin/users/${id}`)
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ role: 'admin', active: false });
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({ role: 'admin', active: false });

    // update non-existent
    const notFound = await agent
      .put('/api/admin/users/99999999')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ role: 'user' });
    expect([404, 400]).toContain(notFound.status);

    // invalid id param
    const badId = await agent
      .put('/api/admin/users/abc')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ role: 'user' });
    expect([400, 404]).toContain(badId.status);

    // cleanup
    const del = await agent
      .delete(`/api/admin/users/${id}`)
      .set('Authorization', `Bearer ${adminAccess}`);
    expect([204, 200]).toContain(del.status);
  });

  test('delete user: 400 invalid id and 404 missing', async () => {
    const adminAccess = await loginAndGetAccess(
      agent,
      adminEmail,
      adminPassword,
    );

    const badId = await agent
      .delete('/api/admin/users/abc')
      .set('Authorization', `Bearer ${adminAccess}`);
    expect([400, 404]).toContain(badId.status);

    const missing = await agent
      .delete('/api/admin/users/99999999')
      .set('Authorization', `Bearer ${adminAccess}`);
    expect([404, 400]).toContain(missing.status);
  });
});
