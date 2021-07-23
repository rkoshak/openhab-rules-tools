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
# Import the Gatekeeper class
import community.gatekeeper
reload(community.gatekeeper)
from community.gatekeeper import Gatekeeper

from core.log import logging, LOG_PREFIX
from time import sleep, time

log = logging.getLogger("{}.TEST.gatekeeper".format(LOG_PREFIX))

# Define the gatekeeper instance.
gk = Gatekeeper(log)

# Flags that get set to the time when the gatekeeper calls the corresponding
# test function.
test1 = None
test2 = None
test3 = None
test4 = None

# Test functions that get passed to the gatekeeper to call.
def test1_func():
    global test1
    test1 = time()
def test2_func():
    global test2
    test2 = time()
def test3_func():
    global test3
    test3 = time()
def test4_func():
    global test4
    test4 = time()

try:
    # Take the current time and then schedule four tasks with different timeouts
    # by adding them to the gatekeeper.
    log.info("Starting gatekeeper add_command test")
    start = time()
    gk.add_command(1000, test1_func)
    gk.add_command("2s", test2_func)
    gk.add_command("3s", test3_func)
    gk.add_command(500, test4_func)

    # The first command will execute immediate, the second one after a second,
    # the thrid one after three seconds, and the fourth one after six seconds.
    # Wait long enough for all commands to run and verify they ran roughly on
    # time (i.e. within 100 msec of the scheduled time).
    sleep(6.5)
    assert start <= test1, "test1 ran before start {} {}".format(start, test1)
    assert test1+1.0 <= test2 < test1+1.1, "test1 ran after test2"
    assert test2+2.0 <= test3 < test2+2.1, "test2 ran after test3"
    assert test3+3.0 <= test4 < test3+3.1, "test3 ran after test4"

    # Test cancel_all. First reset the flag variables.
    log.info("Starting gatekeeper cancel_all test")
    test1 = None
    test2 = None
    test3 = None
    test4 = None

    # Schedule the commands to run by adding them to the gate keeper.
    gk.add_command(1000, test1_func)
    gk.add_command(2000, test2_func)
    gk.add_command(3000, test3_func)
    gk.add_command(4000, test4_func)

    # Wait long enough for test1 and test2 to run but not test3 and test4.
    sleep(2.5)
    assert test1 is not None, "Test1 didn't run!"
    assert test2 is not None, "Test2 didn't run!"

    # Cancel the remaining commands and sleep long enough that they would have
    # run if not cancelled.
    gk.cancel_all()
    sleep(4)

    # The first two commands should have run and the last two should not have
    # run.
    assert test1 is not None, "Test1 didn't run!"
    assert test2 is not None, "Test2 didn't run!"
    assert test3 is None, "Test3 ran instead of being cancelled!"
    assert test4 is None, "Test4 ran instead of being cancelled!"

except AssertionError:
    import traceback
    log.error("Exception: {}".format(traceback.format_exc()))
else:
    log.info("Gatekeeper tests passed!")
