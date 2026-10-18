const historyModel = require('../../models/historyModel');
const { mockDbQuery, resetDbMock } = require('../mocks/dbMock');

describe('History Model Unit Tests', () => {
  beforeEach(() => {
    resetDbMock();
  });

  afterEach(() => {
    resetDbMock();
  });

  it('getHistoryCount should query count for a user and return integer', async () => {
    const querySpy = mockDbQuery([{ count: '7' }]);

    const count = await historyModel.getHistoryCount(42);

    expect(count).toBe(7);
    expect(querySpy).toHaveBeenCalledTimes(1);
    const [sql, params] = querySpy.mock.calls[0];
    expect(sql).toContain('SELECT COUNT(*)::int as count FROM recently_viewed WHERE user_id = $1');
    expect(params).toEqual([42]);
  });

  it('getHistoryCount should return 0 if count is missing or 0', async () => {
    mockDbQuery([{ count: 0 }]);

    const count = await historyModel.getHistoryCount(99);

    expect(count).toBe(0);
  });

  it('logVisit should insert or update recently viewed record', async () => {
    const mockRecord = { id: 1, user_id: 10, media_type: 'movie', media_id: '550' };
    const querySpy = mockDbQuery([mockRecord]);

    const result = await historyModel.logVisit(10, 'movie', '550');

    expect(result).toEqual(mockRecord);
    expect(querySpy).toHaveBeenCalledTimes(1);
    const [sql, params] = querySpy.mock.calls[0];
    expect(sql).toContain('INSERT INTO recently_viewed');
    expect(sql).toContain('ON CONFLICT (user_id, media_type, media_id)');
    expect(params).toEqual([10, 'movie', '550']);
  });

  it('removeHistory should delete records matching user and ids array', async () => {
    const deletedRecords = [{ id: 1 }, { id: 2 }];
    const querySpy = mockDbQuery(deletedRecords);

    const result = await historyModel.removeHistory(10, [1, 2]);

    expect(result).toEqual(deletedRecords);
    expect(querySpy).toHaveBeenCalledTimes(1);
    const [sql, params] = querySpy.mock.calls[0];
    expect(sql).toContain('DELETE FROM recently_viewed');
    expect(sql).toContain('id = ANY($2::int[])');
    expect(params).toEqual([10, [1, 2]]);
  });
});
