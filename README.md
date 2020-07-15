# openHAB Rules Tools
Library functions, classes, and examples to reuse in the development of new Rules.
The primary focus is on building tools to solve commonly needed tasks instead of fully realized capabilities.
But some full capabilities will inevitably be added over time.

To start, this library will primarily contain Jython libraries but over time I expect to include other languages.

# Prerequisites
- openHAB 2.5 or later
- the Next-Gen Rules Engine add-on installed
- for Jython libraries, the Jython add-on installed and configured: https://community.openhab.org/t/beta-testers-wanted-jython-addon-w-helper-libraries-requires-oh-2-5-x/86633

# Installation
Clone the repository to your local system.
Each library is made up of zero or more library modules and zero or more rule scripts.
To make installation of individual capabilities easier, each capability is located in it's own folder.
Copy the `automation` folder under a given capability's folder to `$OH_CONF`.

The README in each folder documents the purpose and usage of that library.
Pay attention as some libraries depend on others (e.g. `timer_mgr` depends upon `time_utils`).

Many capabilities also have unit tests located in the `test` folder.
To test the library, copy the contents of the `test` folder to `$OH_CONF/automation/jsr223/<language>/community`.
Watch the logs for errors or success.
Once the tests have run, remove the test files so they do not run on every restart of OH.

Some capabilities will automatically create needed Items if they do not already exist.

# Usage
Each rule and libary class and function has the usage information documented in the source code and the README.md file in each capability's folder.
The unit tests are also another good place to find usage examples.

# Future Plans
To start this repo will contain Python and Rules DSL rules.
Over time JavaScript versions of the same rules will be added.
The ultimate goal is to develop rule templates usable from the OH UI Rules Editor or through the REST API.

# List of capabilities

Capability | Type | Purpose | Dependencies
-|-|-|-
`countdown_timer` | module | Implements a Timer that updates an Item with the number of seconds remaining on the timer every second until the Timer expires. | None
`debounce` | script | Implements debounce or antiflapping on Items with "debounce" metadata. | `timer_mgr`, `time_utils`, `rules_utils`
`deferred` | module | Schedules a command or update to be sent to an Item in the future. |  `timer_mgr`, `time_utils`
`ephem_tod` | script | Implements the Time of Day design pattern example using Item metadata and Ephemeris. | `timer_mgr`, `time_utils`, `rules_utils`
`expire` | script | A drop in replacement for the Expire 1.x binding. | `deferred`, `timer_mgr`, `time_utils`, `rules_utils`
`gatekeeper` | module | Enforces a delay between actions. | None
`hystersis` | module | A simple function to calculate a hysteresis comparison. | None
`item_init` | script | Rule that runs at startup or when commanded that initializes the state of Items as defined in the Item's metadata. | None
`mqtt_eb` | script | A set of rules that implement an MQTT event bus to synchronize two or more openHAB instnaces. | `rules_utils`, MQTT 2.5+ binding properly configured
`rate_limit` | module | Enforces a timeout where actions that occur inside the timeout are ignored. | None
`rules_utils` | module | Eome functions to help in the dynamic loading/reloading of rules to refresh their triggers. | None
`time_utils` | module | Some functions to help parse and convert various representatiosns of time and time durations. | None
`timer_mgr` | module | Manages a whole collection of Timers with four simple functions. | `time_utils`
