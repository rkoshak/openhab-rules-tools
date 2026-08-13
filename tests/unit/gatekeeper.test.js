const { Gatekeeper } = require('../../gatekeeper');

describe('Gatekeeper', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('queues and runs commands with correct delay', () => {
    const gk = new Gatekeeper('test-gk');
    const cmd1 = jest.fn();
    const cmd2 = jest.fn();

    // Add first command with 2-second pause
    gk.addCommand('PT2s', cmd1);
    expect(cmd1).toHaveBeenCalledTimes(1);
    expect(cmd2).not.toHaveBeenCalled();

    // Add second command with 1-second pause
    gk.addCommand('PT1s', cmd2);
    expect(cmd2).not.toHaveBeenCalled(); // Should not run yet!

    // Advance 1.5 seconds -> cmd2 still should not run
    jest.advanceTimersByTime(1500);
    expect(cmd2).not.toHaveBeenCalled();

    // Advance to 2 seconds -> cmd2 runs
    jest.advanceTimersByTime(500);
    expect(cmd2).toHaveBeenCalledTimes(1);
  });
});
