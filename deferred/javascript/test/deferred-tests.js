var logger = Java.type("org.slf4j.LoggerFactory").getLogger("org.openhab.model.script.Deferred Tests");

var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
load(OPENHAB_CONF + "/automation/lib/javascript/community/deferred.js");

logger.info("Creating Deferred object");
var deferred = new Deferred();

/**
 * TODO: Create the Item for the test and then remove it at the end.
 * In the mean time manually create a test Item and update testItem.
 */
var testItem = "aTestSwitch";

logger.info("Starting Deferred tests");
var cont = true;

var assert = function(expected, msg, count) {
  if(items[testItem] != expected) {
    logger.error("[Test " + count + "]: Expected " + expected + " Found " + items[testItem] + ": " + msg);
    return false;
  }
  logger.debug("Test " + count + " passed");
  return true;
}

var reset = function() {
  var cont = true;
  events.postUpdate(testItem, "UNDEF");
  java.lang.Thread.sleep(100);
  return assert(UNDEF, "Failed to initialize " + testItem, "init");
}

// Schedule
cont = reset();
if(cont) {
  deferred.defer(testItem, "ON", "1s");
  java.lang.Thread.sleep(100);
  cont = assert(UNDEF, "Deferred updated " + testItem  + " too soon!", "1a");
  java.lang.Thread.sleep(1100);
  cont = assert(ON, "Failed to update " + testItem + " as scheduled", "1b");
}

// Reschedule
cont = (cont) ? reset() : cont;
if(cont) {
  deferred.defer(testItem, "OFF", "1s");
  java.lang.Thread.sleep(100);
  cont = assert(UNDEF, "Updated " + testItem  + " too soon!", "2a");
}
if(cont) {
  deferred.defer(testItem, "ON", "2s");
  java.lang.Thread.sleep(1000);
  cont = assert(UNDEF, "Deferred didn't reschedule", "2b");
}
if(cont) {
  java.lang.Thread.sleep(1100);
  cont = assert(OFF, "Didn't update " + testItem + " on reschedule", "2c");
}

// Cancel
cont = (cont) ? reset() : cont;
if(cont) {
  deferred.defer(testItem, "ON", "1s");
  java.lang.Thread.sleep(100);
  deferred.cancel(testItem);
  java.lang.Thread.sleep(1100);
  cont = assert(UNDEF, "Didn't cancel!", "3");
}

// Cancel All
cont = (cont) ? reset() : cont;
if(cont) {
  deferred.defer(testItem, "ON", "1s");
  java.lang.Thread.sleep(100);
  deferred.cancelAll();
  java.lang.Thread.sleep(1100);
  assert(UNDEF, "Cancel all didn't cancel", "4");
}

if(cont) {
  logger.info("All tests passed");
}