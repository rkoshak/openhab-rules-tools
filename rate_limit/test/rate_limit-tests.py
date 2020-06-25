"""
Copyright June 25, 2020 Richard Koshak

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
from community.rate_limit import RateLimit
import time
from core.log import logging, LOG_PREFIX

log = logging.getLogger("{}.TEST.Latch".format(LOG_PREFIX))
func_called = False

def test():
    global func_called
    func_called = True

try:
    log.info("Starting rate_limit tests")
    rate_limit = RateLimit()

    rate_limit.run(test, secs=2)
    assert func_called, "Test1: function was not called"

    func_called = False
    rate_limit.run(test, secs=2)
    assert not func_called, "Test2: function was called"

    time.sleep(2)
    rate_limit.run(test, secs=2)
    assert func_called, "Test3: function was not called"

except AssertionError:
    import traceback
    log.error("Exception: {}".format(traceback.format_exc()))
else:
    log.info("Latch tests passed!")
