import request from 'supertest';
import app from '../src/index'; // if you export the app from index.ts

test('404 fallback', async () => {
  const res = await request('http://localhost:4000').get('/nope');
  expect(res.status).toBe(404);
});
