const {timeUtils} = require('openhab_rules_tools');

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
    this.until = time.ZonedDateTime.now().minusSeconds(1);
  }

  /**
   * @param {function()} func action to run if it's been long enough
   * @when {*} anything supported by timeUtils.toDateTime
   */
  run(func, when) {
    if(time.ZonedDateTime.now().isAfter(this.until)) {
      this.until = timeUtils.toDateTime(when);
      func();
    }
  }
}

module.exports = {
  RateLimit
}