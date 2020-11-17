# Time Utils
A series of utility functions useful for manipulating representations of time durations.

# Purpose
There are many ways to represent time durations.
Most of the time, these durations will need to be converted to a Joda DateTime object (OH 2) or ZonedDateTime (OH 3) for use in scheduling a Timer.
This library has a number of methods to perform these conversions.

# How it works

## JavaScript
The JavaScript version of this library was written for an only tested on openHAB 3.
It does not support Joda DateTime.
This library does not depend on the openHAB Helper Liobraries.

### parseDuration
This function will take a duration string and convert it to a Java Duration Object.
The format of the string is `Xd Xh Xm Xs Xz` where each field is optional and:
- `X` can be an integer
- `d` number of days
- `h` number of hours
- `m` number of minutes
- `s` number of seconds
- `z` number of milliseconds
- spaces are optional

Arguments | Purpose
-|-
`time_str` | String of the above format

```javascript
var dur = parseDuration("1d12h");
```

Returns a java.time.Duration. Returns `null` if the String isn't parsable.

### durationToDatetime
Converts a Duration to a to a ZonedDateTime the defined duration into the future.

```javascript
var dt = durationToDatetime(dur);
```
Returns a ZonedDateTime using the passed in Duration as the time from now.

### isISO8601
Checks the passed in string to verify whether or not it conforms to ISO 8601.

```javascript
if isISO8601("2020-06-26T12:03:00"):
```

Returns `true` if the passed in String conforms to ISO8601.

### toDateTime
Takes in a variety of types and converts them to a ZonedDateTime.

- `ZoneDateTime`: returns `when` as is
- `DateTimeType`: returns `when` as a `ZonedDateTime`
- `int`, `long`: returns `now`  plus `when` milliseconds
- openHAB number type: returns `now` plus `when` milliseconds.
- ISO8601 string: `ZonedDateTime` from parsing the `when`
- Duration definition: see `parseDurationToDatetime`

```javascript
var dt = toDateTime("0.25s");
```

Returns a `ZonedDateTime` based on the passed in value.
If the passed in value is a duration or number, the `ZonedDateTime` is that amount of time from now.

### toToday
Takes in any typoe supported by `toDateTime` and if it has a Date portion that is not for today, moves it to today, leaving the time portion unchanged.

```javascript
var todayTime = toToday(items["MyAlarm"]);
```

Returns a `ZonedDateTime` with the date portion of `when` moved to today.

### Examples

```javascript
this.OPENHAB_CONF = (this.OPENHAB_CONF === undefined) ? java.lang.System.getenv("OPENHAB_CONF") : this.OPENHAB_CONF;
load(OPENHAB_CONF+'/automation/lib/javascript/community/timeUtils.js');

...

// Create a timedelta for 5 minutes 15 seconds.
var delta = parseDuration("5m 15s")

// Create a ZonedDateTime 5 seconds from now
var dt = toDateTime("5s")
```

### Tests
The `timeUtils_tests.js` was written to be used as a Script in openHAB 3's MainUI.
Create a new Script, paste the contents of this file into the form and run the tests by pressing the play button.
Note that these tests are not comprehensive and require manual verification looking at the logs.

## Jython
The Jython version depends on the openHAB Helper Libraries.
### parse_duration
This function will take a duration string and convert it to a Python timedelta Object.
The format of the string is `Xd Xh Xm Xs` where each field is optional and:
- `X` can be an integer or a float; to define milliseconds use 0.Xs (e.g. 500 msec is `0.5s`)
- `d` number of days
- `h` number of hours
- `m` number of minutes
- `s` number of seconds
- spaces are optional

Arguments | Purpose
-|-
`time_str` | String of the above format
`log` | Used to log out error; if not supplied a logger is created named `parse_duration`

```python
td = parse_duration("1d12h")
```

Returns a Python datetime.timedelta. Returns `None` if the String isn't parsable.

### delta_to_datetime
Converts a Python timedelta to a Joda DateTime.

```python
dt = delta_to_datetime(td)
```
Returns a Joda DateTime using the passed in Python timedelta as the time from now.

### parse_duration_to_datetime
Parses a duration string (see above) to a Joda DateTime.

```python
dt = parseduration_to_datetime("5m30s")
```
Returns a Joda Datetime using the passed in duration as the time from now.

### is_iso8601
Checks the passed in string to verify whether or not it conforms to ISO 8601.

```python
if is_iso8601("2020-06-26T12:03:00"):
```

Returns True if the passed in String conforms to ISO 8601.

### to_datetime
Takes in a variety of types and converts them to a JodaDate time.

- DateTime: returns when as is
- int: returns now.plusMillis(when)
- openHAB number type: returns now.plusMillis(when.intValue())
- ISO8601 string: DateTime(when)
- Duration definition: see parse_duration_to_datetime
- Python datetime

Argument | Purpose
-|-
`when` | any of the above supported representation of a date time or a duration.
`log` | optional logger to use for errors and debug
`output` | defaults to `'Joda'`, indicates the type of the date time to return. Supported values are `'Joda'`, `'Python'`, and `'Java'`. Use `'Java'` to get a `ZonedDateTime`.

```python
dt = to_datetime("0.25s")
```

### to_today
Moves the passed in `when` to today's date, preserving the original time.
Supports any type supported by `to_datetime`.

Argument | Purpose
-|-
`when` | any type supported by `to_datetime`
`log` | optional logger for debuggin and errors
`output` | defaults to `'Joda'`, indicates the type of the date time to return. Supported values are `'Joda'`, `'Python'`, and `'Java'`. Use `'Java'` to get a `ZonedDateTime`.

Returns a date time based on the passed in `when` and `output`.
If the passed in value is a duration or timedelta or int, the date time is that amount of time
 
### Examples

```python
from community.parse_duration import parse_duration


...

    # In a rule or library, create a timedelta for 5 minutes 15 seconds.
    delta = parse_duration("5m 15s")

    # In a rule or library
    dt = to_datetime("5s")
 ```

 ### Tests
 Copy time_utils-tests.py to `/etc/openhab2/autoamtion/jsr223/python/personal` to execute the tests.