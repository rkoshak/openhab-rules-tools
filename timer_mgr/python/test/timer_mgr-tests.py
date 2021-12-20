"""
Copyright June 23, 2020 Richard Koshak

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
import community.timer_mgr
reload(community.timer_mgr)
from community.timer_mgr import TimerMgr

from time import sleep
from core.log import logging, LOG_PREFIX
from org.joda.time import DateTime
log = logging.getLogger("{}.TEST.timer_mgr".format(LOG_PREFIX))

timers = TimerMgr()

# Flags that tell us when the flapping and timer functions are called
timer_expired_called = False
timer_running_called = False

# Function passed to be called when the Timer expires.
def timer_expired():
    global timer_expired_called
    timer_expired_called = True

# Function passed to be called when  the Timer exists.
def timer_running():
    global timer_running_called
    timer_running_called = True

try:
    log.info("Starting timer_mgr tests")
    test_name = "Test"

    # Test that timer get's created
    timers.check(test_name, 1000, timer_expired) # msec test
    sleep(0.5)
    assert timers.has_timer(test_name), "Test1: Timer not created"
    assert not timer_expired_called, "Test1: Timer expired was called"

    # Test that timer_expired was called when the timer expired,
    # timer_running_called is not called.
    sleep(0.55)
    assert not timers.has_timer(test_name), "Test1: Timer still exists"
    assert timer_expired_called, "Test1: Timer expired was not called"
    assert not timer_running_called, "Test1: Timer running was called"

    # Test for timer_running get's called if checked and timer exists
    timer_expired_called = False
    timer_running_called = False
    timers.check(test_name, "1s", timer_expired, timer_running)
    sleep(0.5)
    assert timers.has_timer(test_name), "Teste2: Timer not created"
    assert not timer_expired_called, "Test2: Expired was called too soon"
    assert not timer_running_called, "Test2: Running was called too soon"
    timers.check(test_name, DateTime().now().plusSeconds(1).toString(), timer_expired, timer_running) # iso 8601 string test
    assert not timers.has_timer(test_name), "Test2: Timer still exists"
    assert not timer_expired_called, "Test2: Expired called too soon"
    assert timer_running_called, "Test2: Flapping was not called"
    sleep(0.55)

    # Test that if no function is passed we can call timer_running
    timer_expired_called = False
    timer_running_called = False
    timers.check(test_name, DateTime().now().plusSeconds(1),  flapping_function=timer_running) # date time test
    sleep(0.5)
    assert timers.has_timer(test_name), "Teste3: Timer not created"
    assert not timer_expired_called, "Test3: Expired was called too soon"
    assert not timer_running_called, "Test3: Running was called too soon"
    timers.check(test_name, DecimalType(1), flapping_function=timer_running) # openHAB type test
    assert not timers.has_timer(test_name), "Test3: Timer still exists"
    sleep(0.55)
    assert not timer_expired_called, "Test3: Expired called"
    assert timer_running_called, "Test3: Flapping was not called"

    # Test timer get's rescheduled and timer_running and timer_expired get's
    # called.
    timer_expired_called = False
    timer_running_called = False
    timers.check(test_name, "1s", timer_expired, timer_running, True) # duration parsing test
    sleep(0.5)
    assert timers.has_timer(test_name), "Test4: Timer not created"
    assert not timer_expired_called, "Test4: Expired called too soon"
    assert not timer_running_called, "Test4: Flapping called too soon"
    timers.check(test_name, "1s", timer_expired, timer_running, True)
    sleep(0.5)
    assert timers.has_timer(test_name), "Test4: Timer no longer exists"
    assert not timer_expired_called, "Test4: Expired called too soon"
    assert timer_running_called, "Test4: Flapping not called"
    sleep(0.55)
    assert not timers.has_timer(test_name), "Test4: Timer still exists"
    assert timer_expired_called, "Test4: Expired not called"
    assert timer_running_called, "Test4: Flapping called."

    # Test cancel_timer
    timer_expired_called = False
    timer_running_called = False
    timers.check(test_name, "1s", timer_running)
    sleep(0.5)
    assert timers.has_timer(test_name), "Test5: Timer does not exist"
    timers.cancel(test_name)
    assert not timers.has_timer(test_name), "Test5: Timer still exists after cancel"
    sleep(0.55)
    assert not timer_expired_called, "Test5: Expired called despite being cancelled"
    assert not timer_running_called, "Test5: Flapping called for some reason"

    # Test cancel_timer on non-existant timer
    assert not timers.has_timer(test_name), "Test6: Timer exists"
    timers.cancel(test_name)
    assert not timers.has_timer(test_name), "Test6: Timer exists"

    # Test that we can pass lambdas for function and flapping_function
    timer_expired_called = False
    timer_running_called = False
    timers.check(test_name, "1s", function=lambda: timer_expired(), flapping_function=lambda: timer_running())
    sleep(0.5)
    timers.check(test_name, "0.5s", function=lambda: timer_expired(), flapping_function=lambda: timer_running(), reschedule=True)
    sleep(0.55)
    assert timer_running_called, "Test7: Flapping was not called"
    assert timer_expired_called, "Test7: Expired was not called"

    # Test that if set the timer does not clean up itself
    timer_expired_called = False
    timer_running_called = False
    timers.check(test_name, 1000, timer_expired, self_cleanup = False)
    sleep(0.5)
    assert timers.has_timer(test_name), "Test8: Timer not created"
    assert not timer_expired_called, "Test8: Timer expired was called"
    sleep(0.55)
    assert timers.has_timer(test_name), "Test8: Timer does not exists after expiration"
    assert timer_expired_called, "Test8: Timer expired was not called"
    assert not timer_running_called, "Test8: Timer running was called"
    # Remove timer
    timers.cancel(test_name)


except AssertionError:
    import traceback
    log.error("Exception: {}".format(traceback.format_exc()))
else:
    log.warn("TimerMgr tests passed!")
