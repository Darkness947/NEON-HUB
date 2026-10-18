const request = require('supertest');
const app = require('../../server');

describe('TC-SYS-001: Health Check Endpoint', () => {
  it('GET /health should return 200 with status ok and ISO timestamp', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});

describe('TC-SYS-002: 404 Route Fallback', () => {
  it('GET /api/nonexistent-route should return 404 with structured error', async () => {
    const res = await request(app)
      .get('/api/nonexistent-route')
      .expect(404);

    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
    expect(res.body.error.message).toContain('not found');
  });
});
