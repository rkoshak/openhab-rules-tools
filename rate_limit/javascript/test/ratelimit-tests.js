var logger = Java.type("org.slf4j.LoggerFactory").getLogger("org.openhab.model.script.Rules.Tests");

logger.info("Loading the library");
var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
logger.info("Loading rateLimit");
load(OPENHAB_CONF+'/automation/lib/javascript/community/rateLimit.js');

logger.info("Creating rateLimit");

var func_called = false;

var test = function() {
  func_called = true;
}

var assert = function(expected, msg, testNum){
  if(func_called != expected) {
    logger.error("[Test " + testNum +"]: Expected " + expected + " Actual " + func_called + ": " + msg);
    return false;
  }
  return true;
}


logger.info("Starting rateLimit tests");
var rl = new RateLimit();
var cont = true;

// First run calls func
rl.run(test, 2);
cont = assert(true, "First run function was not called", "1");

// Calling after 2 second wait func is called
if(cont) {
  func_called = false;
  rl.run(test, "2s");
  cont = assert(true, "First run function was not called", "2a");
}
if(cont) {
  func_called = false;
  java.lang.Thread.sleep(2000);
  rl.run(test, 2);
  cont = assert(true, "Second run after 2 seconds function was not called", "2b");
}

// If called before time's up fun is not called
if(cont){
  func_called = false;
  rl.run(test, "2s");
  cont = assert(true, "First run dunction was not called", "3a");
}
if(cont) {
  func_called = false;
  rl.run(test, "2s");
  cont = assert(false, "Second run function was called when it was too soon", "3b");
}

if(cont) {
  logger.info("All tests passed");
}
else {
  logger.error("Tests failed");
}