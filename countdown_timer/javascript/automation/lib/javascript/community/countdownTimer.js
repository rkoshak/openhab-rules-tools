/**
Copyright July 23, 2021 Richard Koshak

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * Class that creates a Timer that updates an Item with the number of remaining 
 * seconds on the timer updated every second.
 * 
 * @param {*} time the Timer time in any format supported by timeUtils
 * @param {function()} funct called when the timer expires
 * @param {String} countItem  name of the Item to post the number of remaining seconds on the timer
 */
var CountdownTimer = function(time, funct, countItem) {
  'use strict';

  // get the start and end times as soon as possible
  var ZDT = Java.type("java.time.ZonedDateTime");
  var start = ZDT.now();
  var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
  load(OPENHAB_CONF+"/automation/lib/javascript/community/timeUtils.js");
  this.end = toDateTime(time);

  var Duration = Java.type("java.time.Duration");
  var ScriptExecution = Java.type("org.openhab.core.model.script.actions.ScriptExecution");
  this.log = Java.type("org.slf4j.LoggerFactory").getLogger("org.openhab.model.script.Rules.Countdown Timer");

  this.ONE_SEC = Duration.ofSeconds(1);

  // run an independent timer to call the function
  this.timer = ScriptExecution.createTimer(this.end, funct);
  this.timeLeft = Duration.between(start, this.end);

  // start the countdown timer
  this.countItem = countItem;
  this.countDownTimer = null;
  this._iterateGenerator(this)();
}

/**
 * Called to update the Item with the amount of time left
 */
CountdownTimer.prototype._update_item = function() {
  var ZDT = Java.type("java.time.ZonedDateTime");
  var Duration = Java.type("java.time.Duration");
//  var timeLeft = Duration.between(ZDT.now(), this.end);
  var left = (this.timeLeft.compareTo(this.ONE_SEC) < 0) ? 0 : this.timeLeft.toSeconds();
  this.log.debug("Updating " + this.countItem + " to  " + left);
  events.postUpdate(this.countItem, ""+left);
}

/**
 * Creates the count timer's function which gets called once per second until
 * the timer expires.
 * 
 * @param {*} the Class's context
 */
CountdownTimer.prototype._iterateGenerator = function(context) {
  return function() {

    var ZDT = Java.type("java.time.ZonedDateTime");
    var Duration = Java.type("java.time.Duration");
    var ScriptExecution = Java.type("org.openhab.core.model.script.actions.ScriptExecution");
    context.log.debug("There is " + context.timeLeft + " time left on the timer");
    context._update_item();

    if(!context.timeLeft.isZero()) {

      var sleepTime = (context.timeLeft.compareTo(context.ONE_SEC) < 0) ? context.timeLeft : context.ONE_SEC;
      context.timeLeft = context.timeLeft.minus(sleepTime);

      context.log.debug("Rescheduling the timer for " + sleepTime);
      context.countDownTimer = ScriptExecution.createTimer(ZDT.now().plus(sleepTime), context._iterateGenerator(context));
    }
    else {
      context.log.debug("Times up!");
    }
  }
}

/**
 * Call to see if the timer has terminated.
 */
CountdownTimer.prototype.hasTerminated = function(){
  return this.timer.hasTerminated()
}

/**
 * Call to cancel the timer.
 */
CountdownTimer.prototype.cancel = function(){
  var Duration = Java.type("java.time.Duration");
  this.timeLeft = Duration.ofSeconds(0);
  this._update_item();
  this.countDownTimer.cancel();
  return this.timer.cancel();
}
