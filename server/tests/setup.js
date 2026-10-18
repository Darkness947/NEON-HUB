process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.JWT_SECRET = 'neon_hub_test_jwt_secret_key_at_least_64_characters_long_for_testing_purposes_only';
process.env.JWT_EXPIRES_IN = '15m';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/neon_hub_test';
process.env.FRONTEND_URL = 'http://localhost:5173';
