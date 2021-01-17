/**
 * Constructor, initializes the logger, imports the needed stuff and creates an empty timers dict.
 */
var TimerMgr = function() {
  'use strict';
  var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
  this.log = Java.type("org.slf4j.LoggerFactory").getLogger("org.openhab.model.script.Rules.TimerMgr");
  this.log.debug("Building timerMgr instance.");
  this.timers = {};
  this.log.debug("Loading timeUtils");
  load(OPENHAB_CONF+'/automation/lib/javascript/community/timeUtils.js');
  this.ScriptExecution = Java.type("org.openhab.core.model.script.actions.ScriptExecution");
  this.log.debug("Timer Mgr is ready to operate");
}

/**
 * Private function that gets called when the timer expires. It does some cleanup and executes
 * the passed in timer lambda, if there was one.
 * @param {*} the unique name for the timer, can be anything supported by a dict but will usually be a string
 */
TimerMgr.prototype._notFlapping = function(key) {
  this.log.debug("Timer expired for " + key);
  if (key in this.timers && "notFlapping" in this.timers[key]) {
    this.log.debug("Calling expired function " + this.timers[key]["notFlapping"]);
    this.timers[key]["notFlapping"](key);
  }
  if (key in this.timers){
    this.log.debug("Deleting the expired timer");
    delete this.timers[key];
  }
},

/**
 * Private function that does nothing. Used when the user didn't pass in a function to call
 * when the timer expires.
 */
TimerMgr.prototype._noop = function() { },

/**
 * Call when one wants to create a timer or check to see if a timer is already created. 
 * Depending on the arguments, a new timer may be created, an existing timer rescheduled,
 * and if the timer already exists, a flapping function called. This lets one do something
 * when the timer already exists or when the timer expires.
 * 
 * @param {*} key the unique ID for the timer, usually an Item name
 * @param {*} when any representation of time supported by timeUtils.toDateTime
 * @param {*} func function called when the timer expires
 * @param {*} reschedule defaults to false, when true if the timer already exists it wilol be rescheduled
 * @param {*} flappingFunc optional function to call when the timer already exists.
 */
TimerMgr.prototype.check = function(key, when, func, reschedule, flappingFunc) {
  this.log.debug("Timer manager check called");
  if (reschedule === undefined) reschedule = false;

  var timeout = toDateTime(when);
  this.log.debug("Timer to be set for " + timeout.toString());

  // Timer exists
  if (key in this.timers){
    if (reschedule){
      this.log.debug("Rescheduling timer " + key + " for  " + timeout.toString());
      this.timers[key]["timer"].reschedule(timeout);
    }
    else {
      this.log.debug("Cancelling timer " + key);
      this.cancel(key);
    }
    if (flappingFunc !== undefined){
      this.log.debug("Running flapping function for " + key);
      flappingFunc();
    }
  }
  
  // Timer doesn't already exist, create one
  else {
    this.log.debug("Creating timer for " + key);
    var timer = this.ScriptExecution.createTimerWithArgument(timeout, this, function(context) { context._notFlapping(key); });
    this.timers[key] = { "timer": timer,
                         "flapping": flappingFunc,
                         "notFlapping": (func !== undefined) ? func : this._noop }
    this.log.debug("Timer created for " + key);
  }
},

/**
 * @param {*} key unique name for the timer
 * @return true if the timer exitst, false otherwise
 */
TimerMgr.prototype.hasTimer = function(key) {
  return key in this.timers;
},

/**
 * Cancels the timer by the passed in name if it exists
 * @param {*} key  unique name for the timer
 */
TimerMgr.prototype.cancel = function(key) {
  if (key in this.timers) {
    this.timers[key]["timer"].cancel();
    delete this.timers[key];
  }
},

/**
 * Cancels all the timers.
 */
TimerMgr.prototype.cancelAll = function() {
  for (key in this.timers) {
    if (!this.timers[key]["timer"].hasTerminated()) {
      this.log.debug("Timer has not terminated, cancelling timer " + key);
      this.cancel(key);
    }
    delete this.timers[key];
    this.log.debug("Timer entry has been deleted for " + key);
  }
}
