/**
 * A class that will limit how often an event can occur. One calls run and pass
 * a time_utils when to indicate how long before the call to run will run again.
 * If run is called before that amount of time then the call is ignored.
 */
 var RateLimit = function() {
    'use strict';
  
    var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
    this.ZonedDateTime = Java.type("java.time.ZonedDateTime");
    this.log = Java.type("org.slf4j.LoggerFactory").getLogger("org.openhab.model.script.Rules.RateLimit");
    this.log.debug("Building the RateLimit object.");
    load(OPENHAB_CONF+'/automation/lib/javascript/community/timeUtils.js');
    this.until = this.ZonedDateTime.now().minusSeconds(1);
    this.log.debug("RateLimit is ready to operate");
  }
  
  /**
   * Function called to attempt to run the passed in function. If enough time has
   * passed since the last time run was called func is called. If not the call is
   * ignored.
   * 
   * @param {function} func called if it's been long enough since the last call to run
   * @param {*} when any of the durations supported by time_utils.
   */
  RateLimit.prototype.run = function(func, when){
    var now = this.ZonedDateTime.now();
    if(now.isAfter(this.until)) {
      this.until = toDateTime(when);
      func();
    }
  }