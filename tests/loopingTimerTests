var {loopingTimer, testUtils} = require('openhab_rules_tools');
var logger = log('rules_tools.LoopingTimer Tests');
var ID = ruleUID+'_count';

var func = () => {
  var count = cache.get(ID);
  logger.debug('Incrementing count {}', count);
  cache.put(ID, ++count);
  if(count < 5) return '1s';
  else {
    logger.debug('Reached a count of 5, exiting');
    return null;
  }
}

var lt = new loopingTimer.LoopingTimer();
cache.put(ID, 0);
lt.loop(func, '0s');

actions.ScriptExecution.createTimer(time.ZonedDateTime.now().plusSeconds(6), () => {
  if(cache.get(ID) != 5) {
    logger.error('Count is not 5: {}', cache.get(ID));
  }
  else {
    logger.info('Looping timer tests completed successfully!');
  }
});