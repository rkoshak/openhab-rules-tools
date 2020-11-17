# openHAB Rules Tools
Library functions, classes, and examples to reuse in the development of new rules.
The primary focus is on building tools to solve commonly needed tasks instead of fully realized capabilities.
But some full capabilities will inevitably be added over time.

# Prerequisites
- openHAB 2.5 or later for Jython rules and openHAB 3 or later for JavaScript rules.
- the Next-Gen Rules Engine add-on installed (openHAB 2.5 only)
- for Jython libraries, the Jython add-on installed and configured: https://community.openhab.org/t/beta-testers-wanted-jython-addon-w-helper-libraries-requires-oh-2-5-x/86633. JavaScript works out of the box.

# Installation
Clone the repository to your local system.
Each library is made up of zero or more library modules and zero or more rule scripts.
To make installation of individual capabilities easier, each capability is located in it's own folder.
Copy the `automation` folder under a given capability's folder to `$OH_CONF`.

For JavaScript rules, open the YAML file can copy the contents to the `code` tab of a new rule in MainUI in openHAB 3.
The README for those capabilities that require this will indicate when this is necessary.
Eventually there will be some sort of marketplace an the rules can be installed through that.

The README in each folder documents the purpose and usage of that library.
Pay attention as some libraries depend on others (e.g. `timer_mgr` depends upon `time_utils`).

Many capabilities also have unit tests located in the `test` folder.
Read the "Testing" section for instruction for how to run the tests.
Always watch the logs for errors or success.
Once the tests have run, remove the test files so they do not run on every restart of OH.
This should only be required for those modifying the scripts and modules.

Some capabilities will automatically create needed Items if they do not already exist.
This is indicated in the readmes for the individual capabilities.

# Usage
Each rule and library class and function has the usage information documented in the source code and the README.md file in each capability's folder.
The unit tests are also another good place to find usage examples.

# List of capabilities

Capability | Type | Purpose | Dependencies | Jython | JavaScript (JSONDB) | Notes
-|-|-|-|-|-|-
`countdown_timer` | module | Implements a Timer that updates an Item with the number of seconds remaining on the timer every second until the Timer expires. | None | X |  
`debounce` | script | Implements debounce or antiflapping on Items with "debounce" metadata. | `timer_mgr`, `time_utils`, `rules_utils` | X | X | JavaScript version does not require `rules_utils`
`deferred` | module | Schedules a command or update to be sent to an Item in the future. |  `timer_mgr`, `time_utils` | X | |
`ephem_tod` | script | Implements the Time of Day design pattern example using Item metadata and Ephemeris. | `timer_mgr`, `time_utils`, `rules_utils` | X | X | JavaScript version does not require `rules_utils`
`expire` | script | A drop in replacement for the Expire 1.x binding. | `deferred`, `timer_mgr`, `time_utils`, `rules_utils` | X | | Deprecated for openHAB 3, it will be part of the core.
`gatekeeper` | module | Enforces a delay between actions. | `time_utils` | X | |
`hysteresis` | module | A simple function to calculate a hysteresis comparison. | None | X | |
`item_init` | script | Rule that runs at startup or when commanded that initializes the state of Items as defined in the Item's metadata. | None | X | | Deprecated for openHAB 3, it's better to initialize Items from the UI
`looping_timer` | module | Class that implements a looping timer. | `time_utils` | X | |
`mqtt_eb` | script | A set of rules that implement an MQTT event bus to synchronize two or more openHAB instances. | `rules_utils`, MQTT 2.5+ binding properly configured | X | | For simple openHAB to openHAB connections use the new Remote openHAB binding
`rate_limit` | module | Enforces a timeout where actions that occur inside the timeout are ignored. | `time_utils` | X | |
`rules_utils` | module | Some functions to help in the dynamic loading/reloading of rules to refresh their triggers. | None | X | |
`time_utils` | module | Some functions to help parse and convert various representations of time and time durations. | None | X | X |
`timer_mgr` | module | Manages a whole collection of Timers with four simple functions. | `time_utils` | X | |
