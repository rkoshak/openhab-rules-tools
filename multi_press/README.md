# Multi Press Profile
This script registers as a profile that can be used to track button events from a trigger channel and sends commands representing the number of consecutive taps or a hold / release event to the linked item.

# Purpose
Sometimes it is desirable to fully customize what should happen if a button (momentary switch) attached to a thing is pressed.
For example the button of a Shelly Dimmer device can either control only the output of the same device (no special functions) or send events and not control anything at all. In that second case, OpenHAB has to take care of controlling both the native functions of the device and any special functions.

# Requirements
None

# How it works
The script will register a profile to be used when linking a trigger channel delivering button events to an item receiving commands representing the number of consecutive taps or a hold / release event.
Since profiles are instantiated when an item using the profile is loaded there is no need to trigger reloading of the profile manually (no MultiPress_Reload item is created).

The profile is attached via profile metadata when linking a channel to an item.

```
channel="CHANNEL"[profile="jython:multiPress", on="ON", off="OFF", shortDelay=200, longDelay=1000]
```

Argument | Values | Purpose
-|-|-
`"CHANNEL"` | UID of the channel | The channel that triggers upon pressing or releasing the button.
`on` | Press event | String the channel triggers when the button is pressed. Defaults to `ON`
`off` | Release event | String the channel triggers when the button is released. Defaults to `OFF`
`shortDelay` | Short tap delay | The time in milliseconds to wait for another press after the button has been released. Defaults to `200`
`longDelay` | Long tap delay | The time in milliseconds the button has to be pressed before reporting a hold event. Defaults to `1000`

The item will receive the following commands.

Command | Purpose
-|-
`1` | The button has been pressed and released within `longDelay` milliseconds once.
`2`..`N` | The button has been tapped N times with less than `shortDelay` milliseconds between taps.
`HOLD` | The button has been held pressed for longer than `longDelay` milliseconds.
`RELEASE` | The button has been released after a `HOLD` command has been issued.

When encountering a `HOLD` event previous taps are discarded, so if you tap-tap-hold the button, only `HOLD` is reported.

When defining the item, `autoupdate=false` might be desirable so the item only receives commands but never updates, unless you would like to have the last event reflected in the item state.

# Examples
```
// Channel triggers ON and OFF, default timeouts apply
Item MyButton { channel="mqtt:topic:mosquitto:MyDevice:Input"[profile="jython:multiPress"], autoupdate=false }

// Channel triggers ON and OFF, default timeouts apply, item state doesn't get updated
Item MyButton { channel="mqtt:topic:mosquitto:MyDevice:Input"[profile="jython:multiPress"], autoupdate=false }

// Channel triggers 0 and 1, custom timeouts
Item MyButton { channel="mqtt:topic:mosquitto:MyDevice:Input"[profile="jython:multiPress", on="1", off="0", shortDelay=250, longDelay=2000] }

// Example rule
rule "MyButton functions"
when
    Item MyButton received command
then
    if (receivedCommand == "1") {
        MyCeilingLamp.sendCommand(ON if MyCeilingLamp.state == OFF else OFF)
    } else if (receivedCommand == "2") {
        MyReadingLamp.sendCommand(ON if MyReadingLamp.state == OFF else OFF)
    } else if (receivedCommand == "HOLD") {
        MyCeilingLamp.sendCommand(OFF)
        MyReadingLamp.sendCommand(OFF)
    }
end
```

# Limitations
- Does not handle complex patterns (i.e. tap-tap-hold is only reported as `HOLD`)
