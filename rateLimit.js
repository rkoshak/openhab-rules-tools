const {timeUtils} = require('openhab_rules_tools');

class RateLimit {

  constructor() {
    this.until = this.ZonedDateTime.now().minusSeconds(1);
  }

  run(func, when) {
    if(this.ZonedDateTime.now().isAfter(this.until)) {
      this.until = timeUtils.toDateTime(when);
      func();
    }
  }
}
