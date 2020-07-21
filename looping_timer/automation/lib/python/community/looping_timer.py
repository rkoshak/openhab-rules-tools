"""
Copyright July 21, 2020 Richard Koshak

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
from core.actions import ScriptExecution
from community.time_utils import to_datetime

class LoopingTimer(object):
    """Implements a looping timer."""

    def __init__(self, function, log, when=None):
        """Initializes and kicks off the looping timer.

        Arguments:
            - function: The function to call when the timer goes off. The
            function must return the time for the next time the timer should run
            (see when below). If None is returned the timer will not be
            rescheduled.
            - when: Optional time when to kick off the first call to function.
            It can be any of the forms supported by to_datetime in time_utils
            (e.g. "1s"). If None is passed the lambda will be called immediately.
        """

        self.function = function
        self.log = log
        self.timer = None

        if not when:
            self.log.info("No when specified, kicking off immediately")
            self.__expired()
        else:
            self.log.info("Starting timer at {}".format(when))
            self.timer = ScriptExecution.createTimer(to_datetime(when), self.__expired)

    def __expired(self):
        """Called when the timer expired, reschedules if necessary"""

        self.log.info("Timer expired, calling function")
        when = self.function()
        self.log.info("Function returned {}".format(when))
        if when:
            self.log.info("Rescheduling timer...")
            self.timer = ScriptExecution.createTimer(to_datetime(when), self.__expired)

    def cancel(self):
        """Cancels the running timer."""

        if self.timer and not self.timer.hasTerminated():
            self.timer.cancel()

    def hasTerminated(self):
        """Returns True if the timer doesn't exist or it has terminated."""

        return not self.timer or self.timer.hasTerminated()
