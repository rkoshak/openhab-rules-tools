# Rate Limit
This is an implementation of [Design Pattern: Rule Latching](https://community.openhab.org/t/design-pattern-rule-latching/32748).

# Purpose
This class keeps track of when the last command was passed to it and the amount of time to block any further commands, a latch.
Any commands that are sent to the class before the time has expired will be ignored.

This class is similar to the gatekeeper class except that instead of queuing up the commands, commands that occur during the timeout are ignored.

# Requires

## Python
- openHAB 2.x
- Nexty-Gen Rules Engine installed and configured
- Jython installed and configured
- Jython Helper Libraries installed and configured
- `time_utils` for converting many different ways to represent a time for the limit to a DateTime.

## JavaScript
- openHAB 3.x
- `time_utils` for converting many different ways to represent a duration to  a ZonedDateTime.

# How it works
Instantiate the RateLimit class.
Call the `run` command with the function and the amount of time to block.
The time can be passed in any combination of days, hours, minutes, seconds, and milliseconds.

Any subsequent call to `run` before the defined time has expires will be ignored.

## Python

```python
run(func, days=0, hours=0, mins=0, secs=0, msecs=0)
```

Argument | Purpose
-|-
`func` | The function to call if the latch is not engaged.
`days` | The number of days to latch.
`hours` | The number of hours to latch.
`mins` | The number of minutes to latch.
`secs` | The number of seconds to latch.
`msecs` | The number of milliseconds to latch.

### Examples

```python
from community.rate_limit import RateLimit

latch = RateLimit()
...

    # From a Rule, call the latch to limit how often the a command can be sent.
    # Let's say we don't want an alert more than once per hour. Any subsequent
    # calls to this latch will be dropped until an hour has passed.
    latch.run(lambda: events.sendCommand("Alert", "Somethings wrong!"), hours=1)
```
## JavaScript

```javascript
RateLimit.run(func, when);
```

Argument | Purpose
-|-
`func` | The function to call if the latch is not engaged.
`when` | Any of the Strings or Objects supported by time_utils.

### Examples

```javascript
var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
load(OPENHAB_CONF+'/automation/lib/javascript/community/rateLimit.js');

var runme = function() {
  // latched code goes here
}

this.rl = (rl === undefined) ? new RateLimit() : this.rl;

this.rl.run(runme, "24h"); // after the first run will wait 24 hours before it's allowed to run again
```