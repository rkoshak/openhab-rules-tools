const assert = (condition, message) => {
  if(!condition) {
    throw new Error(message || 'Assertion failed');
  }
}
  
const sleep = (msec) => {
  var curr = time.ZonedDateTime.now();
  var done = curr.plus(msec, time.ChronoUnit.MILLIS);
  var timeout = curr.plusSeconds(5);
  while (curr.isBefore(done) && curr.isBefore(timeout)) { // busy wait
    curr = time.ZonedDateTime.now();
  }
  if(curr.isAfter(timeout)) console.error('sleep timed out!');
}

module.exports = {
  assert,
  sleep
}