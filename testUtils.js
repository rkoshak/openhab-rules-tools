const { time } = require('openhab');

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

const sleep = (msec) => {
  let curr = time.toZDT();
  const done = curr.plus(msec, time.ChronoUnit.MILLIS);
  const timeout = time.toZDT('PT5s');
  while (curr.isBefore(done) && curr.isBefore(timeout)) { // busy wait
    curr = time.toZDT();
  }
  if (curr.isAfter(timeout)) console.error('sleep timed out!');
}

module.exports = {
  assert,
  sleep
}