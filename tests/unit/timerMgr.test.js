const { TimerMgr } = require('../../timerMgr');

describe('TimerMgr', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('creates a timer and executes callback', () => {
    const mgr = new TimerMgr();
    const callback = jest.fn();

    mgr.check('test-key', 'PT1s', callback);
    expect(mgr.hasTimer('test-key')).toBe(true);

    // Fast-forward 1 second -> runs callback
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(mgr.hasTimer('test-key')).toBe(false);
  });

  test('calls flappingFunc when timer already exists', () => {
    const mgr = new TimerMgr();
    const callback = jest.fn();
    const flapping = jest.fn();

    mgr.check('test-key', 'PT2s', callback);

    // Call check again on the same key
    mgr.check('test-key', 'PT2s', callback, false, flapping);
    expect(flapping).toHaveBeenCalledTimes(1);
    // Because reschedule=false, it should cancel the timer
    expect(mgr.hasTimer('test-key')).toBe(false);
  });

  test('reschedules timer when reschedule=true', () => {
    const mgr = new TimerMgr();
    const callback = jest.fn();

    mgr.check('test-key', 'PT2s', callback);

    // Reschedule
    mgr.check('test-key', 'PT3s', callback, true);
    expect(mgr.hasTimer('test-key')).toBe(true);

    // Wait 2 seconds -> should not have run yet since it got rescheduled to 3 seconds
    jest.advanceTimersByTime(2000);
    expect(callback).not.toHaveBeenCalled();

    // Wait 1 more second (total 3 seconds since reschedule) -> runs callback
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
