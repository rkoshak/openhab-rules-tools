var {deferred, timeUtils, testUtils} = require('openhab_rules_tools');
var logger = log('rules_tools.Deferred Tests');

var deferred = new deferred.Deferred();

// Change this if you want to run the unit test
var testItem = items.getItem('aTestSwitch');

logger.info('Starting Deferred tests');

var reset = (testName) => {
  testItem.postUpdate('UNDEF');
  cache.put(testName, null);
}


// Test 1: Schedule
function test1() {
  let test1 = ruleUID+'_test1';
  reset(test1);
  deferred.defer(testItem.name, 'ON', '1s');
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(100), () => {
    if(!testItem.isUninitialized) cache.put(test1, test1 + ': Deferred updated ' + testItem + ' too soon!');
  });
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(1200), () => {
    if(testItem.state != 'ON' && !cache.get(test1)) cache.put(test1 + ': Deferred failed to update ' + testItem);
    else test2();
  });
  
}

// Test 2: Reschedule
function test2() {
  let test2 = ruleUID+'_test2';
  reset(test2);
  deferred.defer(testItem.name, 'OFF', '1s');
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(100), () => {
    if(!testItem.isUninitialized) cache.put(test2, test2 + ': Deferred updated ' + testItem + ' too soon!');
    else deferred.defer(testItem.name, 'ON', '2s');
  });
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(1100), () => {
    if(!testItem.isUninitialized && !cache.get(test2)) cache.put(test2, test2 + ': Failed to reschedule');
  });
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(2300), () => {
    if(testItem.state != 'ON' && !cache.get(test2)) cache.put(test2, test2 +': Did not update after reschedule');
    else test3();
  });
}

function test3() {
  let test3 = ruleUID+'_test3';
  reset(test3);
  deferred.defer(testItem.name, 'ON', '1s');
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(100), () => {
    deferred.cancel(testItem.name);
  });
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(1200), () => {
    if(!testItem.isUninitialized) cache.put(test3, test3 + ': Deferred was not cancelled');
    else test4();
  });
}

function test4() {
  let test4 = ruleUID+'_test4';
  reset(test4);
  deferred.defer(testItem.name, 'ON', '1s');
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(100), () => {
    deferred.cancelAll();
  });
  actions.ScriptExecution.createTimer(timeUtils.toDateTime(1200), () => {
    if(!testItem.isUninitialized) cache.put(test4, test4 + ': Cancel did not cancel all');
  });
}

actions.ScriptExecution.createTimer(timeUtils.toDateTime(7100), () => {
  let success = true;
  for(let i = 1; i <= 4; i++) {
    let id = ruleUID+'_test'+i;
    if(cache.get(id)) {
      logger.error(cache.get(id));
      success = false;
      cache.put(id, null);
    }
  }
  if(success) logger.info('Deferred tests completed successfully');
});

test1();
