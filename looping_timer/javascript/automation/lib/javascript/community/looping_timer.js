/**
 * Constructor, initializes the logger, imports the needed stuff and creates an empty timer.
 */
var LoopingTimer = function() {
    'use strict';
    var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
    this.log = Java.type("org.slf4j.LoggerFactory").getLogger("org.openhab.model.script.Rules.LoopingTimer");
    this.log.debug("Building Looping Timer instance.");
    this.timer;
    this.log.debug("Loading timeUtils");
    load(OPENHAB_CONF+'/automation/lib/javascript/community/timeUtils.js');
    this.ScriptExecution = Java.type("org.openhab.core.model.script.actions.ScriptExecution");
    this.log.debug("Looping Timer is ready to operate");
  }
  
  
  /**
  
   * @param {*} when Optional time when to kick off the first call to function.
              It can be any of the forms supported by to_datetime in time_utils
              (e.g. "1s"). If None is passed the lambda will be called immediately.
   * @param {*} func The function to call when the timer goes off. The
              function must return the time for the next time the timer should run
              (see when below). If None is returned the timer will not be
              rescheduled.
   */
  LoopingTimer.prototype.loop = function(func, when) {
    this.log.debug("Looping timer - loop called");
    
    this.func = func;
    
    if (when === undefined) this.expired(); 
    else this.ScriptExecution.createTimerWithArgument(toDateTime(when), this,  function(context) { context.expired(); } );
     
  }
  
  
  /**
   * Called when the timer expired, reschedules if necessary
   */
  LoopingTimer.prototype.expired = function() {
      var when = this.func();
      if (when !== undefined){
          this.timer = this.ScriptExecution.createTimerWithArgument(toDateTime(when), this,  function(context) { context.expired(); } );
      }
  }
  
  /**
   * Cancels the running timer.
   */
  LoopingTimer.prototype.cancel = function() {
      
      if (this.timer !== undefined && !(this.hasTerminated()) ){
          this.timer.cancel();
      }
  }
  
  /**
   * Returns True if the timer doesn't exist or it has terminated.
   */
  LoopingTimer.prototype.hasTerminated = function() {
      
      return (this.timer === undefined || this.timer.hasTerminated()) ? true : false;
  }
  
  
  
  