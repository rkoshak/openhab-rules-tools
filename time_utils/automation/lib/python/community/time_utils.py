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
import re
from datetime import timedelta
from core.log import logging, LOG_PREFIX
from org.joda.time import DateTime
from core.jsr223 import scope

duration_regex = re.compile(r'^((?P<days>[\.\d]+?)d)? *((?P<hours>[\.\d]+?)h)? *((?P<minutes>[\.\d]+?)m)? *((?P<seconds>[\.\d]+?)s)?$')
iso8601_regex = re.compile(r'^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\.[0-9]+)?(Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])?$')

def parse_duration(time_str, log=logging.getLogger("{}.time_utils".format(LOG_PREFIX))):
    """Parse a time string e.g. (2h13m) into a timedelta object
    https://stackoverflow.com/questions/4628122/how-to-construct-a-timedelta-object-from-a-simple-string
    Arguments:
        - time_str: A string identifying a duration. Use
            - d: days
            - h: hours
            - m: minutes
            - s: seconds
          All options are optional but at least one needs to be supplied. Float
          values are allowed (e.g. "1.5d" is the same as "1d12h"). Spaces
          between each field is allowed. Examples:
              - 1h 30m 45s
              - 1h05s
              - 55h 59m 12s
        - log: optional, logger object for logging a warning if the passed in
        string is not parsable. A "time_utils" logger will be used if not
        supplied.
    Returns:
        A ``datetime.timedelta`` object representing the supplied time duration
        or ``None`` if ``time_str`` cannot be parsed.
    """

    parts = duration_regex.match(time_str)
    if parts is None:
        log.warn("Could not parse any time information from '{}'. Examples "
                  "of valid strings: '8h', '2d8h5m20s', '2m 4s'"
                   .format(time_str))
        return None
    else:
        time_params = {name: float(param) for name, param in parts.groupdict().items() if param}
        return timedelta(**time_params)

def delta_to_datetime(td):
    """Takes a Python timedelta Object and converts it to a DateTime from now.
    Arguments:
        - td: The Python datetime.timedelta Object
    Returns:
        A Joda DateTime td from now.
    """

    return (DateTime.now().plusDays(td.days)
               .plusSeconds(td.seconds)
               .plusMillis(td.microseconds//1000))

def parse_duration_to_datetime(time_str, log=logging.getLogger("{}.time_utils".format(LOG_PREFIX))):
    """Parses the passed in time string (see parse_duration) and returns a Joda
    DateTime that amount of time from now.
    Arguments:
        - time_str: A string identifying a duration. See parse_duration above
    Returns:
        A Joda DateTime time_str from now
    """

    return delta_to_datetime(parse_duration(time_str, log))

def is_iso8601(dt_str):
    """Returns True if dt_str conforms to ISO 8601
    Arguments:
        - dt_str: the String to check
    Returns:
        True if dt_str conforms to dt_str and False otherwise
    """

    try:
        if iso8601_regex(dt_str) is not None:
            return True
    except:
        pass
    return False

def to_datetime(when, log=logging.getLogger("{}.time_utils".format(LOG_PREFIX))):
    """Based on what type when is, converts when to a Joda DateTime object.
    Type:
        - DateTime: returns when as is
        - int: returns now.plusMillis(when)
        - openHAB number type: returns now.plusMillis(when.intValue())
        - ISO8601 string: DateTime(when)
        - Duration definition: see parse_duration_to_datetime
    Arguments:
        - when: the Object to convert to a DateTime
        - log: optional logger, when not supplied one is created for logging errors
    Returns:
        - DateTime specified by when
    """

    dt = None
    try:
        # TODO import the "real" classes. Scope goes away in looping timers.
        if isinstance(when, DateTime):
            dt = when
        elif isinstance(when, (str, unicode)):
            if is_iso8601(when):
                dt = DateTime(when)
            else:
                dt = parse_duration_to_datetime(when, log)
        elif isinstance(when, int):
            dt = DateTime().now().plusMillis(when)
        elif isinstance(when, (scope.DateTimeType)):
            dt = DateTime(str(when))
        elif isinstance(when, (scope.DecimalType, scope.PercentType,
                            scope.QuantityType)) :
            dt = DateTime().now().plusMillis(when.intValue())
        else:
            log.warn("When is an unknown type!")
    except:
        import traceback
        log.error("Exception: {}".format(traceback.format_exc()))
    finally:
        return dt

def to_today(when, log=logging.getLogger("{}.time_utils".format(LOG_PREFIX))):
    """Takes a when (see to_datetime) and updates the date to today.
    Arguments:
        - when : One of the types or formats supported by to_datetime
        - log: optional logger, when not supplied one is created for logging errors
    Returns:
        - DateTime specified by when with today's date.
    """

    dt = to_datetime(when, log)
    now = dt.now()

    return now.withTime(dt.getHourOfDay(), dt.getMinuteOfHour(),
                        dt.getSecondOfMinute(), 0)
