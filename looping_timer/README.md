# Looping Timer
This library implements a class that greatly simplifies the creation and use of looping Timers.
A Looping Timer is one that executes and reschedules itself to run again until some critera is met.

# Dependencies
- time_utils: uses time_utils to convert various time duration formats to a DateTime usable by createTimer.

# Purpose
Often times one needs to set up a polling period to repeat a task every so often as long as certain criteria are met (e.g sending an alert and flashing the lights while an alarm is ON).
Another use case is where a poll needs to go on forever but the time between polls depends on some criteria (e.g. changing how often Grafana charts are rendered based on the state of an Item).
This class implements all the book keeping and presents a simple interface to create, check for the existence of a Timer, cancelling of Timers, etc.

# How it works
The class provides three functions including the consructor.

## LoopingTimer
This is the constructor. When the class is created it immediately starts the timer loop.

```python
lp = LoopingTimer(function, when)
```

Argument | Purpose
-|-
`function` | Function that gets called when the timer expires. It must return the time for the next iteration of the loop in any format supported by time_utils.to_datetime. When function returns None the looping stops.
`when` | Optional argument to delay when the first iteration of the loop runs. Any value supported by time_utils.to_datetime is supported. By default it is None which means `function` is called immediately.

## cancel
Cancels the Timer.
Does nothing if the timer has already terminated.

```python
lp.cancel()
```

## hasTerminated
Returns True if the timer has terminated or if it doesn't exist for some reason.

```python
if lp.hasTerminated():
```

# Examples

A forever polling example where the polling period depends on an Item's state.

```python
from core.rules import rule
rom core.triggers import when
from community.looping_timer import LoopingTimer

timer = None

def pull_charts(log, period, poll):
    """Called by the looping timer."""

    # Calculate thg next polling time before doing the work so the polling is
    # even. Make sure the period is longer than it takes to do the work though.
    next_time = to_datetime(poll_time)

    # Code to generate the charts

    # We loop forever so always return the next time to run this.
    return next_time

@rule("Generate Charts")
@when("System started")
@when("Item ChartVisibility changed")
def charting(event):
    """Kicks off the polling timer loop, first cancels the existing one."""

    # Maps a chart period to a polling period.
    polling = { "h": "1m",
                "d": "5m",
                "w": "15m",
                "M": "1h",
                "Y": "1d"}

    # Default to h
    period = ("h"
              if isinstance(items["ChartVisibility"], UnDefType)
              else str(items["ChartVisibility"]))

    # Cancel the timer if there is one
    global timer
    if timer:
        timer.cancel()

    # Start a looping timer to pull new charts. We are not passing when so it
    # will call pull_charts immediately.
    timer = LoopingTimer(lambda: pull_charts(chart_poll.log, period, polling[period]))

def scriptUnloaded():
    """Cancel the timer."""

    if timer:
        timer.cancel()
```

Here's an example that sends an alert and flashes the lights every five minutes as long as `gAlarms` is ON.
`gAlarms` is defines as:

```
Group:Switch:OR(ON,OFF) gAlarms
```

```python
from core.rules import rule
from core.triggers import when
from commnuity.looping_timer import LoopingTimer
from personal.util import send_alert

timer = None

def alert(log):
    """Called every time the looping timer expires, toggles the lights and sends
    an alert. send_alert is defined in a personal util.py module.
    """

    events.sendCommand("gLights", "ON" if items["gLights"] == OFF else "OFF")
    send_alert(log, "An alarm is ON!")
    return "5s"

@rule("Alarm Alert")
@when("gAlarms changed")
def alarm_alert(event):
   """Triggers when gAlarms changes state. If there is a Timer cancel it. If the
   new state is ON, create a looping timer to flash the lights and send an alert.
   """

    if timer:
        timer.cancel()

    if event.itemState == ON:
        timer = LoopingTimer(lambda: alert(alarm_alert.log))

```

Here's a simple timer that counts down from 10 every second.

```php
num = 10

def count_down():
    global num
    num -= 1
    return "1s"

LoopingTimer(count_down)
```
