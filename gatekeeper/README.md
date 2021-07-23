# Gatekeeper

This library implements the [Gatekeeper Design Pattern](https://community.openhab.org/t/design-pattern-gate-keeper/36483) in Python and JavaScript.

# Dependencies

## Python
- openHAB 2.x
- Next-Gen Rule Engine installed and configured
- Helper Libraries installed and configured
- `time_utils` to parse the delay string

## JavaScript
- openHAB 3.x
- `time_utils` to parse the delay string

# Purpose
There are situations where one needs to add in delays between commands that come in very close together.
Sometimes these delays are to deal with limitations of hardware that commands are sent to (e.g. don't send more than one command per 500 msec to  a Hue Hub).
Other times there may be a sequence of commands to send with a delay between the commands, such as implemented in the [Cascading Timers Design Pattern](https://community.openhab.org/t/design-pattern-cascading-timers/31791).
A third example is where one wants to make sure that a TTS command has finished speaking before issuing a new announcement.

# How it works
The user creates an instance of the Gatekeeper class.
All commands that require delays between them are passed to the instantiated gatekeeper with two arguments:

Argument | Purpose
-|-
`pause` | A time duration in any of the formats supported by time_utils.to_datetime.
`command` | The function to call.

# Examples

## JavaScript
```javascript
var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
load(OPENHAB_CONF + "/automation/lib/javascript/community/gatekeeper.js");

this.gk = (this.gk === undefined) ? new Gatekeeper() : this.gk;

// Add a command to the queue and prevent another command until a second has passed
gk.addCommand("1s", function(){ events.sendCommand("Foo", "ON"); });

// Cancel all the commands on the queue
gk.cancelAll();
```

### Cascading Timers Example
```javascript
var logger = Java.type("org.slf4j.LoggerFactory").getLogger("org.openhab.model.script.Irrigation");
var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
load(OPENHAB_CONF + "/automation/lib/javascript/community/gatekeeper.js");

this.gk = (this.gk === undefined) ? new Gatekeeper() : this.gk;

if(event.itemCommand = ON) {
  logger.info("Starting Irrigation");
  this.gk.addCommand("5m", function(){ events.sendCommand("Valve1", "ON"); });
  this.gk.addCommand("7m", function(){ events.sendCommand("Valve2", "ON"); });
  this.gk.addCommand("3m", function(){ events.sendCommand("Valve3", "ON"); });
  this.gk.addCommand("5m", function(){ events.sendCommand("Valve4", "ON"); });
  this.gk.addCommand(10, function(){ logger.info("Irrigation complete");});
}
else {
  this.gk.cancelAll();
  events.sendCommand("gValves", "OFF");
}
```

## Python
```python
from community.gatekeeper import Gatekeeper

gk = None

...
    # Inside a rule, create the gatekeeper so you can pass it a logger. The
    # definition of the logger is not shown.
    global gk
    if not gk:
        gk = new Gatekeeper(logger)

    # Inside a rule, add a command to the queue and prevent another command until
    # a second after this command runs.
    gk.add_command(1000, lambda: events.sendCommand("Foo", ON))
    gk.add_command("2s", lambda: events.sendCommand("Bar", OFF))

    # Inside another rule where we want to clear the queue.
    gk.cancel_all()

```
### Cascading Timers Example

```python
from core.rules import rule
from core.triggers import when
from community.gatekeeper import Gatekeeper

gk = None

@rule("Sprinkler system start")
@when("Time cron cron 0 0 8 * * ?")
@when("Item Irrigation received command ON")
def irrigation(event):

    if not gk:
        global gk
        gk = new Gatekeeper(irrigation.log)
    else:
        # Perform some cleanup in case it was already running.
        gk.cancel_all()
        events.sendCommand("gValves", "OFF")

    # Schedule the irrigation valves to run in sequence.
    irrigation.logInfo("Starting irrigation")
    gk.add_command("5m", lambda: events.sendCommand("Valve1", "ON")) # 5 minutes
    gk.add_command("7m", lambda: events.sendCommand("Valve2", "ON"))
    gk.add_command("3m", lambda: events.sendCommand("Valve3", "ON"))
    gk.add_command("5m", lambda: events.sendCommand("Valve4", "ON"))
    gk.add_command(10, lambda: irrigation.logInfo("Irrigation complete"))

@rule("Cancel irrigation")
@when("Item Irrigation received command OFF")
@when("System started")
def cancel_irrigation(event):
    gk.cancel_all()
    events.sendCommand("gValves", "OFF")

```
