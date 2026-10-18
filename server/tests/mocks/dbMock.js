const pool = require('../../config/db');

/**
 * Helper to mock pool.query with predictable responses or errors.
 * Uses global `vi` provided by Vitest.
 */
const mockDbQuery = (impl) => {
  if (typeof impl === 'function') {
    return vi.spyOn(pool, 'query').mockImplementation(impl);
  }
  const rows = Array.isArray(impl) ? impl : (impl?.rows || []);
  return vi.spyOn(pool, 'query').mockResolvedValue({
    rows,
    rowCount: rows.length,
    ...impl
  });
};

const resetDbMock = () => {
  if (pool.query && pool.query.mockRestore) {
    pool.query.mockRestore();
  }
};

module.exports = {
  mockDbQuery,
  resetDbMock,
  pool
};
