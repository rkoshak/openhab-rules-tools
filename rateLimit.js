const {timeUtils} = require('openhab_rules_tools');

class RateLimit {

  constructor() {
    this.until = time.ZonedDateTime.now().minusSeconds(1);
  }

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