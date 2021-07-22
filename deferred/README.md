# Deferred Actions
There are times where a user may want to schedule a command or update to be sent to an Item after a given period of time.
This library handles the creation and management of the timers.

# Dependencies (both Python and JavaScript)
- time_utils used to parse various forms of time durations into something that can be used to schedule a Timer
- timer_mgr used to manage the Timers

# Purpose
Simplifies the use case where command or update should be scheduled to be sent at sometime in the future.
Creating a Timer for this is possible but this library deals with all that book keeping and management of the Timers.
The delay can be defined using a parsed duration string of the format "xd xh xm xs" (see parse_duration) or a DateTime.

# How it works

## Python
Import and call the `defer` function and, if required, the `cancel` and `cancel_all` functions.

### deferred
This is the function that will be used the most.

```python
defer(target, value, "5m", log, is_command=True)
```

Argument | Purpose
-|-
`target` | The name of the Item
`value` | The state or the command to send
`when` | The time to issue the command or state. See `to_datetime` in time_utils for details
`log` |logger
`is_command` | Indicates whether to send a command or post update

A second call to defer while a timer already exists will cause the timer to be rescheduled with `when`.
Beware, `value` is ignored in that case.
If you want to reschedule and change the `value` you must call `cancel` first.

### cancel
Cancels the Timer for the given Item.

```python
cancel("Name")
```

### cancel_all
Cancels all the existing Timers.

```python
cancel_all()
```

### Examples

```python
from community.timer_mgr import defer, cancel, cancel_all


...

    # In a Rule, send a command to Foo in 5 minutes
    defer("Foo", "ON", "5m", log)

    # In a Rule, send a n update to Foo in 5 minutes using DateTime
    defer("Foo", "OFF", DateTime().now().plusMinutes(5), log, is_command=False)

    # Cancel the deferred action for Foo
    cancel("Foo")

    # Cancel all the deferred actions
    cancel_all()
```

## JavaScript

Import the `deferred.js` library and use the `Deferred` class.

### `defer`

This is the function you will use the most

```
Deferred.defer(target, value, when, isCommand);
```

Argument | Purpose
-|-
`target` | The name of the Item
`value` | The state or the command to send
`when` | The time to issue the command or state. See `to_datetime` in time_utils for details
`isCommand` | Indicates whether to send a command or post update. This parameter is optional and defaults to false

A second call to defer while a timer already exists will cause the timer to be rescheduled with `when`.
Beware, `value` is ignored in that case.
If you want to reschedule and change the `value` you must call `cancel` first.

### `cancel`
Cancels the Timer for the given Item.

```javascript
Deferred.cancel("ItemName");
```

### `cancel_all`
Cancels all the existing Timers.

```javascript
Deferred.cancel_all();
```

### Examples

```javascript
var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
load(OPENHAB_CONF + "/automation/lib/javascript/community/deferred.js");
var ZonedDateTime = Java.type(java.time.ZonedDateTime);

this.def = (def === undefined) ? new Deferred() : this.def;

...

    // In a Rule, send a command to Foo in 5 minutes
    this.def.defer("Foo", "ON", "5m");

    // In a Rule, send a n update to Foo in 5 minutes using ZonedDateTime
    this.def.defer("Foo", "OFF", ZonedDateTime.now().plusMinutes(5), false);

    // Cancel the deferred action for Foo
    this.def.cancel("Foo");

    // Cancel all the deferred actions
    this.def.cancel_all()
```

