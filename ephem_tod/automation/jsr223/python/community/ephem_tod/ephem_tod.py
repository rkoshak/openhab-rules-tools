"""
Copyright June 30, 2020 Richard Koshak

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
from core.rules import rule
from core.triggers import when
from core.metadata import get_metadata, get_key_value, get_value
from core.actions import Ephemeris
from core.utils import send_command_if_different
from org.joda.time import DateTime
import community.time_utils
reload(community.time_utils)
from community.time_utils import to_today
from community.timer_mgr import TimerMgr

# Create an Item to trigger the rule on command if it doesn't exist.
ETOD_TRIGGER_ITEM = "CalculateETOD"
if ETOD_TRIGGER_ITEM not in items:
    from core.items import add_item
    add_item(ETOD_TRIGGER_ITEM, item_type="Switch")

# Create the time of day state Item if it doesn't exist.
ETOD_ITEM = "TimeOfDay"
if ETOD_ITEM not in items:
    from core.items import add_item
    add_item(ETOD_ITEM, item_type="String")

# Metadata name space.
NAMESPACE = "etod"

# Timers that run at time of day transitions.
timers = TimerMgr()

def get_times(log):
    """Gets the list of Items that define the start times for today. It uses
    Ephemeris to determine which set of Items to select. The hierarchy is:
        - custom: custom defined holidays
        - holiday: default holidays
        - dayset: custom defined dayset
        - weekend: weekend as defined in Ephemeris
        - weekday: not weekend days
        - default: used when no other day type is detected for today
    Arguments:
        - log: the logger used to log out debug information
    Returns:
        - a list of names for DateTime Items; None if no valid start times were
        found.
    """
    def cond(lst, cond):
        return [i for i in lst if cond(i)]

    def types(type):
        return [i for i in items if get_key_value(i, NAMESPACE, "type") == type]

    # Get all of the etod Items that are valid for today.
    start_times = {'default': types("default"),
                   'weekday': types("weekday") if not Ephemeris.isWeekend() else [],
                   'weekend': types("weekend") if Ephemeris.isWeekend() else [],
                   'dayset': cond(types('dayset'),
                                lambda i: Ephemeris.isInDaySet(get_key_value(i, "set"))),
                   'holiday': cond(types('holiday'),
                                lambda i: Ephemeris.isBankHoliday()),
                   'custom': cond(types('custom'),
                                lambda i: Ephemeris.isBankHoliday(0, get_key_value(i, NAMESPACE, "file")))}

    # Determins which start time Items to use according to the hierarchy.
    day_type = None
    if start_times['custom']:
        day_type = 'custom'
    elif start_times['holiday']:
        day_type = 'holiday'
    elif start_times['dayset']:
        day_type = 'dayset'
    elif start_times['weekend']:
        day_type = 'weekend'
    elif start_times['weekday']:
        day_type = 'weekday'
    elif start_times['default']:
        day_type = 'default'

    log.info("Today is a {} day.".format(day_type))
    return start_times[day_type] if day_type else None

def etod_transition(state, log):
    """Called from the timers, transitions to the next time of day.
    Arguments:
        - state: the state to transition into
        - log: logger to log debug information
    """
    log.info("Transitioning Time of Day from {} to {}"
             .format(items[ETOD_ITEM], state))
    events.sendCommand(ETOD_ITEM, state)

def create_timers(start_times, log):
    """Creates Timers to transition the time of day based on the passed in list
    of DateTime Item names. If an Item is dated with yesterday, the Item is
    updated to today. The ETOD_ITEM is commanded to the current time of day if
    it's not already the correct state.
    Arguments:
        - start_times: list of names for DateTime Items containing the start
        times for each time period
        - log: used to log debug information
    """

    now = DateTime().now()
    most_recent_time = now.minusDays(1)
    most_recent_state = items[ETOD_ITEM]

    for time in start_times:

        item_time = DateTime(str(items[time]))
        trigger_time = to_today(items[time])

        # Update the Item with today's date if it was for yesterday.
        if item_time.isBefore(trigger_time):
            log.debug("Item {} is yesterday, updating to today".format(time))
            events.postUpdate(time, str(trigger_time))

        # Get the etod state from the metadata.
        state = get_value(time, NAMESPACE)

        # If it's in the past but after most_recent, update most_recent.
        if trigger_time.isBefore(now) and trigger_time.isAfter(most_recent_time):
            log.debug("NOW:    {} start time {} is in the past but after {}"
                     .format(state, trigger_time, most_recent_time))
            most_recent_time = trigger_time
            most_recent_state = get_value(time, NAMESPACE)

        # If it's in the future, schedule a Timer.
        elif trigger_time.isAfter(now):
            log.debug("FUTURE: {} Scheduleing Timer for {}"
                     .format(state, trigger_time))
            timers.check(time, trigger_time,
                         function=lambda: etod_transition(state))

        # If it's in the past but not after most_recent_time we can ignore it.
        else:
            log.debug("PAST:   {} start time of {} is before now {} and before {}"
                     .format(state, trigger_time, now, most_recent_time))

    log.info("The current time of day is {}".format(most_recent_state))
    send_command_if_different(ETOD_ITEM, most_recent_state)

def trigger_generator():
    """Generates rule triggers for all of the Items that have etod metadata"""
    def generate_triggers(function):
        for item_name in [i for i in items if get_metadata(i, NAMESPACE)]:
            when("Item {} changed".format(item_name))
        return(function)
    return generate_triggers

@rule("Ephemeris Time of Day", tags=["etod", "openhab-rules-tools"])
@when("System started")
@when("Time cron 0 2 0 * * ? *")
@when("Item {} received command ON".format(ETOD_TRIGGER_ITEM))
@trigger_generator()
def ephem_tod(event):
    """Rule to recalculate the times of day for today. It triggers at system
    start, two minutes after midnight (to give Astro a chance to update the
    times for today), when ETOD_TRIGGER_ITEM (default is CalculateETOD) receives
    an ON command, or when any of the Items with etod metadata changes.
    """

    # Get the start times.
    start_times = get_times(ephem_tod.log)

    # If any are NULL, kick off the init rule.
    null_items = [i for i in start_times if isinstance(items[i], UnDefType)]
    if null_items:
        ephem_tod.log.warn("The following Items are are NULL: {} kicking off "
                           "initialization".format(null_items))
        events.sendCommand("InitItems", "ON")
        from time import sleep
        sleep(5)

    if [i for i in start_times if isinstance(items[i], UnDefType)]:
        ephem_tod.log.error("There are still etod Items that are NULL, cancelling")
        return

    # Cancel existing Items and then generate all the timers for today.
    timers.cancel_all()
    create_timers(start_times, ephem_tod.log)

def scriptUnloaded():
    """Cancel all Timers at unload to avoid errors in the log."""
    timers.cancel_all()
