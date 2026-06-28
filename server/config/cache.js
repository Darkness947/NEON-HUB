const NodeCache = require('node-cache');

// Default TTL of 600 seconds (10 minutes) for trending endpoints
const cache = new NodeCache({
  stdTTL: 600,
  checkperiod: 120,
});

module.exports = cache;
