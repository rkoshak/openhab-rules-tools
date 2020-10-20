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
        - java ZonedDateTime
        For python make sure the datetime object is not assigned to a variable when this function is called)
        otherwise a java.time.sql object will be returned due to a bug in Jython
        - Python datetime
        - Python time: returns DateTime with today date and system timezone
         
    Arguments:
        - when: the Object to convert to a DateTime
        - log: optional logger, when not supplied one is created for logging errors
        - output: object returned as a string. If not specified returns a Joda DateTime object
                  'Python': return datetime object
                  'Java': return a ZonedDateTime object
    Returns:
        - DateTime specified by when
        - datetime specified by when if output = 'Python'
        - ZonedDateTime specified by when if output = 'Java'
    """
    log.debug('when is: ' + str(when) + ' output is ' + str(output))

    dt_python = None
    dt_java = None

    try:
        if isinstance(when, DateTime):
            log.debug('when is DateTime: '+str(when))
            dt_java = to_java_zoneddatetime(when)

        elif isinstance(when, (str, unicode)):
            if is_iso8601(when):
                log.debug('when is iso8601: '+str(when))
                dt_java = ZonedDateTime.parse(str(when))

            else:
                log.debug('when is duration: ' + str(when))
                dt_python = datetime.now() + parse_duration(when, log)

        elif isinstance(when, int):
            log.debug('when is int: ' + str(when))
            dt_java = ZonedDateTime.now().plus(when, ChronoUnit.MILLIS)

        elif isinstance(when, (scope.DateTimeType)):
            log.debug('when is DateTimeType: ' + str(when))
            dt_java = to_java_zoneddatetime(DateTime(str(when)))

        elif isinstance(when, (scope.DecimalType, scope.PercentType, scope.QuantityType)):
            log.debug('when is decimal, percent or quantity type: ' + str(when))
            dt_python = datetime.now() + timedelta(milliseconds = when.intValue())

        elif isinstance(when, datetime):
            log.debug('when is datetime: ' + str(when))
            dt_python = when

        elif isinstance(when, ZonedDateTime):
            log.debug('when is ZonedDateTime: ' + str(when))
            dt_java = when

        elif isinstance(when, time):
            log.debug('when is python time object: ' + str(when))
            dt_java = ZonedDateTime.now().withHour(when.hour).withMinute(when.minute).withSecond(when.second)

        else:
            log.warn('When is an unknown type {}'.format(type(when)))
            return None

    except:
        log.error('Exception: {}'.format(traceback.format_exc()))

    if output == 'Python':
        log.debug('returning dt python')
        return dt_python if dt_python is not None else to_python_datetime(dt_java)
    elif output == 'Java':
        log.debug("returning dt java")
        return dt_java if dt_java is not None else to_java_zoneddatetime(dt_python)
    else:
        log.debug("returning dt joda")
        #timezone from python to joda can fail. using system timezone
        return (to_joda_datetime(dt_java) if dt_java is not None 
                        else to_joda_datetime(dt_python.replace(tzinfo=None)))

def to_today(when, log=logging.getLogger("{}.time_utils".format(LOG_PREFIX)), output='Joda'):
    """Takes a when (see to_datetime) and updates the date to today.
    Arguments:
        - when : One of the types or formats supported by to_datetime
        - log: optional logger, when not supplied one is created for logging errors
    Returns:
        - DateTime specified by when with today's date.
        - datetime specified by when if output = 'Python'
        - ZonedDateTime specified by when if output = 'Java'
    """
    log.debug('output is: '+ str(output))

    if output == 'Python':
        dt = to_datetime(when, log=log, output = 'Python')
        return datetime.combine(date.today(), dt.timetz())
    
    elif output == 'Java':
        dt = to_datetime(when, log=log, output = 'Java')
        now = dt.now()
        return (now.withHour(dt.getHour())
                   .withMinute(dt.getMinute())
                   .withSecond(dt.getSecond())
                   .withNano(dt.getNano()))
        
    else:
        dt = to_datetime(when, log=log)
        now = dt.now()

    return (now.withTime(dt.getHourOfDay(), dt.getMinuteOfHour(),
                         dt.getSecondOfMinute(), 0))
