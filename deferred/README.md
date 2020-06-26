# Deferred Actions
There are times where a user may want to schedule a command or update to be sent to an Item after a given period of time.
This library handles the creation and management of the timers.

# Dependencies
- time_utils used to parse various forms of time durations into something that can be used to schedule a Timer
- timerMgr used to manage the Timers

# Purpose
Simplifies the use case where command or update should be scheduled to be sent at sometime in the future.
Creating a Timer for this is possible but this library deals with all that book keeping and management of the Timers.
The delay can be defined using a parsed duration string of the format "xd xh xm xs" (see parse_duration) or a DateTime.

# How it works
Import and call the `deferred` function and, if required, the `cancel` and `cancel_all` functions.

## deferred
This is the function that will be used the most.

```python
deferred(target, value, "5m", log, is_command=True)
```

Argument | Purpose
-|-
`target` | The name of the Item
`value` | The state or the command to send
`when` | The time to issue the command or state. See `to_datetime` in time_utils for details
`log` |logger
`is_command` | Indicates whether to send a command or post update


## cancel
Cancels the Timer for the given Item.

```python
cancel("Name")
```

## cancel_all
Cancels all the existing Timers.

```python
cancel_all()
```

# Examples

```python
from community.timer_mgr import deferred, cancel, cancel_all


...

    # In a Rule, send a command to Foo in 5 minutes
    deferred("Foo", "ON", "5m", log)

    # In a Rule, send a n update to Foo in 5 minutes using DateTime
    deferred("Foo", "OFF", DateTime().now().plusMinutes(5), log, is_command=False)

    # Cancel the deffered action for Foo
    cancel("Foo")

    # Cancel all the deferred actions
    cancel_all()
```
