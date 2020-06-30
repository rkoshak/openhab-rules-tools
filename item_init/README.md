# Item Initialization
Sometimes one needs to represent a static value as an Item.
Others need to boot strap the state of an Item after it's first created.
And still others need to be able to reset the state of an Item at openHAB start time.

# Purpose
This script will initialize all Items with the `init` metadata defined at openHAB start.
There is a flag that indicates whether the initialize the Item only when it's NULL or UNDEF or whether to override the Item's state.
There is also a flag to delete the metadata once the Item is initialized (only works if the Item and metadata is defined in JSONDB, not with .items files defined).

# How it works
Define the metadata on the Item of the followig format:

```
init="state"[override="True", clear="True"]
```

Argument | Purpose
-|-
`"state"` | A String representation of the state to initialize the Item
`override` | Optional, when True the Item will be updated to `"state"` even if it has a no-UnDeftype state.
`clear` | Optional, when True the init metadata will be removed after the Item is updated. Only works with Items and metadata defined in JSONDB.

If one does not already exist, a new `InitItems` Item will automatically be created.
When this Item receives an `ON` command, that will trigger the rule to reinitialize the Items.

# Examples

```
// Set Presence to OFF at boot every time
Switch Presence { init="OFF"[override="True"] }

// Initialize MyLamp to 123,45,67 if it's NULL or UNDEF at start
Color MyLamp { init="123,45,67" }

// Initialize TerhermostSetpoint to 70 but only if it's NULL or UNDEF, remove
// the init metadata after start.
Number ThermostatSetpoint { init="70"[override="False", clear="True"] }
```
