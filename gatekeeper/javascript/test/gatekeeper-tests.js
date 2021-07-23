/**
Copyright July 23, 2021 Richard Koshak

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var logger = Java.type("org.slf4j.LoggerFactory").getLogger("org.openhab.model.script.Gatekeeper Tests");

var ZDT = Java.type("java.time.ZonedDateTime");
var Duration = Java.type("java.time.Duration");

var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
load(OPENHAB_CONF + "/automation/lib/javascript/community/gatekeeper.js");

logger.info("Initialiozing gatekeeper tests");
var gk = new Gatekeeper();

var assert = function(expected, msg, count) {
  if(!expected) {
    logger.error("[Test " + count + "]: " + msg);
    return false;
  }
  logger.info("Test " + count + " passed");
  return true;
}

// Variables and functions for testing
var test1 = null;
var test2 = null;
var test3 = null;
var test4 = null;

var test1_func = function() {
  logger.debug("Test1 ran");
  test1 = ZDT.now();
}
var test2_func = function() {
  logger.debug("Test2 ran");
  test2 = ZDT.now();
}
var test3_func = function() {
  logger.debug("Test3 ran");
  test3 = ZDT.now();
}
var test4_func = function() {
  logger.debug("Test4 ran");
  test4 = ZDT.now();
}

// Test 1 Scheduling
logger.info("Starting Test 1");
var start = ZDT.now();
gk.addCommand("1s", test1_func);
gk.addCommand("2s", test2_func);
gk.addCommand("3s", test3_func);
gk.addCommand(500, test4_func);

java.lang.Thread.sleep(6500);
cont = assert(start.isBefore(test1), "test1 ran before start!", "1a");
if(cont) {
  var dur = Duration.between(test1, test2).getSeconds();
  cont = assert((dur == 1), "Duration between test1 and test2 incorrect: " + dur, "1b");
}
if(cont) {
  var dur = Duration.between(test2, test3).getSeconds();
  cont = assert((dur == 2), "Duration between test2 and test3 incorrect: " + dur, "1c");
}
if(cont) {
  var dur = Duration.between(test3, test4).getSeconds();
  cont = assert((dur == 3), "Duration between test3 and test4 incorrect: " + dur, "1d");
}

// Test 2 cancelAll
logger.info("Starting Test 2");
if(cont){
  test1 = null;
  test2 = null;
  test3 = null;
  test4 = null;
  
  gk.addCommand("1s", test1_func);
  gk.addCommand("2s", test2_func);
  gk.addCommand("3s", test3_func);
  gk.addCommand("4s", test4_func);
  
  // Wait long enough for test1 and test2 to run
  java.lang.Thread.sleep(2500);
  cont = assert((test1 !== null), "Test 1 didn't run", "2a");
  if(cont) {
    cont = assert((test2 !== null), "Test 2 didn't run", "2b");
  }
  if(cont) {
    gk.cancelAll();
    java.lang.Thread.sleep(4000);
    cont = assert((test3 === null), "Test 3 wasn't cancelled", "2c");
    if(cont) {
      assert((test4 === null), "Test 4 wasn't cancelled", "2d");
    }
  }
}

if(cont){
  logger.info("All tests passed");
}
