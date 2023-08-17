const { time } = require('openhab');

/**
 * If the condition is false, throw an exception with the message
 * @param {boolean} condition if true, do nothing
 * @param {string} message exception message if condition is false
 */
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Simple wrapper around javba.lang.Thread.sleep()
 *
 * @param {int} msec number of milliseconds to sleep
 */
const sleep = (msec) => {
  var Thread = Java.type('java.lang.Thread');
  Thread.sleep(msec);
}

module.exports = {
  assert,
  sleep
}