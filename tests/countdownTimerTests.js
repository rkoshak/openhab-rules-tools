var {countdownTimer, timeUtils, testUtils} = require('openhab_rules_tools');
var logger = log('rules_tools.Countdown Timer Tests');

cache.put(ruleUID, false);
var countItem = items.getItem('TestNumber');

function testFun() {
  logger.debug('Function called');
  cache.put(ruleUID, true);
}

function reset(testName) {
  countItem.postUpdate('UNDEF');
  cache.put(ruleUID, false);
  cache.put(testName, null);
}

// Test1: function is called
function test1() {
  let test1 = ruleUID+'_test1';
  reset(test1);
  logger.info('Running ' + test1);
  let timer = new countdownTimer.CountdownTimer('2s', testFun, countItem.name);
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(2200), () => {
    if(!cache.get(ruleUID)) cache.put(test1, test1 + ': Failed to call function ' + cache.get(ruleUID));
    else test2();
  });
}

// Test 2: function is called when there is a fraction of a second when
function test2() {
  let test2 = ruleUID+'_test2';
  logger.info('Running ' + test2);
  reset(test2);
  let timer = new countdownTimer.CountdownTimer(2100, testFun, countItem.name);
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(2300), () => {
    if(!cache.get(ruleUID)) cache.put(test2, test2 + ': Failed to call function');
    else if(!cache.get(test2)) test3();
  });
}

// Test 3: Count Item updated
function test3() {
  let test3 = ruleUID+'_test3';
  logger.info('Running ' + test3);
  reset(test3);
  let timer = new countdownTimer.CountdownTimer('4s', testFun, countItem.name);
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(100), () => {
    if(countItem.state != 4) cache.put(test3, test3 + ': Count Item is not 4 - ' + countItem.state);
  });
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(1100), () => {
    if(countItem.state != 3 && !cache.get(test3)) cache.put(test3, test3 + ': Count Item is not 3 - ' + countItem.state);
  });
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(2200), () => {
    if(countItem.state != 2 && !cache.get(test3)) cache.put(test3, test3 + ': Count Item is not 2 - ' + countItem.state + ' ' + (countItem.state != 2));
  });
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(3200), () => {
    if(countItem.state != 1 && !cache.get(test3)) cache.put(test3, test3 + ': Count Item is not 1 - ' + countItem.state);
  });
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(4200), () => {
    if(countItem.state != 0 && !cache.get(test3)) cache.put(test3, test3 + ': Count Item is not 0 - ' + countItem.state);
    else if(!cache.get(test3)) test4();
  });
}

// Test 4: Has Terminated
function test4() {
  let test4 = ruleUID+'_test4';
  logger.info('Running ' + test4);
  reset(test4);
  let timer = new countdownTimer.CountdownTimer('1s', testFun, countItem.name);
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(1100), () => {
    if(!timer.hasTerminated()) cache.put(test4, test4 + ': hasTerminated() did not return correct value');
    else if (cache.get(test4)) test5();
  });
}

// Test 5: Cancel
function test5() {
  let test5 = ruleUID+'_test5';
  logger.info('Running ' + test5);
  reset(test5);
  let timer = new countdownTimer.CountdownTimer('2s', testFun, countItem.name);
  testUtils.sleep(100);
  let oldVal = countItem.state;
  if(!countItem.state == '2') cache.put(test5, test5 + ': Count Item did not initialize to 2 - ' + countItem.state);
  logger.info('{} Cancelling timer', test5);
  timer.cancel();
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(2100), () => {
    if(!countItem.state == '0' && !cache.get(test5)) cache.put(test5, test5 + ': Cancelled timer did not reset count Item - ' + countItem.state);
    if(cache.get(ruleUID) && !cache.get(test5)) cache.put(test5, test5 + ': Function was called despite being cancelled');
  })
  
}

actions.ScriptExecution.createTimer(timeUtils.toDateTime(11000), () => {
  let success = true;
  for(let i = 0; i <= 5; i++) {
    let id = ruleUID+'_test'+i;
    if(cache.get(id)) {
      logger.error(cache.get(id));
      success = false;
      cache.put(id, null);
    }
  }
  if(success) logger.info('CountdownTimer tests completed successfully');
});

test1();