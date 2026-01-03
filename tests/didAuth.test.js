const request = require('supertest');
const app = require('../src/app');
const didResolver = require('../src/services/didResolver');

describe('didAuth middleware (stub)', () => {
  beforeEach(() => didResolver.clear());

  test('rejects missing Authorization header', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeTruthy();
  });

  test('rejects unknown did', async () => {
    const res = await request(app).get('/protected').set('Authorization', 'Bearer did:unknown:1');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/unknown/);
  });

  test('accepts known did and attaches req.did', async () => {
    const did = 'did:example:alice';
    didResolver.register(did, { id: did, name: 'Alice' });
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${did}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.did).toBe(did);
  });
});
