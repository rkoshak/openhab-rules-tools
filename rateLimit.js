const { time } = require('openhab');
const helpers = require('./helpers');

/**
 * Simple class that keeps track of a time. When run is called, a
 * when is passed indicating how much time to wait after that call
 * before calling the passed in func again.
 */
class RateLimit {

  /**
   * Initializes the delay to the past so the first call immediately runs
   * @param {string} [key] key for the backing map in the cache
   * @param {object} [cacheObj] cache object to use (defaults to cache.private if key is provided)
   */
  constructor(key, cacheObj) {
    this.state = helpers.getBackingMap(key, cacheObj);
    if (!this.state.containsKey('until')) {
      this.state.put('until', time.toZDT().minusSeconds(1));
    }
  }

  get until() {
    return this.state.get('until');
  }

  set until(val) {
    if (val === null || val === undefined) {
      this.state.remove('until');
    } else {
      this.state.put('until', val);
    }
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
 * @param {string} [key] key for the backing map in the cache
 * @param {object} [cacheObj] cache object to use
 */
function getRateLimit(key, cacheObj) {
  return new RateLimit(key, cacheObj);
}

module.exports = {
  RateLimit,
  getRateLimit
}
