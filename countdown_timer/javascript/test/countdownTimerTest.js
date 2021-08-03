var logger = Java.type("org.slf4j.LoggerFactory").getLogger("org.openhab.model.script.Countdown Timer Test");

var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
load(OPENHAB_CONF+'/automation/lib/javascript/community/countdownTimer.js');

var assert = function(expected, msg, count) {
  if(!expected) {
    logger.error("[Test " + count + "]: " + msg);
    return false;
  }
  logger.info("Test " + count + " passed");
  return true;
}

var funcCalled = false;
var test = function(){
  logger.info("Timer function called");
  funcCalled = true;
}

var number = "TestNumber";
var str = "TestString";

// TODO create the Items for the testing and delete when done.

logger.info("Test 1: seconds");
var timer = new CountdownTimer("2s", test, number);
java.lang.Thread.sleep(2200);
var cont = assert(funcCalled, "Function wasn't called when timer expired", "1");

if(cont){
  logger.info("Test 2: milliseconds");
  funcCalled = false;
  timer = new CountdownTimer(2100, test, number);
  java.lang.Thread.sleep(2300);
  cont = assert(funcCalled, "Function wasn't called when timer expired", "2");
}

if(cont){
  events.postUpdate(number, "0");
  funcCalled = false;
  logger.info("Test 3: number Item");
  cont = assert((items[number] == 0), "Number Item is not starting at 0: " + items[number], "3a");
  if(cont) {
    timer = new CountdownTimer("4s", test, number);
    java.lang.Thread.sleep(100);
    cont = assert((items[number] == 4), "Number Item is not 4: " + items[number], "3b");
  }
  if(cont){
    java.lang.Thread.sleep(1000);
    cont = assert((items[number] == 3), "Number Item is not 3: " + items[number], "3c");
  }
  if(cont){
    java.lang.Thread.sleep(1000);
    cont = assert((items[number] == 2), "Number Item is not 2: " + items[number], "3d");
  }
  if(cont){
    java.lang.Thread.sleep(1000);
    cont = assert((items[number] == 1), "Number Item is not 1: " + items[number], "3e");
  }
  if(cont){
    java.lang.Thread.sleep(1000);
    cont = assert((items[number] == 0), "Number Item is not 0: " + items[number], "3f");
  }
}

if(cont){
  events.postUpdate(str, "0");
  funcCalled = false;
  logger.info("Test 4: str Item");
  cont = assert((items[str] == "0"), "String Item is not starting at 0", "4a");
  if(cont) {
    timer = new CountdownTimer("4s", test, str);
    java.lang.Thread.sleep(150);
    cont = assert((items[str] == "4"), "String Item is not 4: " + items[str], "4b");
  }
  if(cont){
    java.lang.Thread.sleep(1000);
    cont = assert((items[str] == "3"), "String Item is not 3: " + items[str], "4c");
  }
  if(cont){
    java.lang.Thread.sleep(1000);
    cont = assert((items[str] == "2"), "String Item is not 2: " + items[str], "4d");
  }
  if(cont){
    java.lang.Thread.sleep(1000);
    cont = assert((items[str] == "1"), "String Item is not 1: " + items[str], "4e");
  }
  if(cont){
    java.lang.Thread.sleep(1000);
    cont = assert((items[str] == "0"), "String Item is not 0: " + items[str], "4f");
  }
}

if(cont){
  logger.info("Test 5: hasTerminated");
  timer = new CountdownTimer("1s", test, number);
  java.lang.Thread.sleep(1100);
  cont = assert(timer.hasTerminated(), "hasTerminated returned false after timer expired", "Test 5");
}

if(cont){
  logger.info("Test 6: cancel");
  funcCalled = false;
  timer = new CountdownTimer("2s", test, number);
  java.lang.Thread.sleep(100);
  var old_val = items[number];
  cont = assert((items[number] == 2), "Item was not initialized to 2", "Test 6");
  if(cont) {
    timer.cancel();
    java.lang.Thread.sleep(2000);
    cont = assert((items[number] == 0), "Item was not reset to 0 after cancelling", "Test 6");
    if(cont){
      cont = assert((!funcCalled), "Timer ran even though it was cancelled", "Test 6");
    }
  }
}

if(cont){
  logger.info("All tests passed");
}
else {
  logger.info("At least one test failed!");
}