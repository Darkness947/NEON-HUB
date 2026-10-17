const expressRateLimit = require('express-rate-limit');

const rateLimit = expressRateLimit.rateLimit || expressRateLimit;
const { ipKeyGenerator } = expressRateLimit;

// ─── Client IP Resolution ─────────────────────────────────────────────────────
// Traffic path in production: Browser → Netlify proxy → Render LB → Express.
// Netlify sets `x-nf-client-connection-ip` to the real client IP on proxied
// requests. Fall back to req.ip (resolved via `trust proxy` in server.js).
// ipKeyGenerator collapses IPv6 addresses to their /56 subnet so a single
// IPv6 client cannot bypass the limit by rotating addresses.
const clientKey = (req) => {
  const netlifyIp = req.headers['x-nf-client-connection-ip'];
  const ip = (typeof netlifyIp === 'string' && netlifyIp.trim()) || req.ip || '';
  return ipKeyGenerator ? ipKeyGenerator(ip) : ip;
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // 5 attempts per window
  keyGenerator: clientKey,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts. Please try again in 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: clientKey,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, generalLimiter };
