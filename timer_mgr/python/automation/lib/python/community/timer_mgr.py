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

from core.actions import ScriptExecution
from community.time_utils import to_datetime
from core.log import log_traceback, logging, LOG_PREFIX

TimerMgr_logger = logging.getLogger("{}.Timer Manager".format(LOG_PREFIX))

class TimerMgr(object):
    """Keeps and manages a dictionary of Timers keyed on a String, typically an
    Item name.
    Examples:
        flapping_timers = TimerMgr()
        # In a Rule, check to see if a Timer exists for this Item. If one
        # exists, log a warning statement that the Item is flapping.
        # Otherwise, set a half second timer and update the Time Item
        # associated with the Item.
        flapping_timers.check(event.itemName,
                              500,
                              lambda: events.postUpdate("{}_Time".format(event.itemName), str(DateTime.now())),
                              lambda: my_rule.log.warn("{} is flapping!".format(event.itemName),
                              reschedule=True)

        reminder_timers = TimerMgr()
        # In a Rule, if the door is OPEN, create a timer to go off in 60
        # minutes to post a message to the Alert Item. If it's NIGHT time,
        # reschedule the Timer. If the door is CLOSED, cancel the reminder
        # Timer.
        if items[itemName == OPEN]:
            reminder_timers.check(itemName,
                                  60*60*1000,
                                  lambda: events.postUpdate("AlertItem", "{} has been open for an hour!".format(itemName)),
                                  reschedule=items["vTimeOfDay"] == StringType("NIGHT"))
        else:
            reminder_timers.cancel(itemName)

        # Check to see if a Timer exists for the Item.
        if reminder_timers.has_timer(itemName):
            my_rule.log.warn("There already is a timer for {}!".format(itemName))
    Functions:
        - check: Checks to see if there is already a Timer for the passed in
        key, and reschedules it if desired and calls an optional function,
        otherwise it creates a Timer to call the passed in function.
        - has_timer: Returns True if there is an active Timer for the passed in
        key.
        - cancel: Cancels the Timer assocaited with the passed in key, if one
        exists.
    """

    def __init__(self):
        """ Initialize the timers dict."""

        self.timers = {}

    def __not_flapping(self, key):
        """Called when the Timer expires. Call the function and delete the timer
        from the dict. This function ensures that the dict get's cleaned up.
        Args:
            key: the key of the Timer that called the function
        """

        try:
            if key in self.timers and 'not_flapping' in self.timers[key]:
                self.timers[key]['not_flapping']()
        finally:
            if key in self.timers and self.timers[key]['self_cleanup']:
                del self.timers[key]

    def __noop(self):
        """Called when the user doesn't supply a function to go with the Timer.
        It does nothing
        """

    def check(self, key, when, function=None, flapping_function=None,
              reschedule=False, self_cleanup=True):
        """Call to check whether a key has a Timer. If no Timer exists, creates
        a new timer to run the passed in function. If a Timer exists, reschedule
        it if reschedule is True and if a flapping_function was passed, run it.
        Arguments:
            - key: The key to set a Timer for.
            - when: The time for when the timer should go off. Supports:
                - DateTime objects
                - ISO 8601 formatted Strings
                - Python int, treated as number of seconds into the future
                - DecimalType, PercentType, or QuantityType (intValue() is
                called), treated as number of seconds into the future
                - Duration string of the format Xd Xh Xm Xs where:
                    - d: days
                    - h: hours
                    - m: minutes
                    - s: seconds
                    - X: integer or floating point number for the amount
                e.g. 1h3s represents one hour and three seconds
            - function: Optional function to call when the Timer expires
            - flapping_function: Optional function to call if the key already
            has a Timer running. Defaults to None.
            - reschedule: Optional flag that causes the Timer to be rescheduled
            when the key already has a Timer. Defaults to False.
            - self_cleanup: when set, the timer gets called and finally removes
            itself from the list of timers (i.e. it cannot reschedule itself to
            a new date/time)
        """

        timeout = to_datetime(when)
        TimerMgr_logger.debug("timeout is: " + str(timeout))
        # Timer exists: if the reschedule flag is set, reschedule it, otherwise
        # cancel it. If a flapping function was passed to us, call the flapping
        # function.
        if key in self.timers:
            if reschedule:
                self.timers[key]['timer'].reschedule(timeout)
                TimerMgr_logger.debug("rescheduling timer for: " + str(key))
            else:
                self.cancel(key)
                TimerMgr_logger.debug("Timer cancelled for: " + str(key))
            if flapping_function: 
                flapping_function()
                TimerMgr_logger.debug("Running flapping function for: " + str(key))

        # No timer exists, create the Timer
        else:
            TimerMgr_logger.debug("Creating timer for: " + str(key))
            timer = ScriptExecution.createTimer(timeout,
                        lambda: self.__not_flapping(key))
            self.timers[key] = { 'timer':        timer,
                                 'flapping':     flapping_function,
                                 'not_flapping': function if function else self.__noop,
                                 'self_cleanup': self_cleanup}
            TimerMgr_logger.debug("Timer created: " + str(self.timers[key]))

    def has_timer(self, key):
        """Checks to see if a Timer exists for the passed in key.
        Arguments:
            - key: Name of the Timer
        Returns: True if there is a Timer for that key.
        """

        return key in self.timers

    def cancel(self, key):
        """Cancels the Timer associated with this key if one exists.
        Arguments:
            - key: Name of Timer.
        """

        if not self.has_timer(key):
            return
        self.timers[key]['timer'].cancel()
        del self.timers[key]

    def cancel_all(self):
        """
        Cancels any existing Timers.
        """

        for key in self.timers:
            if not self.timers[key]['timer'].hasTerminated():
                TimerMgr_logger.debug("Timer has not terminated cancelling for key : " + str(key))
                self.timers[key]['timer'].cancel()
            del self.timers[key]
            TimerMgr_logger.debug("Timer entry deleted for key : " + str(key))
