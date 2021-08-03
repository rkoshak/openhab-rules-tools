# Countdown Timer
This library is written based off of the Rules DSL [Design Pattern: Countdown Timer](https://community.openhab.org/t/design-pattern-expire-binding-based-countdown-timer/49225) by rossko57.

This library represents a Timer that updates a passed in Item with the amount of time remaining on the timer.
It supports representing the time as a number of seconds or as a string of the format `[D day[s], ][H]H:MM:SS` (Python only).

# Dependencies

## JavaScript
- openHAB 3.x
- `timeUtils` to parse the timer duration string

## Python
- openHAB 2.5
- Next Gen Rules Engine installed and configured
- Jython installed and configured
- Helper Libraries installed and configured
- `time_utils` to parse the timer duration string

# Purpose
To show on the UI and/or use the amount of time remaining on a Timer in rules.

# How it works
The class implements a looping Timer that goes off every second until the time is reached.
On each time throught the loop it updates the passed in Item with the amount of time remaining in seconds.
When the end of the time is reached, the passed in function is called.

Note, if using a Number:Time Item to store the time remaining, the same label formatting patterns used by DateTime Items can be used to present the remaining time in hh:mm:ss format.

## JavaScript

### CountdownTimer constructor
This creates an instance of the CopuntdownTimer.
A number of arguments are required.

```javascript
var cdt = new CountdownTimer(time, func, countItem);
```

Argument | Purpose
-|-
time | How long to set the timer for. Supports any of the times and formats supported by timeUtils.toDateTime.
func | Function without arguments to be called at the indicated time
countItem | Name of the Number or String Item to update with the number of remaining seconds. 

### hasTerminated
Returns true iof the timer has finished and executed.

### cancel
Call to stop the timer.

### Examples

```javascript
var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
load(OPENHAB_CONF+'/automation/lib/javascript/community/countdownTimer.js');

var runme = function(){
      // timer code goes here
}
var timer = new CountdownTimer("15s", runme, "TimeLeftItem");
```

## Python

### CountdownTimer constructor
This creates an instance of the CountdownTimer.
A number of arguments are required.

```python
countdownTimer = new CountdownTimer(log, time, func, count_item)
```
Argument | Purpose
-|-
log | The logger to use for logging out debug information. All log statements are at the debug level.
time | How long to set the timer for. Supports any of the types and formats supported by time_utils.to_datetime
func | The function to call when the Timer expires.
count_item | The name of the Number or String Item that keeps the time remaining on the Timer.

### hasTerminated
Calls hasTerminated on the timer.

### cancel
Stops the timer.

### Examples

```python
from community.countdown_timer import CountdownTimer

timer = None
...

    # From a Rule, pass in the logger, the datetime the Timer should go off, any
    # DateTime type supported by the core.date library functions are
    # allowed, the function to call, and the name of the Item to update
    # are passed Object. The Timer starts immediately.
    timer = CountdownTimer(log,
                           (datetime.now() +
                               timedelta(seconds=2,
                               microseconds=100000)),
                           func,
                           number_item_name)
```
