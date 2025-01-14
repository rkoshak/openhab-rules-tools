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
    this.name = name;
    if (!when) this.expired();
    else {
      this.timer = helpers.createTimer(when, () => this.expired(), name, 'loopingTimer');
    }
  }

  /**
   * Called when the timer expires. Calls the passed in function and
   * reschedules it based on the returned when value, or ends if null was
   * returned.
   * @throws exception when the time returned by the looping function is in the past
   */
  expired() {
    const when = this.func();
    if (when) {
      const nextRun = time.toZDT(when);
      if (nextRun.isAfter(time.toZDT())) {
        this.timer = helpers.createTimer(nextRun.toString(), () => this.expired(),
          this.name, 'loopingTimer');
      }
      else {
        throw 'when ' + when + ' returned by the loop function is in the past!';
      }
    }
  }
  
  /**
   * @returns {Duration} of time left in the current loop of the timer
   * if it returns null LoopingTimer hasn't been started yet
   * if it returns a positive duration the next iteration of the loop is scheduled
   * if it returns a negative duration the loop has exited and the duration is how long ago it exited the loop.
   */
  getDuration() {
    if (this.timer) {
      return time.Duration.between(time.toZDT(), this.timer.getExecutionTime());
    }
    
    return null;
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

/**
 * @returns a timer that resheduels itself until the passed in looping function
 * return null
 */
function getLoopingTimer() {
  return new LoopingTimer();
}

module.exports = {
  LoopingTimer,
  getLoopingTimer
}
