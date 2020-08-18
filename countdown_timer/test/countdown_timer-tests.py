"""
Copyright June 24, 2020 Richard Koshak

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""
import time
import community.countdown_timer
reload(community.countdown_timer)
from community.countdown_timer import CountdownTimer
import community.time_utils
reload(community.time_utils)
from core.log import log_traceback, logging, LOG_PREFIX
from datetime import datetime, timedelta
log = logging.getLogger("{}.TEST.util".format(LOG_PREFIX))

func_called = False

def test():
    global func_called
    func_called = True

# Create a couple of Items to test with
from core.items import add_item
log.info("Creating test Items")
number = "Countdown_Timer_Test_Number"
string = "Countdown_Timer_Test_String"
add_item(number, item_type="Number")
add_item(string, item_type="String")

try:
    # Test that func_called on even seconds.
    log.info("--------------------------- seconds")
    timer = CountdownTimer(log, "2s", test, number)
    time.sleep(2.1)
    assert func_called, "Test1: function wasn't called when timer expired"

    # Test that func_called on fraction of seconds.
    log.info("--------------------------- milliseconds")
    func_called = False
    timer = CountdownTimer(log, (datetime.now() + timedelta(seconds=2, microseconds=100000)), test, number)
    time.sleep(2.2)
    assert func_called, "Test2: function wasn't called when timer expired"

    # Test that number gets updated properly
    log.info("--------------------------- number Item")
    log.info("number item is starting at {}".format(items[number]))
    assert items[number] == DecimalType(0), "Test3: countdown Item is not 0: {}".format(items[number])
    timer = CountdownTimer(log, (datetime.now() + timedelta(seconds=5)), test, number)
    time.sleep(0.1)
    log.info("number item is now {}".format(items[number]))
    assert items[number] == DecimalType(4), "Test3: countdown Item is not 4: {}".format(items[number])
    time.sleep(1)
    log.info("number item is now {}".format(items[number]))
    assert items[number] == DecimalType(3), "Test3: countdown Item is not 3: {}".format(items[number])
    time.sleep(1)
    log.info("number item is now {}".format(items[number]))
    assert items[number] == DecimalType(2), "Test3: countdown Item is not 2: {}".format(items[number])
    time.sleep(1)
    log.info("number item is now {}".format(items[number]))
    assert items[number] == DecimalType(1), "Test3: countdow Item is not 1: {}".format(items[number])
    time.sleep(1)
    log.info("number item is finally {}".format(items[number]))
    assert items[number] == DecimalType(0), "Test3: countdown Item is not 0: {}".format(items[number])

    # Test that string gets updated properly.
    log.info("--------------------------- string Item")
    log.info("string item is starting at {}".format(items[string]))
    timer = CountdownTimer(log, (datetime.now() + timedelta(seconds=5)), test, string)
    time.sleep(0.1)
    log.info("string item is now {}".format(items[string]))
    assert str(items[string]).startswith("0:00:04"), "Tets4: countdown Item is not 0:00:04: {}".format(items[string])

    time.sleep(1)
    log.info("string item is now {}".format(items[string]))
    assert str(items[string]).startswith("0:00:03"), "Tets4: countdown Item is not 0:00:03: {}".format(items[string])

    time.sleep(1)
    log.info("string item is now {}".format(items[string]))
    assert str(items[string]).startswith("0:00:02"), "Tets4: countdown Item is not 0:00:03: {}".format(items[string])

    time.sleep(1)
    log.info("string item is now {}".format(items[string]))
    assert str(items[string]).startswith("0:00:01"), "Tets4: countdown Item is not 0:00:01: {}".format(items[string])

    time.sleep(1)
    log.info("string item is finally {}".format(items[string]))
    assert str(items[string]) == "0:00:00", "Tets4: countdown Item is not 0:00:00: {}".format(items[string])

    # Test that we can use to_datetime formatted values
    log.info("--------------------------- string time")
    log.info("string item is starting at {}".format(items[string]))
    timer = CountdownTimer(log, "5s", test, string)
    time.sleep(0.1)
    log.info("string item is now {}".format(items[string]))
    assert str(items[string]).startswith("0:00:04"), "Tets4: countdown Item is not 0:00:04: {}".format(items[string])

    time.sleep(1)
    log.info("string item is now {}".format(items[string]))
    assert str(items[string]).startswith("0:00:03"), "Tets4: countdown Item is not 0:00:03: {}".format(items[string])

    time.sleep(1)
    log.info("string item is now {}".format(items[string]))
    assert str(items[string]).startswith("0:00:02"), "Tets4: countdown Item is not 0:00:03: {}".format(items[string])

    time.sleep(1)
    log.info("string item is now {}".format(items[string]))
    assert str(items[string]).startswith("0:00:01"), "Tets4: countdown Item is not 0:00:01: {}".format(items[string])

    time.sleep(1)
    log.info("string item is finally {}".format(items[string]))
    assert str(items[string]) == "0:00:00", "Tets4: countdown Item is not 0:00:00: {}".format(items[string])



    # Test that hasTerminated works
    log.info("--------------------------- hasTerminated()")
    timer = CountdownTimer(log, (datetime.now() + timedelta(seconds=2)), test, number)
    assert not timer.hasTerminated(), "Test5: timer has prematurely terminated"
    time.sleep(2)
    assert timer.hasTerminated(), "Test5: timer has not terminated"

    # Test that cancel works.
    log.info("--------------------------- cancel()")
    timer = CountdownTimer(log, (datetime.now() + timedelta(seconds=2)), test, number)
    time.sleep(0.1)
    old_val = items[number]
    timer.cancel()
    time.sleep(2)
    assert items[number] == DecimalType(0), "Timer5: countdown Item wasn't rest to 0"

except AssertionError:
    import traceback
    log.error("Exception: {}".format(traceback.format_exc()))
    timer.cancel()

else:
    log.info("CountdownTimer tests passed!")
finally:
    log.info("Deleting test Items")
    from core.items import remove_item
    remove_item(number)
    remove_item(string)
