/**
 * Class that handles deferring a command or update action until a later time.
 */
var Deferred = function() {
    'use strict';
  
    var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
    this.ZonedDateTime = Java.type("java.time.ZonedDateTime");
    this.log = Java.type("org.slf4j.LoggerFactory").getLogger("org.openhab.model.script.Rules.Deferred");
    this.log.debug("Building the Deferred object.");
    load(OPENHAB_CONF+'/automation/lib/javascript/community/timerMgr.js');
    this.timers = new TimerMgr();	
    this.log.debug("Deferred is ready to operate");
  }
 
  /**
   * Generates the function that gets called when the timer expires.
   * 
   * @param {string} target The name of the Item
   * @param {string} value The command or update to send to the Item
   * @param {boolean} isCommand when true value will be sent to target as a command, as an update when false
   * @param {Logger} log this class's internal logger
   * @returns function with no arguments that sends a command or update to target 
   */
  Deferred.prototype._timerBodyGenerator = function(target, value, isCommand, time, log) {
    return function() {
      log.debug(((isCommand) ? "Commanding " : "Updating ") + target + " to " + value + " after " + time);
      (isCommand) ? events.sendCommand(target, value) : events.postUpdate(target, value);
    }	  
  }

  /**
   * Generates the function that gets called when a timer is rescheduled.
   * 
   * @param {String} target name of the Item
   * @param {Logger} log this class's internal logger
   */
  Deferred.prototype._rescheduledBodyGenerator = function(target, log){
    return function() {
      log.debug("There is already a timner set for " + target + ", rescheduling");
    }
  }

  /**
   * Waits up to the given amount of time to send a command or update to an Item.
   * 
   * @param {string} target name of the Item
   * @param {string} value state or command to send
   * @param {*} when any representation of time supported by time_utils
   * @param {boolean} isCommand optional flag when true causes the value to be sent as a command
   */
  Deferred.prototype.defer = function(target, value, when, isCommand) {
    var triggerTime = toDateTime(when);
    if(triggerTime.isBefore(this.ZonedDateTime.now())) {
      triggerTime = this.ZonedDateTime.now();
    }
    
    this.timers.check(target, triggerTime, 
                      this._timerBodyGenerator(target, value, isCommand, when, this.log),
                      true,
                      this._rescheduledBodyGenerator(target, this.log));
  } 

  /**
   * Cancel the deferred action for target
   * 
   * @param {*} target name of the Item
   */
  Deferred.prototype.cancel = function(target){
    this.timers.cancel(target);	 
  }
  
  /**
   * Cancels all the deferred actions.
   */
  Deferred.prototype.cancelAll = function() {
    this.timers.cancelAll()
  }