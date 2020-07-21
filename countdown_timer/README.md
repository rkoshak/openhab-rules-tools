# Countdown Timer
This library is written based off of the Rules DSL [Design Pattern: Countdown Timer](https://community.openhab.org/t/design-pattern-expire-binding-based-countdown-timer/49225) by rossko57.

This library represents a Timer that updates a passed in Item with the amount of time remaining on the timer.
It supports representing the time as a number of seconds or as a string of the format `[D day[s], ][H]H:MM:SS`

# Purpose
To show on the UI and/or use the amount of time remaining on a Timer in rules.

# How it works
The class implements a looping Timer that goes off every second until the time is reached.
On each time throught the loop it updates the passed in Item with the amount of time remaining.
When the end of the time is reached, the passed in function is called.

## CountdownTimer constructor
This creates an instance of the CountdownTimer.
A number of arguments are required.

```python
countdownTimer = new CountdownTimer(log, time, func, count_item)
```
Argument | Purpose
-|-
log | The logger to use for logging out debug information. All log statements are at the debug level.
time | The DateTime when the Timer should expire. For now it requires a Joda DateTime but that will change in OH 3.
func | The function to call when the Timer expires.
count_item | The name of the Number or String Item that keeps the time remaining on the Timer.

## hasTerminated
Calls hasTerminated on the timer.

## cancel
Stops the timer.

# Examples

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
