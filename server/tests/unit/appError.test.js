const AppError = require('../../utils/AppError');
const asyncHandler = require('../../utils/asyncHandler');

describe('TC-ERR-001: AppError Class', () => {
  it('should instantiate with correct message, statusCode, and error code', () => {
    const error = new AppError('Resource not found', 404, 'NOT_FOUND');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.isOperational).toBe(true);
    expect(error.stack).toBeDefined();
  });

  it('should default code to ERROR if not provided', () => {
    const error = new AppError('Something went wrong', 500);

    expect(error.message).toBe('Something went wrong');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('ERROR');
    expect(error.isOperational).toBe(true);
  });
});

describe('TC-ERR-002: asyncHandler Utility', () => {
  it('should call wrapped function with req, res, next', async () => {
    const req = {};
    const res = {};
    const next = vi.fn();

    const mockHandler = vi.fn().mockResolvedValue('success');
    const wrapped = asyncHandler(mockHandler);

    await wrapped(req, res, next);

    expect(mockHandler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should catch rejected promises and forward error to next()', async () => {
    const req = {};
    const res = {};
    const next = vi.fn();
    const testError = new Error('Async failure');

    const mockHandler = vi.fn().mockRejectedValue(testError);
    const wrapped = asyncHandler(mockHandler);

    await wrapped(req, res, next);

    expect(next).toHaveBeenCalledWith(testError);
  });
});
