const { TimerMgr } = require('../../timerMgr');
const { RateLimit } = require('../../rateLimit');
const { cache } = require('openhab');

describe('Cache Transfer and Javaify/Jsify Integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    cache.private.clear();
    cache.shared.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('TimerMgr backed by cache key remains functional after javaify/jsify through cache', () => {
    // 1. Create a TimerMgr with a key, which automatically uses cache.private
    const mgr1 = new TimerMgr('my-shared-mgr', cache.shared);
    const callback = jest.fn();

    mgr1.check('timer1', 'PT2s', callback);
    expect(mgr1.hasTimer('timer1')).toBe(true);

    // 2. Simulate retrieving it from cache in another rule context
    // Put the actual mgr1 instance into cache.shared
    cache.shared.put('mgr-instance', mgr1);

    // Retrieve it from cache.shared
    const retrievedMgr = cache.shared.get('mgr-instance');

    // Verify it's still functional and has its methods
    expect(retrievedMgr).toBeDefined();
    expect(retrievedMgr.hasTimer('timer1')).toBe(true);

    // Fast-forward time to trigger the callback registered through the original manager
    jest.advanceTimersByTime(2000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('RateLimit backed by cache key works across cache transfer', () => {
    const limit = new RateLimit('my-shared-limit', cache.shared);
    const action = jest.fn();

    limit.run(action, 'PT2s');
    expect(action).toHaveBeenCalledTimes(1);

    // Store in cache
    cache.shared.put('limit-instance', limit);

    // Retrieve in a simulated "different rule" context
    const retrievedLimit = cache.shared.get('limit-instance');
    expect(retrievedLimit).toBeDefined();

    // Call run again on retrieved instance, should be ignored due to rate limit
    retrievedLimit.run(action, 'PT2s');
    expect(action).toHaveBeenCalledTimes(1);

    // Fast-forward 3 seconds -> runs successfully on retrieved instance
    jest.advanceTimersByTime(3000);
    retrievedLimit.run(action, 'PT2s');
    expect(action).toHaveBeenCalledTimes(2);
  });

  test('TimerMgr triggers cache write-back upon checking and cancelling timers', () => {
    const mockCache = {
      put: jest.fn(),
      get: jest.fn(() => new Map())
    };
    
    // Create TimerMgr with mock cache
    const mgr = new TimerMgr('test-mgr-key', mockCache);
    
    // 1. Adding a timer should trigger write-back
    mgr.check('t1', 'PT1s', () => {});
    expect(mockCache.put).toHaveBeenCalledWith('test-mgr-key', expect.any(Object));

    // 2. Cancelling the timer should trigger write-back
    mockCache.put.mockClear();
    mgr.cancel('t1');
    expect(mockCache.put).toHaveBeenCalledWith('test-mgr-key', expect.any(Object));
  });
});
