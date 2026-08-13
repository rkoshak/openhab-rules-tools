const { LoopingTimer } = require('openhab_rules_tools');
const { time, items, actions } = require('openhab');
const helpers = require('./helpers');

/**
 * Timer that updates a passed in Item with the number of seconds reamining on the
 * Timer once a second.
 */
class CountdownTimer {

  /**
   * Creates a timer to run func at when and a looping timer to update
   * countItem with the seconds remaining every second. Both timers start
   * immediately.
   * @param {*} when time.toZDT compatible time or duration
   * @param {function} func function to call at when
   * @param {string} countItem name of the Item to update with the seconds remaining
   * @param {string} [name] countdown name displayed in openHAB
   * @param {string} [key] key for the backing map in the cache
   * @param {object} [cacheObj] cache object to use (defaults to cache.private if key is provided)
   */
  constructor(when, func, countItem, name, key, cacheObj) {
    this.state = helpers.getBackingMap(key, cacheObj);
    this._cacheObj = cacheObj;

    if (when !== undefined) {
      if (key) this.state.put('ltKey', key + '_loop');
      this.start = time.toZDT();
      this.end = time.toZDT(when);
      this.ONE_SEC = time.Duration.ofSeconds(1);

      // Create a separate timer to run the func
      this.timer = actions.ScriptExecution.createTimer(this.end, func);
      this.timeLeft = time.Duration.between(this.start, this.end);

      // Start the countdown timer
      this.countItem = countItem;
      const ltKey = key ? key + '_loop' : undefined;
      this._countdownTimer = LoopingTimer(ltKey, cacheObj);
      this._countdownTimer.loop(this.#iterateGenerator(this), 0, name); // start now
    }
  }

  get start() { return this.state.get('start'); }
  set start(val) { if (val === null || val === undefined) this.state.remove('start'); else this.state.put('start', val); }

  get end() { return this.state.get('end'); }
  set end(val) { if (val === null || val === undefined) this.state.remove('end'); else this.state.put('end', val); }

  get ONE_SEC() { return this.state.get('ONE_SEC'); }
  set ONE_SEC(val) { if (val === null || val === undefined) this.state.remove('ONE_SEC'); else this.state.put('ONE_SEC', val); }

  get timer() { return this.state.get('timer'); }
  set timer(val) { if (val === null || val === undefined) this.state.remove('timer'); else this.state.put('timer', val); }

  get timeLeft() { return this.state.get('timeLeft'); }
  set timeLeft(val) { if (val === null || val === undefined) this.state.remove('timeLeft'); else this.state.put('timeLeft', val); }

  get countItem() { return this.state.get('countItem'); }
  set countItem(val) { if (val === null || val === undefined) this.state.remove('countItem'); else this.state.put('countItem', val); }

  get countdownTimer() {
    if (!this._countdownTimer) {
      const ltKey = this.state.get('ltKey');
      if (ltKey) {
        this._countdownTimer = LoopingTimer(ltKey, this._cacheObj);
      } else {
        this._countdownTimer = LoopingTimer();
      }
    }
    return this._countdownTimer;
  }
  set countdownTimer(val) {
    this._countdownTimer = val;
  }

  /**
   * Determines the number of seconds left and updates the count Item. If the
   * time left is less than a second, 0 is the value posted.
   * @param {CountdownTimer} ctx Context to access the timer information from inside the countdown Timer's lambda
   */
  #updateItem(ctx) {
    let left = (ctx.timeLeft.compareTo(ctx.ONE_SEC) < 0) ? 0 : ctx.timeLeft.seconds();
    items.getItem(ctx.countItem).postUpdate(left);
  }

  /**
   * Drives the looping timer that updates the countItem. Runs once a second until
   * the time has run out, calling updateItem each time.
   * @param {CountdownTimer} ctx Context to access the timer information from inside the looping timer
   */
  #iterateGenerator(ctx) {
    return () => {
      ctx.#updateItem(ctx);
      if (!ctx.timeLeft.isZero()) {
        let sleepTime = (ctx.timeLeft.compareTo(ctx.ONE_SEC) < 0) ? ctx.timeLeft : ctx.ONE_SEC;
        ctx.timeLeft = ctx.timeLeft.minusDuration(sleepTime);
        return 'PT1s';
      }
      else {
        return null;
      }
    }
  }

  /**
   * @returns {boolean} true when the timer has exited
   */
  hasTerminated() {
    return this.timer.hasTerminated();
  }

  /**
   * Cancels the running timer, if it's running.
   * @returns {boolean} true if timer was cancelled.
   */
  cancel() {
    this.timeLeft = time.Duration.ofSeconds(0);
    this.#updateItem(this);
    this.countDownTimer?.cancel();
    return this.timer.cancel();
  }
}

/**
 * A countdown timer updates an Item with the number of seconds left in the timer
 * once a second.
 * @param {*} when time.toZDT compatible time or duration
 * @param {function} func function to call at when
 * @param {string} countItem name of the Item to update with the seconds remaining
 * @param {string} [name] countdown name displayed in openHAB
 * @param {string} [key] key for the backing map in the cache
 * @param {object} [cacheObj] cache object to use
 * @returns a new CountdownTimer
 */
function getCountdownTimer(when, func, countItem, name, key, cacheObj) {
  return new CountdownTimer(when, func, countItem, name, key, cacheObj);
}

module.exports = {
  CountdownTimer,
  getCountdownTimer
}