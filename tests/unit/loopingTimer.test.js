const { LoopingTimer } = require('../../loopingTimer');

describe('LoopingTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('loops and reschedules until returning null', () => {
    let count = 0;
    const loopFn = jest.fn(() => {
      count++;
      if (count < 2) {
        return 'PT1S';
      }
      return null;
    });

    const timer = new LoopingTimer();
    timer.loop(loopFn, 'PT1S', 'TestLoop');

    expect(loopFn).not.toHaveBeenCalled();

    // Fast-forward 1 second -> runs loopFn once, returns PT1S, reschedules
    jest.advanceTimersByTime(1000);
    expect(loopFn).toHaveBeenCalledTimes(1);

    // Fast-forward another second -> runs loopFn again, returns null, terminates
    jest.advanceTimersByTime(1000);
    expect(loopFn).toHaveBeenCalledTimes(2);

    // Fast-forward another second -> should not run anymore
    jest.advanceTimersByTime(1000);
    expect(loopFn).toHaveBeenCalledTimes(2);
    expect(timer.hasTerminated()).toBe(true);
  });
});
