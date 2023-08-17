const { time } = require('openhab');
const helpers = require('./helpers');

/**
 * Implements a manager for Timers with a simple interface. Once built, call
 * check to create a timer or to reschedule the timer if it exists. Options
 * exist to call a function when the timer expires, when the timer already
 * exists, and a boolean to determine if the timer is rescheduled or not.
 */
class TimerMgr {

  /**
   * Constructor
   */
  constructor() {
    // Stores the timer and the functions:
    // - timer: timer Object
    // - notFlapping: function to call when timer expires
    // - flapping: function to call when check is called and timer already exists
    this.timers = {};
  }

  /**
   * Function to call when null was passed for the func or flappingFunc.
   */
  #noop() {
    // do nothing
  }

  /**
   * If there is no timer associated with key, create one to expire at when and
   * call func (or #noop if func is null).
   * If there is a timer already associted with key, if reschedule is not
   * supplied or it's false cancel the timer. If reschedule is true, reschedule
   * the timer using when.
   * If there is a timer already associated with key, if a flappingFunc is
   * provided, call it.
   * @param {string} key the identifier of the timer in the TimerMgr instance
   * @param {*} when any representation of time of duration, see time.toZDT
   * @param {function} func function to call when the timer expires
   * @param {boolean} [reschedule=false] optional flag, when present and true rescheudle the timer if it already exists
   * @param {function} [flappingFunc] optional function to call when the timer already exists
   * @param {string} [name] timer name displayed in openHAB
   */
  check(key, when, func, reschedule, flappingFunc, name) {
    const timeout = time.toZDT(when);

    // timer exists
    if (key in this.timers) {
      if (reschedule) {
        this.timers[key]['timer'].reschedule(timeout);
      }
      else {
        this.cancel(key);
      }
      if (flappingFunc) {
        flappingFunc();
      }
    }

    // timer doesn't already exist, create a new one
    else {
      var timer = helpers.createTimer(when, () => {
        // Call the passed in func when the timer expires.
        if (key in this.timers && 'notFlapping' in this.timers[key]) {
          this.timers[key]['notFlapping']();
        }
        // Clean up the timer from the manager.
        if (key in this.timers) {
          delete this.timers[key];
        }
      }, name, key);
      this.timers[key] = {
        'timer': timer,
        'flapping': flappingFunc,
        'notFlapping': (func) ? func : this.#noop
      };
    }
  }

  /**
   * @param {*} key name of the timer
   * @returns {boolean} true if there is a timer assocaited with key
   */
  hasTimer(key) {
    return key in this.timers;
  }

  /**
   * If there is a timer assocaited with key, cancel it.
   * @param {*} key name of the timer
   */
  cancel(key) {
    if (key in this.timers) {
      this.timers[key]['timer'].cancel();
      delete this.timers[key];
    }
  }

  /**
   * Cancels all existing timers. Any timer that is actively running or
   * has just terminated will be skipped and cleaned up in the _notFlapping
   * method.
   */
  cancelAll() {
    for (var key in this.timers) {
      var t = this.timers[key]['timer'];
      if (!t.hasTerminated() && !t.isRunning()) {
        this.cancel(key);
      }
      delete this.timers[key];
    }
  }
}

/**
 * The TimerMgr handles the book keeping to manage a bunch of timers identified
 * with a unique key.
 */
function getTimerMgr () {
    return new TimerMgr();
}

module.exports = {
  TimerMgr,
  getTimerMgr
}
