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
   * @param {string} [key] key for the backing map in the cache
   * @param {object} [cacheObj] cache object to use (defaults to cache.private if key is provided)
   */
  constructor(key, cacheObj) {
    // Stores the timer and the functions:
    // - timer: timer Object
    // - notFlapping: function to call when timer expires
    // - flapping: function to call when check is called and timer already exists
    this.timers = helpers.getBackingMap(key, cacheObj);
    this.callbacks = {};
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
   * @param {boolean}[recreate=false] optional flag, when present and true the timer will be recreated with the new values instead of cancelled, evaluated after reschedule
   */
  check(key, when, func, reschedule, flappingFunc, name, recreate) {
    const timeout = time.toZDT(when);

    // timer exists
    if (this.hasTimer(key)) {
      if (reschedule) {
        this.timers.get(key).reschedule(timeout);
      }
      else {
        this.cancel(key);
      }
      if (flappingFunc) {
        flappingFunc();
      }
      if (recreate) {
        this.check(key, when, func, reschedule, flappingFunc, name, false);
      }
    }

    // timer doesn't already exist, create a new one
    else {
      var timer = helpers.createTimer(when, () => {
        // Call the passed in func when the timer expires.
        if (this.hasTimer(key)) {
          const callback = this.callbacks[key];
          if (callback) {
            callback();
          }
        }
        // Clean up the timer from the manager.
        if (this.hasTimer(key)) {
          this.timers.remove(key);
        }
        if (this.callbacks) {
          delete this.callbacks[key];
        }
      }, name, key);
      this.timers.put(key, timer);
      this.callbacks[key] = (func) ? func : this.#noop;
    }
  }

  /**
   * @param {*} key name of the timer
   * @returns {boolean} true if there is a timer assocaited with key
   */
  hasTimer(key) {
    return this.timers.containsKey(key);
  }
	
  /**
   * @param {*} key name of the timer
   * @returns {Duration} of time left in the timer function
   * or null if timer does not exist
   */
  getTimerDuration(key) {
    if (this.hasTimer(key)) {
      return time.Duration.between(time.toZDT(), time.toZDT(this.timers.get(key).getExecutionTime()));
    }

    return null;
  }

  /**
   * If there is a timer assocaited with key, cancel it.
   * @param {*} key name of the timer
   */
  cancel(key) {
    if (this.hasTimer(key)) {
      const timer = this.timers.get(key);
      if (timer) {
        timer.cancel();
      }
      this.timers.remove(key);
      if (this.callbacks) {
        delete this.callbacks[key];
      }
    }
  }

  /**
   * Cancels all existing timers. Any timer that is actively running or
   * has just terminated will be skipped and cleaned up in the _notFlapping
   * method.
   */
  cancelAll() {
    const iterator = this.timers.keySet().iterator();
    while (iterator.hasNext()) {
      const key = iterator.next();
      const t = this.timers.get(key);
      if (t && !t.hasTerminated() && !t.isRunning()) {
        t.cancel();
      }
    }
    this.timers.clear();
    this.callbacks = {};
  }
}

/**
 * The TimerMgr handles the book keeping to manage a bunch of timers identified
 * with a unique key.
 */
function getTimerMgr (key, cacheObj) {
    return new TimerMgr(key, cacheObj);
}

module.exports = {
  TimerMgr,
  getTimerMgr
}
