const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../server');
const userModel = require('../../models/userModel');

describe('Auth Routes Integration Tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('TC-AUTH-001 & TC-AUTH-002 & TC-AUTH-003: POST /api/auth/register', () => {
    it('should return 400 when password is too short or missing uppercase/lowercase/number', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'validuser',
          email: 'valid@example.com',
          password: 'short' // Invalid password
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 when user with email already exists', async () => {
      vi.spyOn(userModel, 'findUserByEmail').mockResolvedValue({
        id: 1,
        email: 'exists@example.com'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'exists@example.com',
          password: 'Password123'
        })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('should register successfully with valid inputs and return 201', async () => {
      vi.spyOn(userModel, 'findUserByEmail').mockResolvedValue(null);
      vi.spyOn(userModel, 'createUser').mockResolvedValue({
        id: 10,
        username: 'newuser',
        email: 'newuser@example.com',
        avatar_url: null,
        bio: null,
        created_at: new Date().toISOString()
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'ValidPassword123'
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Account created successfully');
      expect(res.body.data.user.email).toBe('newuser@example.com');
      expect(res.body.data.user).not.toHaveProperty('password');
    });
  });

  describe('TC-AUTH-004 & TC-AUTH-005: POST /api/auth/login', () => {
    it('should return 401 when email is not found', async () => {
      vi.spyOn(userModel, 'findUserByEmail').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'Password123'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 401 when password does not match hash', async () => {
      const realHash = await bcrypt.hash('CorrectPassword123', 10);
      vi.spyOn(userModel, 'findUserByEmail').mockResolvedValue({
        id: 5,
        email: 'user@example.com',
        password: realHash
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'WrongPassword123'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 200 with accessToken and user when credentials are correct', async () => {
      const password = 'CorrectPassword123';
      const passwordHash = await bcrypt.hash(password, 10);

      vi.spyOn(userModel, 'findUserByEmail').mockResolvedValue({
        id: 5,
        username: 'authenticated_user',
        email: 'auth@example.com',
        password: passwordHash,
        avatar_url: null,
        bio: null,
        created_at: new Date().toISOString()
      });

      vi.spyOn(userModel, 'createRefreshToken').mockResolvedValue({
        id: 'mock-uuid-token-id',
        user_id: 5
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'auth@example.com',
          password
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.user.email).toBe('auth@example.com');
      // Cookie is set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes('refreshToken='))).toBe(true);
    });
  });
});
