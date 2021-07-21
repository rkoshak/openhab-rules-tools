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
from core.jsr223.scope import events
from org.joda.time import DateTime
from community.time_utils import to_datetime
from community.timer_mgr import TimerMgr

timers = TimerMgr()

def timer_body(target, value, is_command, time, log):
    """
    Called when the differed action timer expires, sends the command to the
    target Item.
    Arguments:
        - target: Item name to send the command to
        - value: Command or state to issue to the target Item
        - is_command: Whether to send value to target as a command or an update
        - time: the original time string
        - log: logger passed in from the Rule that is using this.
    """
    log.debug("{} {} to {} after {}"
              .format("Commanding" if is_command else "Updating", target, value,
                      time))
    if is_command:
        events.sendCommand(target, str(value))
    else:
        events.postUpdate(target, str(value))

def defer(target, value, when, log, is_command=True):
    """
    Use this function to schedule a command to be sent to an Item at the
    specified time or after the speficied delay. If the passed in time or delay
    ends up in the past, the command is sent immediately.
    Arguments:
        - target: Item name to send the command to
        - value: the command to send the Item
        - when: at what time to delay to action until, see to_datetime in the timer_utils library
        - is_command: whether to send value to target as an update or command,
        defaults to True
        - log: logger passed in from the Rule
    """

    trigger_time = to_datetime(when, log)

    if not trigger_time:
        log.error("Cannot schedule a deferred action, {} is not a valid date time or duration"
                  .format(when))

    # If trigger_time is in the past, schedule for now
    if trigger_time.isBefore(DateTime.now()):
        trigger_time = DateTime.now()

    # Schedule the timer
    func = lambda: timer_body(target, value, is_command, when, log)
    flap = lambda: log.debug("there is already a timer set for {}, rescheduling"
                             .format(target))
    timers.check(target, trigger_time, function=func, flapping_function=flap,
                 reschedule=True)

def cancel(target):
    """
    Cancels the timer associated with target if it exists.
    Arguments:
        - target: the Item name whose timer is to be cancelled
    """
    timers.cancel(target)

def cancel_all():
    """
    Cancels all timers.
    """
    timers.cancel_all()
