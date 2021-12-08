# openHAB Rules Tools
A collection of library functions, classes, rule templates, MainUI widgets, and examples to reuse in the development of new openHAB capabilities.
The primary focus is on building tools to solve commonly needed tasks instead of fully realized capabilities.
But some full capabilities will inevitably be added over time.
However, such full capabilities will only be developed as rule templates so they can be installed from the marketplace.

# Prerequisites

## Rule Templates
- openHAB 3.2 M2+

## JavaScript
- openHAB 3.x+

## Python
- Deprecated, will probably be saved off to a branch and removed in the near future
- openHAB 2.x
- the Next-Gen Rules Engine add-on installed
- support for Jython installed (see https://community.openhab.org/t/beta-testers-wanted-jython-addon-w-helper-libraries-requires-oh-2-5-x/86633)
- the Jython Helper Libraries

Notes: 

- all the full JavaScript rules are UI rules
- all the full JavaScript rules have a rule template posted to the marketplace also but there might be slight differences in how the templates work
- the libraries may not be compatible with the JSSCripting add-on, rule templates work with both

# Installation

The README in each folder documents the purpose and usage of that library.
Pay attention as some libraries depend on others (e.g. `timer_mgr` depends upon `time_utils`).

## Rule Templates
1. In MainUI go to Settings.
2. Open "Automation".
3. Browse for the rule template to install; you might need to click on "show all".
4. Read the description and instructions for how to use the template and make sure you understand it. Some tempaltes require you to first write another rule which the template rule will call or require tyhe creation of Items or addition of Item metadata, for example.
5. In the rule template and click "Add".
6. Now go to Settings -> Rules.
7. Click the + and enter the UID, label and description.
8. Choose the rule template from the list of installed templates.
9. Fill out the parameters and click Save.

## JavaScript
For rules, open the YAML file and copy the contents to the `code` tab of a new rule in MainUI in openHAB 3.
The README for those capabilities that require this will indicate when this is necessary.

For library capabilities copy the `automation/lib/javascript` folder for a given capability to `$OH_CONF`.

## Python
Clone the repository to your local system.
Each library is made up of zero or more library modules and zero or more rule scripts.
To make installation of individual capabilities easier, each capability is located in it's own folder.
Copy the `automation/jsr223/python` folder and or `automation/lib/python` under a given capability's folder to `$OH_CONF`.

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
Rule templates are documented in the [marketplace postings](https://community.openhab.org/c/marketplace/rule-templates/74).
The unit tests are also another good place to find usage examples.

# List of capabilities

## Rule Templates
Name | Purpose | Marketplace Link | Notes
-|-|-|-
[`alarm_clock`](https://github.com/rkoshak/openhab-rules-tools/tree/main/alarm_clock) | A rule that will schedule another rule to be called based on the state of a DateTime Item. | [Alarm Clock Rule](https://community.openhab.org/t/alarm-clock-rule/127194) | Works well with the Android App's alarm clock Item and can be used to implement a simple [Time of Day](https://community.openhab.org/t/creating-capabilities-with-rule-templates-time-of-day/127965).
[`debounce`](https://github.com/rkoshak/openhab-rules-tools/tree/main/debounce) | A rule that will delay the update to a proxy Item for configured amount of time after the last change. | [Debounce](https://community.openhab.org/t/debounce/128048) | Requires a Group Item and Item metadata.
[`ephem_tod`](https://github.com/rkoshak/openhab-rules-tools/tree/main/ephem_tod) | Implements a time of day state machine that allows the configuration of a different set of times of day based on the type of day according to ephemeris. | [Time Based State Machine](https://community.openhab.org/t/time-based-state-machine/128245) | Best when one needs different sets of times of day for different day types. Use `alarm_clock` in simpler cases. Requires a Group to contain all the DateTime Items, a String Item to hold the current state, and the DateTime Items require Item metadata.
[`mqtt_eb`](https://github.com/rkoshak/openhab-rules-tools/tree/main/mqtt_eb) | A collection of three rules to establish an MQTT event bus. | [MQTT Online Status](https://community.openhab.org/t/mqtt-online-status/127995), [MQTT Event Bus Publication](https://community.openhab.org/t/mqtt-event-bus-publication/127997), [MQTT Event Bus Subscription](https://community.openhab.org/t/mqtt-event-bus-subscription/127996) | See https://community.openhab.org/t/marketplace-mqtt-event-bus/76938 for full documentation.
[`presence_sim`](https://github.com/rkoshak/openhab-rules-tools/tree/main/presence_sim) | Plays back the persisted states of Items from X days ago to simulate presence. | [Persistence Presence Simulation](https://community.openhab.org/t/persistence-presence-simulation/127776) | Requires the Items to be members of a Group and to have poersisted data available X days ago.
[`thing_status`](https://github.com/rkoshak/openhab-rules-tools/tree/main/thing_status) | Runs periodically and runs a user's script with a list of Things whose status matches a criteria (e.g. all Things that are not ONLINE). | [Thing Status Reporting](https://community.openhab.org/t/thing-status-reporting/128901) | 
[`threshold_alert`](https://github.com/rkoshak/openhab-rules-tools/tree/main/threshold_alert) | Calls a user's script when ever one or more Items falls outside a user's defined criteria. The rate that the script is called is configured (e.g. no more than once every 8 hours) and a do not disturb period can be defined. | 
[`to_today`](https://github.com/rkoshak/openhab-rules-tools/tree/main/to_today) | Runs at midnight and advances and DateTime Items with a cofigurable tag to today's date. | [To Today](https://community.openhab.org/t/to-today/127921) | Works well with `alarm_clock` and `ephem_tod` for times that are hard coded.

## JavaScript
Name | Purpose | Library Dependencies | Notes
-|-|-|-
[`alarm_clock`](https://github.com/rkoshak/openhab-rules-tools/tree/main/alarm_clock) | See the rule template. | | Deprecated in favor of the rule template.
[`countdown_timer`](https://github.com/rkoshak/openhab-rules-tools/tree/main/countdown_timer) | Implements a timer that updates an Item periodically with the amount of time remaining on the timer. | [`time_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/time_utils) | 
[`debounce`](https://github.com/rkoshak/openhab-rules-tools/tree/main/debounce) | See the rule template. | | Deprecated in favor of the rule template. |
[`deferred`](https://github.com/rkoshak/openhab-rules-tools/tree/main/deferred) | Schedules a command or update to be sent to an Item after a given period of time. | [`timer_mgr`](https://github.com/rkoshak/openhab-rules-tools/tree/main/timer_mgr), [`time_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/time_utils)  | 
[`ephem_tod`](https://github.com/rkoshak/openhab-rules-tools/tree/main/ephem_tod) | See the rule template. | [`timer_mgr`](https://github.com/rkoshak/openhab-rules-tools/tree/main/timer_mgr), [`time_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/time_utils) | Deprecated in favor of the rule template.
[`gatekeeper`](https://github.com/rkoshak/openhab-rules-tools/tree/main/gatekeeper) | Queues up actions so they do not take place too close together. | [`time_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/time_utils) | It's also useful create a chain of actions to take place at a given time sequence (e.g. irrigation schedule).
[`group_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/group_utils) | A collection of functions to work with members of Groups. | |
[`looping_timer`](https://github.com/rkoshak/openhab-rules-tools/tree/main/looping_timer) | A timer that reschedules itself until a criteria is met. | [`timer_mgr`](https://github.com/rkoshak/openhab-rules-tools/tree/main/timer_mgr), [`time_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/time_utils) |
[`mqtt_eb`](https://github.com/rkoshak/openhab-rules-tools/tree/main/mqtt_eb) | See rule template. | | Deprecated in favor of the rule template.
[`rate_limit`](https://github.com/rkoshak/openhab-rules-tools/tree/main/rate_limit) | Prevents actions from taking place too soon after the previous action. Unlike `gatekeeper`, the actions are dropped instead of queued. | [`time_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/time_utils) | 
[`time_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/time_utils) | Collection of functions for manipulating and converting between various time and date types and formats (e.g. convert "3h2m" to a ZonedDateTime three hours and two minutes from now). 
[`timer_mgr`](https://github.com/rkoshak/openhab-rules-tools/tree/main/timer_mgr) | A class that provides a simple interface to the creation and management of multiple timers. | [`time_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/time_utils) |

## Python
All Python capabilities depend on the Helper Libraries.

Name | Purpose | Library Dependencies | Notes
-|-|-|-
[`countdown_timer`](https://github.com/rkoshak/openhab-rules-tools/tree/main/countdown_timer) | Implements a timer that updates an Item periodically with the amount of time remaining on the timer. | [`time_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/time_utils) | 
[`debounce`](https://community.openhab.org/t/debounce/128048) | See the rule template. | | Deprecated in favor of the rule template. This implementation comes with a rule that creates the debounce rule with triggers for the Items instead of depending on a Group Item.
[`deferred`](https://github.com/rkoshak/openhab-rules-tools/tree/main/deferred) | Schedules a command or update to be sent to an Item after a given period of time. | [`time_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/time_utils), [`timer_mgr`](https://github.com/rkoshak/openhab-rules-tools/tree/main/timer_mgr) | 
[`ephem_tod`](https://github.com/rkoshak/openhab-rules-tools/tree/main/ephem_tod) | See the rule template. | [`item_init`](https://github.com/rkoshak/openhab-rules-tools/tree/main/item_init) (optional), [`timer_mgr`](https://github.com/rkoshak/openhab-rules-tools/tree/main/timer_mgr), [`time_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/time_utils), [`rules_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/rules_utils) | Deprecated in favor of the rule template. Comes with a rule that creates the etod rule based on the Items with etod metadata. Will create the requires Items.
[`expire`](https://github.com/rkoshak/openhab-rules-tools/tree/main/expire) | Drop in replacement for the Expire 1.x binding. This is now a core openHAB capability. | [`deferred`](https://github.com/rkoshak/openhab-rules-tools/tree/main/deferred), [`rules_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/rules_utils), [`timer_mgr`](https://github.com/rkoshak/openhab-rules-tools/tree/main/timer_mgr), [`time_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/time_utils) | Has a rule that creates the rule with triggers based on Items with expire metadata.
[`gatekeeper`](https://github.com/rkoshak/openhab-rules-tools/tree/main/gatekeeper) | Queues up actions so they do not take place too close together. | [`time_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/time_utils) | It's also useful create a chain of actions to take place at a given time sequence (e.g. irrigation schedule).
[`hysteresis`](https://github.com/rkoshak/openhab-rules-tools/tree/main/hysteresis) | A simple function to see if an old value and new value fall within a hystereis range. | |
[`item_init`](https://github.com/rkoshak/openhab-rules-tools/tree/main/item_init) | Initialized an Item with a static initial value based on Item metadata. | | Deprecated in favor of using MainUI widgets (OH 3.x) and persistence restoreOnStartup which is much more flexible.
[`looping_timer`](https://github.com/rkoshak/openhab-rules-tools/tree/main/looping_timer) | A timer that reschedules itself until a criteria is met. | [`timer_mgr`](https://github.com/rkoshak/openhab-rules-tools/tree/main/timer_mgr), [`time_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/time_utils) |
[`mqtt_eb`](https://github.com/rkoshak/openhab-rules-tools/tree/main/mqtt_eb) | See rule tempalte. | [`rules_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/rules_utils) | Deprecated in favor of the rule template. Has a rule which creates the rule that triggers based on Item metadata.
[`multi_press`](https://github.com/rkoshak/openhab-rules-tools/tree/main/multi_press) | A profile that is able to detect and pass on different type of button press events (e.g. long press, short press, double poress, etc.) | | This is a profile, not a rule or a library. It is applied to an Item at the link.
[`rate_limit`](https://github.com/rkoshak/openhab-rules-tools/tree/main/rate_limit) | Prevents actions from taking place too soon after the previous action. Unlike `gatekeeper`, the actions are dropped instead of queued. | [`time_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/time_utils) | 
[`rules_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/rules_utils) | A series of functions for creating, deleting and otherwise manipulating rules. | | 
[`time_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/time_utils) | Collection of functions for manipulating and converting between various time and date types and formats (e.g. convert "3h2m" to a ZonedDateTime three hours and two minutes from now). 
[`timer_mgr`](https://github.com/rkoshak/openhab-rules-tools/tree/main/timer_mgr) | A class that provides a simple interface to the creation and management of multiple timers. | [`time_utils`](https://github.com/rkoshak/openhab-rules-tools/tree/main/time_utils) |

