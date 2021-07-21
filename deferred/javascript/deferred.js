var Deferred = function() {
    'use strict';
  
    var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
    this.ZonedDateTime = Java.type("java.time.ZonedDateTime");
    this.log = Java.type("org.slf4j.LoggerFactory").getLogger("org.openhab.model.script.Rules.Deferred");
    this.log.info("Building the Deferred object.");
    load(OPENHAB_CONF+'/automation/lib/javascript/community/timerMgr.js');
    this.timers = new TimerMgr();	
    this.log.info("Deferred is ready to operate");
  }
  
  Deferred.prototype._timerBodyGenerator = function(target, value, isCommand, time, log) {
    return function() {
      log.info(((isCommand) ? "Commanding " : "Updating ") + target + " to " + value + " after " + time);
      (isCommand) ? events.sendCommand(target, value) : events.postUpdate(target, value);
    }	  
  }
  
  Deferred.prototype.defer = function(target, value, when, isCommand) {
    var triggerTime = toDateTime(when);
    if(triggerTime.isBefore(this.ZonedDateTime.now())) {
      triggerTime = this.ZonedDateTime.now();
    }
  
    this.timers.check(target, triggerTime, 
                      this._timerBodyGenerator(target, value, isCommand, when, this.log), 
                      true,
                      function() { this.log.info("There is already a timer set for " + target + ", rescheduling"); });	
  }	
  
  Deferred.prototype.cancel = function(target){
    this.timers.cancel(target);	 
  }
  
  Deferred.prototype.cancelAll = function() {
    this.timers.cancelAll()
  }