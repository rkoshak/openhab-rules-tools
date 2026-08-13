const { Deferred } = require('../../deferred');
const { items } = require('openhab');

describe('Deferred', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    items._clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('defers a command and executes it on the Item', () => {
    const def = new Deferred();
    const testItem = items.getItem('MyTestItem');
    testItem.postUpdate('UNDEF');

    // Defer posting 'ON' to MyTestItem in 5 seconds
    def.defer('MyTestItem', 'ON', 'PT5s', true);

    expect(testItem.state).toBe('UNDEF');

    // Fast-forward 4 seconds
    jest.advanceTimersByTime(4000);
    expect(testItem.state).toBe('UNDEF');

    // Fast-forward to 5 seconds
    jest.advanceTimersByTime(1000);
    expect(testItem.state).toBe('ON');
  });

  test('defers an update and executes it on the Item', () => {
    const def = new Deferred();
    const testItem = items.getItem('MyTestItem');
    testItem.postUpdate('UNDEF');

    // Defer posting 'OFF' as an update
    def.defer('MyTestItem', 'OFF', 'PT2s', false);

    jest.advanceTimersByTime(2000);
    expect(testItem.state).toBe('OFF');
  });
});
