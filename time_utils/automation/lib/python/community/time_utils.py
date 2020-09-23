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
import traceback
from datetime import datetime, date, time, timedelta
from dateutil import parser
from core.log import logging, LOG_PREFIX
from core.date import to_joda_datetime, to_python_datetime, to_java_zoneddatetime
from core.jsr223 import scope
from java.time import ZonedDateTime
from java.time.temporal import ChronoUnit
from org.joda.time import DateTime




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
        if iso8601_regex.match(dt_str) is not None:
            return True
    except:
        pass
    return False

def to_datetime(when, log=logging.getLogger("{}.time_utils".format(LOG_PREFIX)), output = 'Joda'):
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
    log.debug(output)

    dt_joda = None
    dt_python = None
    dt_java = None

    try:
        if isinstance(when, DateTime):
            log.debug('when is DateTime')
            dt_joda = when
            dt_java = to_java_zoneddatetime(dt_joda)
            dt_python = to_python_datetime(dt_java)

        elif isinstance(when, int):
            log.debug('when is int')
            dt_joda = DateTime().now().plusMillis(when)
            dt_java = ZonedDateTime.now().plus(when, ChronoUnit.MILLIS)
            dt_python = to_python_datetime(dt_java)

        elif isinstance(when, scope.DateTimeType):
            log.debug('when is DateTimeType')
            dt_joda = DateTime(str(when))
            dt_java = to_java_zoneddatetime(dt_joda)
            dt_python = to_python_datetime(dt_java)

        elif isinstance(when, (scope.DecimalType, scope.PercentType, scope.QuantityType)):
            log.debug('when is decimal, percent or quantity type')
            dt_joda = DateTime().now().plusMillis(when.intValue())
            dt_python = datetime.now() + timedelta(milliseconds = when.intValue())
            dt_java = to_java_zoneddatetime(dt_python)

        elif isinstance(when, datetime):
            log.debug('when is datetime')
            dt_python = when
            dt_java = to_java_zoneddatetime(when)
            #get system time zone to avoid convertion errors
            dt_joda = to_joda_datetime(when.replace(tzinfo=None)) 

        elif isinstance(when, time):
            log.debug('when is python time object')
            dt_java = ZonedDateTime.now().withHour(when.hour).withMinute(when.minute).withSecond(when.second)
            dt_python = to_python_datetime(dt_java)
            dt_joda = to_joda_datetime(dt_java)

        elif isinstance(when, (str, unicode)):
            if is_iso8601(when):
                log.debug('when is iso8601: '+str(when))
                dt_joda = DateTime(when)
                dt_python = parser.parse(str(when))
                #get system time zone to avoid convertion errors
                dt_java = to_java_zoneddatetime(dt_python.replace(tzinfo=None))
            else:
                log.debug('when is duration')
                log.debug(str(when))
                dt_joda = parse_duration_to_datetime(when, log)
                log.debug('dt_joda is ' + str(dt_joda))
                dt_python = datetime.now() + parse_duration(when, log)
                log.debug('dt python is ' + str(dt_python))
                #get system time zone to avoid convertion errors
                dt_java = to_java_zoneddatetime(dt_python.replace(tzinfo=None))
        else:
            log.warn('When is an unknown type {}'.format(type(when)))
    except:
        log.error('Exception: {}'.format(traceback.format_exc()))

    if output == 'python':
        log.debug('returning dt python')
        return dt_python
    elif output == 'Java':
        log.debug("returning dt java")
        return dt_java
    else:
        log.debug("returning dt joda")
        return dt_joda

def to_today(when, log=logging.getLogger("{}.time_utils".format(LOG_PREFIX)), output='Joda'):
    """Takes a when (see to_datetime) and updates the date to today.
    Arguments:
        - when : One of the types or formats supported by to_datetime
        - log: optional logger, when not supplied one is created for logging errors
    Returns:
        - DateTime specified by when with today's date.
    """
    log.debug(output)

    if output == 'python':
        dt = to_datetime(when, log=log, output = 'python')
        now = datetime.now()
        return dt.replace(year=now.year, month=now.month, day=now.day)

    else:
        dt = to_datetime(when, log=log)
        now = dt.now()

    return (now.withTime(dt.getHourOfDay(), dt.getMinuteOfHour(),
                         dt.getSecondOfMinute(), 0))
