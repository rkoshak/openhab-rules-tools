# Timer Manager
This library implements a class that greatly simplifies the creation and use of Timers in cases where one needs to create a separate Timer for each individual Item.
For example, one can have a number of Contact Items representing doors in a group.
When any of the doors open a timer is set for that door in order to send an alert if it's been open too long.
This requires a separate Timer for each Item.

# Dependencies
- time_utils: uses time_utils to convert various time duration formats to a DateTime usable by createTimer.

# Limitations
This class cannot be used to program looping timers.

# Purpose
Creating a separate Timer for each Item of a given type is a common requirement and requires the user to do all the book keeping and management of the Timers manually.
This class implements all the book keeping and presents a simple interface to create, check for the existence of a Timer, cancelling of Timers, etc.

# How it works
The class provides four functions.

## JavaScript
### check
This is the function that will be used the most.

```javascript
tm.check(key, when, function, reschedule, flapping_function);
```

Argument | Purpose
-|-
`key` | The unique name for the Timer. Most often this will be the Item name.
`when` | The amount of time to pass before the Timer expires.
`function` | An optional function or lambda to call when the Timer expires. Parameter key is passed through.
`reschedule` | An optional flag indicating that if the Timer exists when check is called, reschedule the Timer. Defaults to `False`.
`flapping_function` | An optional function or lambda to call when check is called and a Timer already exists. Can be useful to, for example, take some action when a device is flapping.

`when` can be any one of:
- `ZonedDateTime`
- openHAB `DateTimeType`
- ISO 8601 formatted String
- `int`, `long` which will be treated as the number of milliseconds into the future
- openHAB number types (DecimalType, PercentType, or QuantityType), treated as number of milliseconds into the future
- Duration string of the format `xdxhxmxs` where each field is optional and x is a number (int or float). For example `1h2s` would be one hour and two seconds into the future

### hasTimer
Returns true is there is a Timer by the passed in name.

```javascript
if(tm.hasTimer("Name")) {
    // do something
}
```

### cancel
Cancels the Timer by the given name.
Does nothing if no Timer by that name exists.

```javascript
tm.cancel("Name");
```

### cancelAll
Cancels all the existing Timers.
Useful to be called from a script_unload function.

```javascript
tm.cancelAll();
```

### Examples

```javascript
this.OPENHAB_CONF = (this.OPENHAB_CONF === undefined) ? java.lang.System.getenv("OPENHAB_CONF") : this.OPENHAB_CONF;
load(OPENHAB_CONF+'/automation/lib/javascript/community/timerMgr.js');
var Log = Java.type("org.openhab.core.model.script.actions.Log");

// Only create a new manager if one doesn't already exist or else it will be wiped out each time the rule runs
this.tm = (this.tm === undefined) ? new TimerMgr() : this.tm;

...

    /**
     * In a Rule, check to see if a Timer exists for this Item. If one
     * exists, log a warning statement that the Item is flapping.
     * Otherwise, set a half second timer and update the Time Item
     * associated with the Item.
     */
   this.tm.check(event.itemName,
                 500,
                 function(key) { events.postUpdate(key + "Time", new DateTimeType().toString()); },
                 true,
                 function(key) { Log.logWarn("Test", key + " is flapping!"); });

...

    /**
     * In a Rule, if the door is OPEN, create a timer to go off in 60
     * minutes to post a message to the Alert Item. If it's NIGHT time,
     * reschedule the Timer. If the door is CLOSED, cancel the reminder
     * Timer.
     */
    if(items[itemName] == OPEN) {
        this.tm.check(itemName,
                      "1h",
                      function(key) { events.postUpdate("AlertItem", key + "has been open for an hour!"); },
                      items["vTimeOfDay"].toString() == "NIGHT");
    else {
        this.tm.cancel(itemName);
    }

...

    // Check to see if a Timer exists for the Item.
    if(reminder_timers.has_timer(itemName)) {
        Log.logWarn("Test", "There already is a timer for " + itemName + "!");
    }
```

### Testing
Copy the contents of timerMgr_tests.js to a new Script created in MainUI on openHAB 3 and press the Play button.

## Jython
### check
This is the function that will be used the most.

```python
tm.check(key, when, function, flapping_function, reschedule)
```

Argument | Purpose
-|-
`key` | The unique name for the Timer. Most often this will be the Item name.
`when` | The amount of time to pass before the Timer expires.
`function` | An optional function or lambda to call when the Timer expires.
`flapping_function` | An optional function or lambda to call when check is called and a Timer already exists. Can be useful to, for example, take some action when a device is flapping.
`reschedule` | An optional flag indicating that if the Timer exists when check is called, reschedule the Timer. Defaults to `False`.

`when` can be any one of:
- Joda DateTime
- ISO 8601 formatted String
- int which will be treated as the number of milliseconds into the future
- openHAB number types (DecimalType, PercentType, or QuantityType), treated as number of milliseconds into the future
- Duration string of the format `xdxhxmxs` where each field is optional and x is a number (int or float). For example `1h2s` would be one hour and two seconds into the future

### has_timer
Returns True is there is a Timer by the passed in name.

```python
if tm.has_timer("Name"):
    # do something
```

### cancel
Cancels the Timer by the given name.
Does nothing if no Timer by that name exists.

```python
tm.cancel("Name")
```

### cancel_all
Cancels all the existing Timers.
Useful to be called from a script_unload function.

```python
tm.cancel_all()
```

### Examples

```python
from community.timer_mgr import TimerMgr


tm = new TimerMgr()

...

    # In a Rule, check to see if a Timer exists for this Item. If one
    # exists, log a warning statement that the Item is flapping.
    # Otherwise, set a half second timer and update the Time Item
    # associated with the Item.
    tm.check(event.itemName,
             500,
             lambda: events.postUpdate("{}_Time".format(event.itemName), str(DateTime.now())),
             lambda: my_rule.log.warn("{} is flapping!".format(event.itemName),
             reschedule=True)

...

    # In a Rule, if the door is OPEN, create a timer to go off in 60
    # minutes to post a message to the Alert Item. If it's NIGHT time,
    # reschedule the Timer. If the door is CLOSED, cancel the reminder
    # Timer.
    if items[itemName] == OPEN:
        reminder_timers.check(itemName,
                              "1h",
                              lambda: events.postUpdate("AlertItem", "{} has been open for an hour!".format(itemName)),
                              reschedule=items["vTimeOfDay"] == StringType("NIGHT"))
    else:
        reminder_timers.cancel(itemName)

...

    # Check to see if a Timer exists for the Item.
    if reminder_timers.has_timer(itemName):
        my_rule.log.warn("There already is a timer for {}!".format(itemName))
```
### Tests
Copy timer_mgr-tests.py to /etc/openhab2/automation/jsr223/python/personal.
Remove the file afterwords or the tests will run every time openHAB starts up.
