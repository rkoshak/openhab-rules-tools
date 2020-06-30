# Gatekeeper

This library implements the [Gatekeeper Design Pattern](https://community.openhab.org/t/design-pattern-gate-keeper/36483) in Python.

# Purpose
There are situations where one needs to add in delays between commands.
Sometimes these delays are to deal with limitations of hardware that commands are sent to (e.g. don't send more than one command per 500 msec to  a Hue Hub).
Other times there may be a sequence of commands to send with a delay between the commands, such as implemented in the [Cascading Timers Design Pattern](https://community.openhab.org/t/design-pattern-cascading-timers/31791).
A third example is where one wants to make sure that a TTS command has finished speaking before issuing a new announcement.

# How it works
The user creates an instance of the Gatekeeper class.
All commands that require delays between them are passed to the instantiated gatekeeper with two arguments:

Argument | Purpose
-|-
`pause` | The number of milliseconds to wait from the *start* of executing the command to when the next command is allowed to run. For example, if 1000 is passed in and the command takes 250 msec to run, the next command will not be allowed to run until 750 msec after the command returned.
`command` | The function to call.

# Examples
## Basic Usage
```python
from community.gatekeeper import Gatekeeper

gk = None

...
    # Inside a rule, create the gatekeeper so you can pass it a logger. The
    # definition of the logger is not shown.
    global gk
    if not gk:
        gk = new Gatekeeper(logger)

    # Inside a rule, add a command to the queue and prevent another command unti
    # a second after this command runs.
    gk.add_command(1000, lambda: events.sendCommand("Foo", ON))

    # Inside another rule where we want to clear the queue.
    gk.cancel_all()

```
## Cascading Timers Example

```python
from core.rules import rule
from core.triggers import when
from community.gatekeeper import Gatekeeper

gk = None

@rule("Sprinkler system start")
@when("Time cron cron 0 0 8 * * ?")
@when("Item Irigation received command ON")
def irrigation(event):

    if not gk:
        global gk
        gk = new Gatekeeper(irrigation.log)
    else:
        # Perform some cleanup in case it was already running.
        gk.cancel_all()
        events.sendCommand("gValves", "OFF")

    # Schedule the irrigation valves to run in squence.
    irrigation.logInfo("Starting irrigation")
    gk.add_command((5*60*1000), lambda: events.sendCommand("Valve1", "ON")) # 5 minutes
    gk.add_command((7*60*1000), lambda: events.sendCommand("Valve2", "ON"))
    gk.add_command((3*60*1000), lambda: events.sendCommand("Valve3", "ON"))
    gk.add_command((5*60*1000), lambda: events.sendCommand("Valve4", "ON"))
    gk.add_command(10, lambda: irrigation.logInfo("Irrigation complete"))

@rule("Cancel irrigation")
@when("Item Irrigation received command OFF")
@when("System started")
def cancel_irrigation(event):
    gk.cancel_all()
    events.sendCommand("gValves", "OFF")

```
