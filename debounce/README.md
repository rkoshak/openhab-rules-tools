# Debounce
When the state of an Item changes, wait a configured amount of time before transferring that new state to a proxy Item.
The Items are designated and time is defined by Item metadata.

# Dependencies
- `time_utils` to parse the debounce duration strings
- `timer_mgr` to manage the timers
- `rules_utils` to dynamically create the rule on command to refresh rule triggers when metadata changes; only required for the Jython version

# Purpose
Often one will have a Group or Item that can flap (rapidly flip between states) and in cases where it changes rapidly, we want to wait for things to settle before we treat the change as "real".
For example, a bad sensor may occasionally flap.
Another example is we may want to wait a couple minutes after everyone leaves before setting an away Switch.

# How it works
To achieve this, we have a proxy Item associated with the sensor Item or Group Item (aggregation of sensors) and we set a Timer to wait a configured amount of time before updating the proxy Item.
There might be cases, such as with presence detection, where the debounce only occurs on one state but not the other (e.g. only debounce turning OFF, immediately process ON).

At a minimum two Items are required:
- Sensor Item or Group which represents the raw sensor events or aggregation of events in the Group case
- Proxy Item which holds the debouncestate used to represent the sensor to openHAB.

```
Switch RawSensor { debounce="ProxySensor"[timeout="2m", state="OFF", command="False"] }
Switch ProxySensor
```
An example of the expected configuration is on the `RawSensor` Item above.

Parameter | Purpose
-|-
`"ProxySensor"` | The name of the Item that proxies the Group.
`timeout` | How long to debounce for, using parse_duration formatting (see time_utils)
`state` | An optional parameter that identifies a comma separated list of states to debounce. All other states will immediately be transferred to the proxy. When not present, all states are debounced.
`command` | Optional parameter. When `True` the Proxy is commanded. When `False` the proxy is updated. Defaults to `False`.

When the Debounce rule is by an Item changing to one of the defined debounce states, the rule creates a Timer to update the Proxy in the `timeout` amount of time.
When the Timer goes off, `state` is sent as a command or an update to Proxy depending on the value of `command`.

If the RawSensor changes state away from the state that caused a Timer to be created, the Timer is cancelled.
If the new state is a debounce state a new Timer is created.

In all cases, if the new state is not a debounce state, the Proxy Item is immediately updated or commanded depending on the value of `command` but only if the Proxy Item's state is different.

It should work with non-binary type Items but it's only been tested with binary ones.

## JavaScript
This code does not depend on the openHAB Helper Libraries.
All Items that need to be debounce need to be added a to a Group named `Debounce`.
When any member of that Group's state changes the rule will trigger to debounce the Item based on the metadata.

NOTE: This rule does not have any error checking. 

## Jython
This code depedns on the openHAB Helper Libraries.
Rules have a limitation that there is no event created when Item metadata is added, modified, or removed.
Therefore there is no way to know when you've changed the Item metadata for an Item.
Thus, if it doesn't already exist, a `Reload_Debounce` Item will be created that will recreate the Debounce rule with new triggers based on the current metadata.
After modifying debounce Item metadata, send an `ON` command to the `Reload_Debounce` Item or execute the `Reload Debounce` rule in PaperUI by clicking the "play" icon next to the rule in the list.

When the script is loaded or when the `Reload Debounce` rule runs, all the Items with debounce metadata are obtained and the configuration checked for validity.
Invalid configs will generate errors in the logs.
If the config is valid, changes to the Item will be added as a trigger to the Debounce rule.

# Examples

There is no code to write or configuration beyond Item metadata.

Debounce all states by 2 seconds with updates.
```
Switch RawSensor { debounce="ProxySensor"[timeout="2s"]}
Switch ProxySensor
```

Debounce only the OFF state on a Group representing an aggregation of presence sensors and command the Proxy.
```
Group:Switch:OR(ON,OFF) gPresence { debounce="vPresence"[timeout="2m", state="OFF", command="True"] }
Switch Person1Presence (gPresence)
Switch Person2Presence (gPresense)
Switch vPresence
```

In a rule you can react to the debounced state.

```python
from core.rules import rule
from core.triggers import when

@rule("Everyone is away")
@when("Item vPresence changed to OFF)
def away(event):
    away.log.info("Everyone is away")
```

# Limitations
Adding new metadata to Items will require a reload of the script file with Jython.
If there are no Items with debounce metadata an error will appear when the Jython script is loaded.
