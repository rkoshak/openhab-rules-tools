const {timeUtils, timerMgr} = require('openhab_rules_tools');

/**
 * Class that can be used to schedule a command or update to be sent to an Item later.
 */
class Deferred {
  
  /**
   * Constructor
   */
  constructor() {
    this.timers = new timerMgr.TimerMgr();
  }

  /**
   * Implements the command or update.
   * @param {string} name of the Item
   * @param {string} value command or update to send
   * @param {boolean} isCommand when true, value will be sent as a command, otherwise posted as an update
   */
  _timerBodyGenerator(target, value, isCommand) {
    const item = items.getItem(target);
    return () => (isCommand) ? item.sendCommand(value) : item.postUpdate(value);
  }

  /**
   * Creates a timer to command or update the update after a time. If the when
   * is before now, sendCommand or postUpdate immediately.
   * @param {string} target name of the Item to update or command
   * @param {string} value command or update to sendGatekeeper
   * @param {*} when timeUtils.toDateTime compatible duration or date/time
   * @param {boolean} isCommand when true value is sent as a command
   */
  defer(target, value, when, isCommand) {
    const triggerTime = timeUtils.toDateTime(when);
    if(triggerTime.isBefore(time.ZonedDateTime.now())) {
      triggerTime = time.ZonedDateTime.now();
    }
    this.timers.cancel(target);
    this.timers.check(target, triggerTime, this._timerBodyGenerator(target, value, isCommand, when), false);
  }

  /**
   * Cancels the deferred actions for target, if there is one.
   * @param {string} target name of the Item
   */
  cancel(target) {
    this.timers.cancel(target);
  }

  /**
   * Cancels all the deferred actions.
   */
  cancelAll() {
    this.timers.cancelAll();
  }
}

module.exports = {
  Deferred
}