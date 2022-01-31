# Meter Reading
Rules generating from this template will add the delta from the current reading to the previous reading and save that to another Item.
Should the Item become re-set back to zero (because of a power lost for example) the sum Item will continue at the last total instead of resetting too.
This can be useful for devices that report an accumulated reading that gets reset when the device loses power.
See https://community.openhab.org/t/meter-reading/132693 for full documentation.

# Rules Language
ECMAScript 2021 (JS Scripting add-on)