# Drop in Replacement for Expire 1.x Binding
This rule implements a replacement for the Expire 1.x binding.
It is not intended to be a permament solution and likely will not be maintained for longafter OH 3.0 comes out.
The purpose of the library is to be a drop in repalcement of the Expire binding to allow users who depend on the Expire binding the chance to move to openHAB 3.0 without needing to rework Rules and Item configs first.

# Purpose
Item metadata that is nearly identical to the binding config for the Expire 1.x binding is used to define a base state and a time to wait after the Item changes from that state before updating or commanding the Item back to that state.

# Requirements
- `time_utils` to process Expire durations and it's needed by `timer_mgr` and deferred
- `deferred` to schedul the command or update to the Item when it expires
- `timer_mgr` to manage the Timer, needed by `deferred`

# How it works

When a 1.x version binding is uninstalled, it's binding config appears to openHAB as Item metadata.
These rules find all the Items that have an expire metadata and reimplements the Expire 1.x binding's behavior.
When an Item changes to a state different from the expire configured state, a Timer is set for the duration.
At the end of the time, the Item is updated to or commanded to the expire state.
If the Item changes while a Timer exists, the Timer is either canceled if it changed to the expire state or it is rescheduled.

Rules have a limitation that there is no event created when Item metadata is added, mofified, or removed.
Therefore there is no way to know when you've changed the Item metadata for an Item.
Thus, if it doesn't already exist, a `Reload_Expire` Item will be created that will recreate the Expire rule with new triggers based on the current metadata.
After modifying expire Item metadata, send an `ON` command to the `Reload_Expire` Item or execute the `Reload Expire` rule in PaperUI by clicking the "play" icon next to the rule in the list.

When the script is loaded or when the `Reload Expire` rule runs, all the Items with expire metadata are obtained and the configuration checked for validity.
Invalid configs will generate errors in the logs.
If the config is valid, changes to the Item will be added as a trigger to the Expire rule.
The expected format is:

```
expire="<duration>[,[command=|state=]<new state>]"
```

Field | Purpose
-|-
`<duration>` | Required, a time duration of the format fully describvd in `parse_time`. In general it's of the format `wd xh ym zs` where w, x, y, z are numbers (floats are allowed) and d is days, h is hours, m is minutes and s is seconds. One of the four are required, spaces are optional.
`[,]` | Optional, if supplying more that just the duration, separates the duration from the type of update and expire state. If just the duration is supplied, the Item will be updated to `UNDEF` after the duration.
`[command=|state=]` | Optional field to indicate if the expire state should be sent as an update or a command. When omitted, state is the default (i.e. update).
`<new state>` | Required if `,` was used, indicates the state the Item should be commanded to or updated to at the end of the expire time. Use `''` to represent the empty String (this differs from the Expire 1.x Binding). Use `'UNDEF'` or `'NULL`' to represent the strings `"UNDEF"` and `"NULL"` for String Items as opposed the `NULL` and `UNDEF` states.

See the next section for examples.

# Examples

Examples (taken from the Expire1 Binding docs):

Item Metadata | What it does
-|-
`expire="1h,command=STOP"` | Send the STOP command after one hour
`expire="5m,state=0"` | Update state to 0 after five minutes
`expire="3m12s,Hello"` | Update state to Hello after three minutes and 12 seconds
`expire="2h"` | Update state to UNDEF 2 hours after the last value

Unique to this implementation:
Item Metadata | What it does
-|-
`expire="5s,state=''"` | Update a String Item to the empty String
`expire="5s,state=UNDEF"` | For String Items, expires to UNDEF, not the string, "UNDEF"
`expire="5s,state='UNDEF'"` | For String Items, expires to the String "UNDEF"
`expire="0.5s,command=OFF"` | Send an OFF command in 500 msec

Example Item:

```
Switch MyButton { expire="0.5,command=OFF" }
```

# Limitations

Modifications to Item metadata require a refresh of the rule or a restart of openHAB to pick up.
Note that Items that currently have a Timer set for them during the reload will not have a new Timer created.
Instead these Timer will continue using the old config until cancelled or rescheduled.
