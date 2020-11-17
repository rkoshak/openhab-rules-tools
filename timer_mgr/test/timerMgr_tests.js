var logger = Java.type("org.slf4j.LoggerFactory").getLogger("org.openhab.model.script.Rules.Tests");

logger.info("Loading the library");
var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
logger.info("Loading timerMgr");
load(OPENHAB_CONF+'/automation/lib/javascript/community/timerMgr.js');

logger.info("Creating timerMgr");
var ScriptExecution = Java.type("org.openhab.core.model.script.actions.ScriptExecution");
var timers = new TimerMgr();

var timer_expired_called = false;
var timer_running_called = false;

var timer_expired = function(){
  timer_expired_called = true;
}
var timer_running = function() {
  timer_running_called = true;
}

logger.info("Starting timerMgr tests");

var reset = function() {
  timer_expired_called = false;
  timer_running_called = false;
}
var test = function(key, exists, expired, flapping) {
  var ht = timers.hasTimer(key);
  if(ht != exists) {
    logger.error("Timer exists " + ht + " expected " + exists);
    return false;
  }
  if(timer_expired_called != expired) {
    logger.error("Expired called " + timer_expired_called + " expected " + expired);
    return false;
  }
  if(timer_running_called != flapping) {
    logger.error("Flapping called " + timer_running_called + " expected " + flapping);
    return false;
  }
  return true;
}

// timer was created
logger.info("----Testing timer creation");
timers.check("test", 1000, timer_expired);
java.lang.Thread.sleep(500);
var passed = test("test", true, false, false);

// timer expired
if(passed) {
  logger.info("----Testing timer expired");
  java.lang.Thread.sleep(600);
  passed = test("test", false, true, false);
}

// flapping
if(passed) {
  logger.info("----Testing flapping detection");
  reset();
  timers.check("test", "1s", timer_expired, undefined, timer_running);
  java.lang.Thread.sleep(500);
  passed = test("test", true, false, false);
}
if(passed) {
  timers.check("test", "1s", timer_expired, undefined, timer_running);
  passed = test("test", false, false, true); 
}

// Test that if no function is passed we can call timer_running
if(passed) {
  logger.info("----Testing only flapping function");
  reset();
  timers.check("test", "1s", undefined, undefined, timer_running);
  java.lang.Thread.sleep(500);
  passed = test("test", true, false, false);
}
if(passed) {
  java.lang.Thread.sleep(510);
  passed = test("test", false, false, false);
}

// Test timer get's rescheduled and timer_running and timer_expired both get called
if(passed) {
  logger.info("----Testing reschedule");
  reset();
  timers.check("test", "1s", timer_expired, true, timer_running);
  java.lang.Thread.sleep(500);
  passed = test("test", true, false, false);
}
if(passed) {
  timers.check("test", "1s", timer_expired, true, timer_running);
  java.lang.Thread.sleep(500);
  passed = test("test", true, false, true);
}
if(passed) {
  java.lang.Thread.sleep(510);
  passed = test("test", false, true, true);
}

// Test cancelTimer
if(passed) {
  logger.info("----Testing cancel");
  reset();
  timers.check("test", "1s", timer_running);
  java.lang.Thread.sleep(500);
  passed = test("test", true, false, false);
}
if(passed) {
  timers.cancel("test");
  passed = test("test", false, false, false);
}
if(passed) {
  java.lang.Thread.sleep(510);
  passed = test("test", false, false, false);
}

// Test cancelTimer on non-existing timer
if(passed) {
  logger.info("----Testing cancel non-existant timer");
  reset();
  passed = test("test", false, false, false);
}
if(passed) {
  timers.cancel("test");
  passed = test("test", false, false, false);
}

if(passed) {
  logger.info("-----------Done");
}
else {
  logger.info("----------Failed!");
}