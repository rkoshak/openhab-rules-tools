const { RateLimit } = require('../../rateLimit');

describe('RateLimit', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('runs action first time and rate limits subsequent runs', () => {
    const limiter = new RateLimit();
    const action = jest.fn();

    // First call runs immediately
    limiter.run(action, 'PT3s');
    expect(action).toHaveBeenCalledTimes(1);

    // Second call is ignored because we are within 3 seconds
    limiter.run(action, 'PT3s');
    expect(action).toHaveBeenCalledTimes(1);

    // Advance 4 seconds -> can run again
    jest.advanceTimersByTime(4000);
    limiter.run(action, 'PT3s');
    expect(action).toHaveBeenCalledTimes(2);
  });
});
