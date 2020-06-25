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

def parse_duration(time_str):
    """Calls parse_duration with a newly created logger. A warning will be
    logged if the string is not parsable. See parse_duration(time_str, log) for
    more details.
    """
    parse_duration(time_str, logging.getLogger("{}.parse_duration".format(LOG_PREFIX)))

def parse_duration(time_str, log):
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
    Returns:
        A ``datetime.timedelta`` object representing the supplied time duration
        or ``None`` if ``time_str`` cannot be parsed.
    """
    parts = regex.match(time_str)
    if parts is None:
        log.warn("Could not parse any time information from '{}'. Examples "
                  "of valid strings: '8h', '2d8h5m20s', '2m 4s'"
                   .format(time_str))
        return None
    else:
        time_params = {name: float(param) for name, param in parts.groupdict().items() if param}
        return timedelta(**time_params)
