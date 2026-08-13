const { CountdownTimer } = require('../../countdownTimer');
const { items } = require('openhab');

describe('CountdownTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    items._clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('updates countItem every second and calls function', () => {
    const callback = jest.fn();
    const countItem = items.getItem('TestCountItem');
    countItem.postUpdate('UNDEF');

    // Create a countdown timer for 3 seconds
    const timer = new CountdownTimer('PT3s', callback, 'TestCountItem');

    // Initially, should update the item with the starting seconds
    expect(countItem.state).toBe('3');

    // Fast-forward 1 second
    jest.advanceTimersByTime(1000);
    expect(countItem.state).toBe('2');

    // Fast-forward another second
    jest.advanceTimersByTime(1000);
    expect(countItem.state).toBe('1');

    // Fast-forward another second
    jest.advanceTimersByTime(1000);
    expect(countItem.state).toBe('0');
    expect(callback).toHaveBeenCalledTimes(1);
    expect(timer.hasTerminated()).toBe(true);
  });

  test('can be cancelled', () => {
    const callback = jest.fn();
    const timer = new CountdownTimer('PT3s', callback, 'TestCountItem');

    jest.advanceTimersByTime(1000);
    expect(timer.cancel()).toBe(true);
    expect(callback).not.toHaveBeenCalled();
  });
});
