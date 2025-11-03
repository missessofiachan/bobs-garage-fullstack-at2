/**
 * @author Bob's Garage Team
 * @purpose Integration tests for Favorites endpoints
 * @version 1.0.0
 */

import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../src/app.js';
import { sequelize } from '../src/config/sequelize.js';
import { User } from '../src/db/models/User.js';
import { Favorite } from '../src/db/models/Favorite.js';
import { Service } from '../src/db/models/Service.js';
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

describe('Favorites integration tests', () => {
  const agent = request.agent(app as any);
  const random = Math.floor(Math.random() * 1000000);
  const email = `favorites+${random}@example.com`;
  const password = 'ChangeMe!123';
  let userId: number | null = null;
  let serviceIds: number[] = [];

  beforeAll(async () => {
    await sequelize.sync();
    
    // Create test user
    const user = await User.create({
      email,
      passwordHash: await hashPasswordFn(password),
      role: 'user',
    } as any);
    userId = user.id;

    // Create test services
    const service1 = await Service.create({
      name: 'Test Service 1',
      price: 50,
      description: 'Test description',
      published: true,
    });
    const service2 = await Service.create({
      name: 'Test Service 2',
      price: 100,
      description: 'Test description',
      published: true,
    });
    serviceIds = [service1.id, service2.id];
  });

  afterAll(async () => {
    if (userId) {
      await Favorite.destroy({ where: { userId } });
      await User.destroy({ where: { id: userId } });
    }
    if (serviceIds.length) {
      await Service.destroy({ where: { id: serviceIds } });
    }
  });

  test('list favorites when empty -> returns empty array', async () => {
    const access = await loginAndGetAccess(agent, email, password);
    const res = await agent
      .get('/api/users/me/favorites')
      .set('Authorization', `Bearer ${access}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  test('add favorite -> returns 201 with id', async () => {
    const access = await loginAndGetAccess(agent, email, password);
    const res = await agent
      .post(`/api/users/me/favorites/${serviceIds[0]}`)
      .set('Authorization', `Bearer ${access}`);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('serviceId', serviceIds[0]);
  });

  test('list favorites after adding -> returns 1 item', async () => {
    const access = await loginAndGetAccess(agent, email, password);
    const res = await agent
      .get('/api/users/me/favorites')
      .set('Authorization', `Bearer ${access}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty('id', serviceIds[0]);
    expect(res.body[0]).toHaveProperty('name', 'Test Service 1');
  });

  test('check favorite when favorited -> returns isFavorite true', async () => {
    const access = await loginAndGetAccess(agent, email, password);
    const res = await agent
      .get(`/api/users/me/favorites/${serviceIds[0]}`)
      .set('Authorization', `Bearer ${access}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('isFavorite', true);
    expect(res.body).toHaveProperty('id');
  });

  test('check favorite when not favorited -> returns isFavorite false', async () => {
    const access = await loginAndGetAccess(agent, email, password);
    const res = await agent
      .get(`/api/users/me/favorites/${serviceIds[1]}`)
      .set('Authorization', `Bearer ${access}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('isFavorite', false);
  });

  test('add duplicate favorite -> returns 409 conflict', async () => {
    const access = await loginAndGetAccess(agent, email, password);
    const res = await agent
      .post(`/api/users/me/favorites/${serviceIds[0]}`)
      .set('Authorization', `Bearer ${access}`);

    expect(res.status).toBe(409);
  });

  test('remove favorite -> returns 204', async () => {
    const access = await loginAndGetAccess(agent, email, password);
    const res = await agent
      .delete(`/api/users/me/favorites/${serviceIds[0]}`)
      .set('Authorization', `Bearer ${access}`);

    expect(res.status).toBe(204);
  });

  test('list favorites after removing -> returns empty array', async () => {
    const access = await loginAndGetAccess(agent, email, password);
    const res = await agent
      .get('/api/users/me/favorites')
      .set('Authorization', `Bearer ${access}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  test('remove non-existent favorite -> returns 404', async () => {
    const access = await loginAndGetAccess(agent, email, password);
    const res = await agent
      .delete(`/api/users/me/favorites/${serviceIds[1]}`)
      .set('Authorization', `Bearer ${access}`);

    expect(res.status).toBe(404);
  });

  test('add favorite to non-existent service -> returns 404', async () => {
    const access = await loginAndGetAccess(agent, email, password);
    const res = await agent
      .post('/api/users/me/favorites/9999999')
      .set('Authorization', `Bearer ${access}`);

    expect(res.status).toBe(404);
  });
});

