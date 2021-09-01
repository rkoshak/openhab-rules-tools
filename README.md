# openHAB Rules Tools
Library functions, classes, and examples to reuse in the development of new rules.
The primary focus is on building tools to solve commonly needed tasks instead of fully realized capabilities.
But some full capabilities will inevitably be added over time.

# Prerequisites

## Python
- openHAB 2.x
- the Next-Gen Rules Engine add-on installed
- support for Jython installed (see https://community.openhab.org/t/beta-testers-wanted-jython-addon-w-helper-libraries-requires-oh-2-5-x/86633)
- the Jython Helper Libraries

## JavaScript
- openHAB 3.x

Notes: 

- all the full JavaScript rules are UI rules
- this code is not compatible with the GraalVM JavaScript add-on and will not work when that add-on is installed

# Installation

The README in each folder documents the purpose and usage of that library.
Pay attention as some libraries depend on others (e.g. `timer_mgr` depends upon `time_utils`).

## Python
Clone the repository to your local system.
Each library is made up of zero or more library modules and zero or more rule scripts.
To make installation of individual capabilities easier, each capability is located in it's own folder.
Copy the `automation/jsr223/python` folder and or `automation/lib/python` under a given capability's folder to `$OH_CONF`.

## JavaScript
For rules, open the YAML file can copy the contents to the `code` tab of a new rule in MainUI in openHAB 3.
The README for those capabilities that require this will indicate when this is necessary.

For library capabilities copy the `automation/lib/javascript` colder for a given capability to `$OH_CONF`.

## Tests
Many capabilities also have unit tests located in the `test` folder.
Read the "Testing" section for instruction for how to run the tests.
Always watch the logs for errors or success.
Once the tests have run, remove the test files so they do not run on every restart of OH.
This should only be required for those modifying the scripts and modules.

## Auto-creation
Some capabilities will automatically create needed Items and other rules if they do not already exist.
This is indicated in the readmes for the individual capabilities.
Pay attention to the READMEs for those to avoid naming conflicts.

# Usage
Each rule and library class and function has the usage information documented in the source code and the README.md file in each capability's folder.
The unit tests are also another good place to find usage examples.

# List of capabilities

Capability | Type | Purpose | Dependencies | Jython | JavaScript | Notes
-|-|-|-|-|-|-
`alarm_clock` | script | Implements an alarm clock, can be used with the Android app. | None | | X |
`countdown_timer` | module | Implements a Timer that updates an Item with the number of seconds remaining on the timer every second until the Timer expires. | All: `timer_mgr` | X | X |  
`debounce` | script | Implements debounce or antiflapping on Items with "debounce" metadata. | All: `timer_mgr`, `time_utils`, Python: `rules_utils` | X | X | JavaScript version does not require `rules_utils`
`deferred` | module | Schedules a command or update to be sent to an Item in the future. | `timer_mgr`, `time_utils` | X | X |
`ephem_tod` | script | Implements the Time of Day design pattern example using Item metadata and Ephemeris. | All: `timer_mgr`, `time_utils` Python: `rules_utils` | X | X | JavaScript version does not require `rules_utils`
`expire` | script | A drop in replacement for the Expire 1.x binding. | `deferred`, `timer_mgr`, `time_utils`, `rules_utils` | X | NA | Deprecated for openHAB 3, it is part of the core.
`gatekeeper` | module | Enforces a delay between actions. | `time_utils` | X | X |
[`group_utils`](group_utils) | module | Work with group members' names, labels and states. | None |  | X |
`hysteresis` | module | A simple function to calculate a hysteresis comparison. | None | X | |
`item_init` | script | Rule that runs at startup or when commanded that initializes the state of Items as defined in the Item's metadata. | None | X | NA | Deprecated for openHAB 3, it's better to initialize Items from the UI and use restoreOnStartup
`looping_timer` | module | Class that implements a looping timer. | `time_utils` | X | |
`mqtt_eb` | script | A set of rules that implement an MQTT event bus to synchronize two or more openHAB instances. | Python: `rules_utils`, MQTT 2.5+ binding properly configured, JavaScript: MQTT 3.x binding properly configured, creation of two Group Items | X | X | For simple openHAB to openHAB connections use the new Remote openHAB binding
`rate_limit` | module | Enforces a timeout where actions that occur inside the timeout are ignored. | `time_utils` | X | X |
`rules_utils` | module | Some functions to help in the dynamic loading/reloading of rules to refresh their triggers. | None | X | |
`time_utils` | module | Some functions to help parse and convert various representations of time and time durations. | None | X | X |
`timer_mgr` | module | Manages a whole collection of Timers with four simple functions. | `time_utils` | X | X |

A module is a library that needs to be imported into a rule. A script is a fully functional rule.