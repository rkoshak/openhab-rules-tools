const { time } = require('openhab');

/**
 * Simple class that keeps track of a time. When run is called, a
 * when is passed indicating how much time to wait after that call
 * before calling the passed in func again.
 */
class RateLimit {

  /**
   * Initializes the delay to the past so the first call immediately runs
   */
  constructor() {
    this.until = time.toZDT().minusSeconds(1);
  }

  /**
   * @param {function()} func action to run if it's been long enough
   * @when {*} anything supported by time.toZDT
   */
  run(func, when) {
    if (time.toZDT().isAfter(this.until)) {
      this.until = time.toZDT(when);
      func();
    }
  }
}

/**
 * The RateLimit class keeps track of when the last `run` was called and throws
 * away subsequent calls to run that occur before the passed in `when`.
 */
function getRateLimit() {
  return new RateLimit();
}

module.exports = {
  RateLimit,
  getRateLimit
}
