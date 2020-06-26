# Time Utils
A series of utility functions useful for manipulating representations of time durations.

# Purpose
There are many ways to represent time durations.
Most of the time, these durations will need to be converted to a DateTime object for use in scheduiling a Timer.
This library has a number of methods to perform these conversions.

# How it works
## parse_duration
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

Returns `None` if the String isn't parsable.

## delta_to_datetime
Converts a Python timedelta to a Joda DateTime.

```python
dt = delta_to_datetime(td)
```

### parse_duration_to_datetime
Parses a duration string (see above) to a Joda DateTime.

```python
dt = parseduration_to_datetime("5m30s")
```

### is_iso8601
Checks the passed in string to verify whether or not it conforms to ISO 8601.

```python
if is_iso8601("2020-06-26T12:03:00"):
```

### to_datetime
Takes in a variety of types and converts them to a JodaDate time.

- DateTime: returns when as is
- int: returns now.plusMillis(when)
- openHAB number type: returns now.plusMillis(when.intValue())
- ISO8601 string: DateTime(when)
- Duration definition: see parse_duration_to_datetime

```python
dt = to_datetime("0.25s")
```

# Examples

```python
from community.parse_duration import parse_duration


...

    # In a rule or library, create a timedelta for 5 minutes 15 seconds.
    delta = parse_duration("5m 15s")

    # In a rule or library
    dt = to_datetime("5s")
 ```
