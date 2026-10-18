const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const { mockDbQuery, resetDbMock } = require('../mocks/dbMock');

describe('History Routes Integration Tests', () => {
  let validToken;
  let expiredToken;

  beforeEach(() => {
    resetDbMock();
    validToken = jwt.sign({ userId: 10 }, process.env.JWT_SECRET, { expiresIn: '15m' });
    expiredToken = jwt.sign({ userId: 10 }, process.env.JWT_SECRET, { expiresIn: '-1s' });
  });

  afterEach(() => {
    resetDbMock();
  });

  describe('TC-AUTH-006 & TC-AUTH-007: Protected Route Token Enforcement', () => {
    it('should return 401 when Authorization header is missing', async () => {
      const res = await request(app)
        .get('/api/history/count')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NO_TOKEN');
    });

    it('should return 401 when Token is expired', async () => {
      const res = await request(app)
        .get('/api/history/count')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TOKEN_EXPIRED');
    });
  });

  describe('TC-HIST-001: GET /api/history/count', () => {
    it('should return 200 with count when valid token provided', async () => {
      mockDbQuery([{ count: '5' }]);

      const res = await request(app)
        .get('/api/history/count')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({ count: 5 });
    });
  });

  describe('TC-HIST-002 & TC-HIST-003: POST /api/history/visit', () => {
    it('should log visit and return 200 for valid media', async () => {
      const mockRecord = {
        id: 1,
        user_id: 10,
        media_type: 'movie',
        media_id: 550,
        last_viewed_at: new Date().toISOString()
      };
      mockDbQuery([mockRecord]);

      const res = await request(app)
        .post('/api/history/visit')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ media_type: 'movie', media_id: 550 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        media_type: 'movie',
        media_id: 550
      });
    });

    it('should return 400 when invalid media_type is provided', async () => {
      const res = await request(app)
        .post('/api/history/visit')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ media_type: 'book', media_id: 123 })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Invalid media type');
    });

    it('should return 400 when media_id is missing', async () => {
      const res = await request(app)
        .post('/api/history/visit')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ media_type: 'movie' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Media ID is required');
    });
  });
});
