import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../src/app.js';
import { sequelize } from '../src/config/sequelize.js';
import { env } from '../src/config/env.js';
import { User } from '../src/db/models/User.js';
import { hashPassword as hashPasswordFn } from '../src/utils/hash.js';

describe('Auth token edge cases (expired/malformed/wrong signature)', () => {
  const agent = request.agent(app as any);
  const email = `tokenedge+${Math.floor(Math.random() * 1e9)}@example.com`;
  const password = 'TokenEdge!123';
  let userId: number | null = null;

  beforeAll(async () => {
    await sequelize.sync();
    const u = await User.create({
      email,
      passwordHash: await hashPasswordFn(password),
      role: 'user',
    } as any);
    userId = u.id;
  });

  afterAll(async () => {
    if (userId) await User.destroy({ where: { id: userId } });
  });

  test('malformed token -> 401', async () => {
    const res = await agent
      .get('/api/users/me')
      .set('Authorization', 'Bearer not-a-jwt');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test('wrong signature -> 401', async () => {
    const badToken = jwt.sign(
      { sub: userId, role: 'user' },
      // intentionally wrong secret
      env.JWT_SECRET + '_wrong',
    );
    const res = await agent
      .get('/api/users/me')
      .set('Authorization', `Bearer ${badToken}`);
    expect(res.status).toBe(401);
  });

  test('expired token -> 401', async () => {
    // Create a token that is already expired (exp in the past)
    const expPast = Math.floor(Date.now() / 1000) - 60;
    const expired = jwt.sign(
      { sub: userId, role: 'user', exp: expPast },
      env.JWT_SECRET as any,
      { noTimestamp: true } as any,
    );
    const res = await agent
      .get('/api/users/me')
      .set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });
});
