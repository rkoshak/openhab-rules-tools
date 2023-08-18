const { time } = require('openhab');
const helpers = require('./helpers');

/**
 * Class that implements the Gatekeeper design pattern. When the user calls
 * addCommand, it will queue them up so that a new command is not called until
 * the time specified by the previous command has passed.
 */
class Gatekeeper {

  /**
   * Creates the Gatekeeper
   *
   * @param {string} [name] name of the Gatekeeper (used for the timer)
   */
  constructor(name) {
    var ArrayDeque = Java.type('java.util.ArrayDeque');
    this.commands = new ArrayDeque();
    this.timer = null;
    this.name = name;
  }

  /**
   * Processes a command from the queue and creates a timer to call the next
   * command.
   * @parm {*} ctx pointer to the Gatekeeper OPbject.
   * @returns {function} function called by the timer to process the next command.
   */
  #procCommandGenerator(ctx) {
    return () => {

      // no more commands
      if (ctx.commands.isEmpty()) {
        ctx.timer = null;
      }

      // pop the command and run it
      else {
        const command = ctx.commands.pop();
        const func = command[1];
        const before = time.toZDT();
        func();
        const after = time.toZDT();

        const delta = time.Duration.between(before, after);
        const pause = time.toZDT(command[0]);
        const triggerTime = pause.minus(delta);

        ctx.timer = helpers.createTimer(triggerTime, ctx.#procCommandGenerator(ctx), this.name, 'gatekeeper');
      }

    };
  }

  /**
   * Add a command to the queue of commands. Gatekeeper will wait until pause
   * before it will call the next command in the queue.
   * @param {*} a date time or duration supported by time.toZDT
   * @param {function} a funuction to call
   */
  addCommand(pause, command) {
    this.commands.add([pause, command]);
    if (this.timer === null || this.timer.hasTerminated()) {
      this.#procCommandGenerator(this)();
    }
  }

  /**
   * Cancels all queued commands.
   */
  cancelAll() {
    if (this.timer !== null) {
      this.timer.cancel();
    }
    this.commands.clear();
  }
}

/**
 * The Gatekeeper will ensure that a certain amount of time passes between
 * commands.
 * @param {String} name optional and used in error messages
 * @returns a new Gatekeeper instance
 */
function getGatekeeper(name) {
    return new Gatekeeper(name);
}

module.exports = {
  Gatekeeper,
  getGatekeeper
}
