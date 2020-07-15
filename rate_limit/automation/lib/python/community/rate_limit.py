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
from community.time_utils import to_datetime
from org.joda.time import DateTime
#from datetime import datetime, timedelta

logger = logging.getLogger("{}.Rate Limit".format(LOG_PREFIX))

class RateLimit(object):
    """Keeps a timestamp for when a new call to run is allowed to execute, ignoring
    any calls that take place before that time.
    """

    @log_traceback
    def __init__(self):
        """ Initializes the timestamp to now. """

        self.until = DateTime().now().minusSeconds(1)

    @log_traceback
    def run(self, func, when):
        """If it has been long enough since the last time that run was called,
        execute the passed in func. Otherwise ignore the call.
        Arguments:
            - func: The lambda or function to call if allowed.
            - when: When the rate limit will expire. Can be a DateTime type
            object, a number which is treated as seconds, or a duration string
            (e.g. 5m 2.5s), or an ISO 8601 formatted date string. See time_utils
            for details
        """

        now = DateTime().now()
        if now.isAfter(self.until):
            self.until = to_datetime(when)
            func()
