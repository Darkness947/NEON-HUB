import { describe, it, expect, vi, afterEach } from 'vitest';
import historyService from '../../services/historyService';
import api from '../../services/api';

describe('TC-HIST-004 & TC-HIST-005: historyService Unit Tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getHistoryCount should return integer count from API on success', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({
      data: {
        success: true,
        data: { count: 12 }
      }
    });

    const count = await historyService.getHistoryCount();

    expect(count).toBe(12);
    expect(api.get).toHaveBeenCalledWith('/api/history/count');
  });

  it('getHistoryCount should return fallback 0 when API request fails', async () => {
    vi.spyOn(api, 'get').mockRejectedValue(new Error('Network error'));

    const count = await historyService.getHistoryCount();

    expect(count).toBe(0);
  });

  it('recordVisit should send post request to /api/history/visit', async () => {
    const mockRecord = { id: 1, media_type: 'movie', media_id: 550 };
    vi.spyOn(api, 'post').mockResolvedValue({
      data: {
        success: true,
        data: mockRecord
      }
    });

    const result = await historyService.recordVisit('movie', 550);

    expect(result).toEqual(mockRecord);
    expect(api.post).toHaveBeenCalledWith('/api/history/visit', {
      media_type: 'movie',
      media_id: 550
    });
  });
});
