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
 * Constructor initializes the internal logger and creates the queue of commands.
 */
var Gatekeeper = function() {
  'use strict';

  var ArrayDeque = Java.type("java.util.ArrayDeque");

  var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
  load(OPENHAB_CONF+"/automation/lib/javascript/community/timeUtils.js");
  this.log = Java.type("org.slf4j.LoggerFactory").getLogger("org.openhab.model.script.Rules.Gatekeeper");

  this.log.debug("Building the Gatekeeper object.");
  this.commands = new ArrayDeque();
  this.timer = null;

  this.log.debug("Gatekeeper is ready to operate");
}

/**
 * Generates the function that processes a command and creates a timer to sleep
 * for the requested amount of time before running the next one.
 *
 * @param {*} context Ensures that all the data members of the Object are available in the timer
 * @returns {function()}
 */
Gatekeeper.prototype._proc_command_generator = function(context){

  context.log.debug("Generating timer function");

  return function() {

    context.log.debug("Processing a command");
  
    var ZDT = Java.type("java.time.ZonedDateTime");
    var Duration = Java.type("java.time.Duration");
    var ScriptExecution = Java.type("org.openhab.core.model.script.actions.ScriptExecution");
  
    // No more commands
    if(context.commands.isEmpty()) {
      context.log.debug("No more commands to process");
      context.timer = null;
    }
    else {
      // Pop the command and run it
      var cmd = context.commands.pop();
      var funct = cmd[1];
      var before = ZDT.now();
      funct();
      var after = ZDT.now();
    
      // Calculate how long to sleep
      var delta = Duration.between(before, after);
      context.log.debug("The function took " + delta + " to run.");
      var pause = toDateTime(cmd[0]);
      var triggerTime = pause.minus(delta);
      context.log.debug("Next command will be processed at " + triggerTime);
    
      // Create the Timer for the next run
      context.timer = ScriptExecution.createTimer(triggerTime, context._proc_command_generator(context));
    }
  }
}

/**
 * Add a command to the queue. If the Timer isn't running execute the command
 * immediately.
 *
 * @param {*} pause any value supported by timeUtils, the amount of time to wait after running command before running the next command
 * @param {function()} command a function to call when allowed
 */
Gatekeeper.prototype.addCommand = function(pause, command) {
  this.log.debug("Adding a command to the queue");
  this.commands.add([pause, command]);
  if(this.timer === null || this.timer.hasTerminated()) {
    this.log.debug("Kicking off the processing timer");
    this._proc_command_generator(this)();
  }
}

/**
 * Clears out any commands that are scheduled to run.
 */
Gatekeeper.prototype.cancelAll = function() {
  if(this.timer !== null) {
    this.timer.cancel();
  }
  this.commands.clear();
}