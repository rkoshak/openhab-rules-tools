# Presence Simulation
A rule template that will play back the states of a Group of Items from x days ago to simulate presence.

# Dependencioes
None

# How it works
The rule template supports some configuration parameters to indicate which Group of Items, the Item that turns the simulaiton on or off, etc.
The enable Switch Item works opposite one might expect so that a user can use the OFF state of a presense Item to enable the rule.

The rule triggers every X minutes (5 by default).
When it runs it looks at the default persistence back Y days (7 by default) and if the Item is not currently in that state, commands it to that state.

# Installation and Configuration
This rule template has been posted to the openHAB Marketplace.
