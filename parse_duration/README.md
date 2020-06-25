# Parse Duration
A function to parse a time duration string into a Python timedelta object.
Note, several other libraries in this repo depend upon this library.

# Purpose
It can be useful, particularly when working with Item metadata, to define a duration in a more rich manner than just "number of seconds."
This function will parse a string into a Python datetime.timedelta which can then be used for time operations by the calling code.

# How it works
Call parse_duration with a string of the format: `xd xh xm xs` where `x` is a number.
Spaces between each field are optional.
Each field is optional but at least one must be present.
The number can be an `int` or a `float` so `1d12h` is equivalent to `1.5d` as well as `36h`.
If the string cannotbe parsed a warning will be logged and None returned.

```python
duration = parse_duration("1d12h")
```

If a logger is not passed to the function, the warning will be logged to the `parse_duration` logger.

# Examples

```python
from community.parse_duration import parse_duration


...

    # In a Rule, create a timedelta for 5 minutes 15 seconds.
    delta = parse_duration("5m 15s")
```
