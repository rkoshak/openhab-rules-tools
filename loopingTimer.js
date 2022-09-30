const helpers = require('./helpers');

/**
 * Implements a looping Timer which is passed a function that is expected to return
 * a when supported by time.toZDT. The loop will reschedule the timer based
 * on that returned when or, if it return null the looping stops.
 */
class LoopingTimer {

  /**
   * Constructor
   */
  constructor() {
    // noop
  }

  /**
   * Kicks off the timer loop. Schedules a timer to call func at when
   * @param {function} func function to call at when, must return a when to continue the loop or null to stop
   * @param {*} when any of the types supported by time.toZDT
   * @param {string} [name] timer name displayed in openHAB
   */
  loop(func, when, name) {

    this.func = func;
    if (!when) this.expired();
    else {
      this.timer = helpers.createTimer(when, () => this.expired(), null, name);
    }
  }

  /**
   * Called when the timer expires. Calls the passed in function and
   * reschedules it based on the returned when value, or ends if null was
   * returned.
   */
  expired() {
    var when = this.func();
    if (when) {
      this.timer = actions.ScriptExecution.createTimer(
        time.toZDT(when),
        () => this.expired(), null, null, 'loopingTimer');
    }
  }

  /**
   * Cancels the timer if it exists and hasn't already terminated.
   */
  cancel() {
    if (this.timer && !this.hasTerminated()) {
      this.timer.cancel();
    }
  }

  /**
   * Returns true of the timer doesn't exist or has terminated.
   */
  hasTerminated() {
    return !this.timer || this.timer.hasTerminated();
  }
}

module.exports = {
  LoopingTimer
}