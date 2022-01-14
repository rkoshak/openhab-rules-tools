var {rateLimit, testUtils} = require('openhab_rules_tools');

var logger = log('rules_tools.RateLimit Tests');

var funcCalled = false;

var test = () => funcCalled = true;

var rl = new rateLimit.RateLimit();

logger.info('Starting RateLimit tests');

// Test 1: called first time
rl.run(test, 2);
testUtils.assert(funcCalled, 'Test 1: First run function was not called');

// Test 2: calling after 2 second wait func is called
funcCalled = false;
testUtils.sleep(2);
rl.run(test, '2s');
testUtils.assert(funcCalled, 'Test 2: First run function was not called');
funcCalled = false
testUtils.sleep(2000);
rl.run(test, 2);
testUtils.assert(funcCalled, 'Test 2: Second run was not calle after two seconds');

// Test 3: calling before wait func is not called
funcCalled = false;
testUtils.sleep(2);
rl.run(test, '2s');
testUtils.assert(funcCalled, 'Test 3: First run function was not called');
funcCalled = false;
rl.run(test, '2s');
testUtils.assert(!funcCalled, 'Test 3: Second run function was called before wait time');

logger.info('All tests have passed');