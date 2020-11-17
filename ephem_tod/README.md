# Ephemeris Time of Day
An implementation for the [Time of Day](https://community.openhab.org/t/design-pattern-time-of-day/15407) design pattern shows a way to generate a state machine that tracks the current time of day.

# Purpose
The Time of Day design pattern implements a state machine that tracks the various time periods throughout the day.
The day is broken up into contiguous time periods, each of which is defined by a name and start time.
This is adequate for many users, but some users may require a different set of time periods based on the type of day, e.g. MORNING may start later on weekends and holidays and AFTERNOON may not even exists on weekdays.

# Requirements

- Ephemeris configured (see https://www.openhab.org/docs/configuration/actions.html#ephemeris)
- `item_init`, optional, used for statically defined times of day (see examples below)
- `timer_mgr` to manage the Timers
- `time_utils` to process DateTimeTypes and it's needed by timer_mgr
- `rules_utils` to dynamically recreate the rule on command when the Item metadata is changed; only required for Jython.

# How it works
The state machine is driven by DateTime Items with `etod` metadata defined.

```
etod="STATE"[type="daytype", set="dayset", file="uri"]
```

Argument | Values | Purpose
-|-|-
`"STATE"` | The name of the state that starts at the date/time stored in this Item's state. | The String that gets commanded to the TimeOfDay Item which indicates the current time of day state.
`type` | The Ephemeris type (see below) | Indicates what sort of day type is defined in Ephemeris, defaults to `default`.
`set` | The name of the custom dayset | Only valid when type is `dayset`.
`file` | Path to Ephemeris XML file | Only valid when type is `custom`, the path to the custom Ephemeris holiday configuration.

Ephemeris provides a number of ways to categorize days, daysets, and holidays.

A dayset is a list of the days of the week with a name, for example weekend would include SATURDAY and SUNDAY by default.
Weekday is a special dayset that is essentially those days not listed as a weekend.
One can define a custom set of daysets (e.g. garbage-day=MONDAY) if desired.

When Ephemeris is configured with a country and region, it loads a default list of "bank holidays" for that region.
One can additionally define a custom set of holidays by creating an XML file.
See the docs (link above) for details.

This script supports all of the different ways Ephemeris can define a day through the following `types`.

Type | Purpose
-|-
`default` | Used when no other Ephemeris day type is configured.
`weekday` | Used when Ephemeris indicates that today is a weekday.
`weekend` | Used when Ephemeris indicates that today is a weekend.
`dayset` | In addition to weekend, Ephemeris allows the definition of additional daysets (e.g school-day)
`holiday` | When Ephemeris is configured with a country and region, it loads a standard set of holidays. This Item will be used when today matches the given holiday.
`custom` | Ephemeris allows the definition of custom holidays

## JavaScript
Only supports openHAB 3.
To install, in MainUI create a new rule, click on the code tab and paste the contents of ephemTimeOfDay.yml into the form.
Add the "Schedule" tag to the rule and it will show up on the schedule.
The rule expects the folliowing Items to already exist and it will generate errors if they do not.

Item | Purpose
-|-
`TimeOfDay` | String Item that holds the current state of the time of day state machine.
`TimesOfDay` | A Group containing all the DateTime Items that define the starts of the times of day. Each Item must have a valid `etod` metadata.

## Jython
The Rule will create the following two Items if they do not already exist.

Item | Purpose
-|-
`Reload_ETOD` | Switch Item, when it receives an ON command it will rebuild the Ephemeris Time of Day using the latest metadata configured on Items
`TimeOfDay` | String Item that contains the current time of day. The values are defined with the metadata on the DateTime Items that drive the state machine.

Rules have a limitation that there is no event created when Item metadata is added, modified, or removed.
Therefore there is no way to know when you've changed the Item metadata for an Item.
Thus, if it doesn't already exist, a `Reload_ETOD` Item will be created that will recreate the Expire rule with new triggers based on the current metadata.
After modifying expire Item metadata, send an `ON` command to the `Reload_ExTD` Item or execute the `Reload Ephemeris Time of Day` rule in PaperUI by clicking the "play" icon next to the rule in the list.

When the script is loaded or when the `Reload Ephemeris Time of Day` rule runs, all the Items with etod metadata are obtained and the configuration checked for validity.
Invalid configs will generate errors in the logs.
If the config is valid, changes to the Item will be added as a trigger to the Expire rule.

# Examples

## JavaScript
```
Group:DateTime TimesOfDay
String TimeOfDay "Current time of day [%s]"

// Default day, initialization for JavaScript should be done thgrough MainUI. See https://community.openhab.org/t/oh-3-examples-how-to-boot-strap-the-state-of-an-item/108234
DateTime Default_Morning (TimesOfDay) { etod="MORNING"[type="default"] }
DateTime Default_Day (TimesOfDay) { channel="astro:sun:set120:set#start", etod="DAY"[type="default"] }
DateTime Default_Evening (TimesOfDay) { channel="astro:sun:local:set#start", etod="EVENING"[type="default"] }
DateTime Default_Night (TimesOfDay) { etod="NIGHT"[type="default"] }
DateTime Default_Bed (TimesOfDay) { etod="BED"[type="default"] }

// Weekend day, notice that not all the states are listed, the unlisted states are skipped
DateTime Weekend_Day (TimesOfDay) { channel="astro:sun:set120:set#start", etod="DAY"[type="weekend"] }
DateTime Weekend_Evening (TimesOfDay) { channel="astro:sun:local:set#start", etod="EVENING"[type="weekend"] }
DateTime Default_Bed (TimesOfDay) { etod="BED"[type="weekend"] }

// Custom dayset
DateTime Trash_Morning (TimesOfDay) { etod="MORNING"[type="dayset", set="trash"] }
DateTime Trash_Trashtime (TimesOfDay) { etod="TRASH"[type="dayset", set="trash"]}
DateTime Trash_Day (TimesOfDay) { channel="astro:sun:set120:set#start", etod="DAY"[type="dayset", set="trash"] }
DateTime Trash_Evening (TimesOfDay) { channel="astro:sun:local:set#start", etod="EVENING"[type="dayset", set="trash"] }
DateTime Trash_Night (TimesOfDay) { etod="NIGHT"[type="dayset", set="trash"] }
DateTime Trash_Bed (TimesOfDay) { etod="BED"[type="dayset", set="trash"] }

// Default holiday
DateTime Weekend_Day (TimesOfDay) { channel="astro:sun:set120:set#start", etod="DAY"[type="holiday"] }
DateTime Weekend_Evening (TimesOfDay) { channel="astro:sun:local:set#start", etod="EVENING"[type="holiday"] }
DateTime Default_Bed (TimesOfDay) { etod="BED"[type="holiday"] }

// Custom holiday
DateTime Weekend_Day (TimesOfDay) { channel="astro:sun:set120:set#start", etod="DAY"[type="custom", file="/openhab/conf/services/custom1.xml"] }
DateTime Weekend_Evening (TimesOfDay) { channel="astro:sun:local:set#start", etod="EVENING"[type="custom", file="/openhab/conf/services/custom1.xml"] }
DateTime Default_Bed (TimesOfDay) { etod="BED"[type="custom", file="/openhab/conf/services/custom1.xml"] }
```

## Python
```
// Default day, notice the use of init_items to initialize the state of the Item, only used by Jython
// Initialization for JavaScript should be done thgrough MainUI. See https://community.openhab.org/t/oh-3-examples-how-to-boot-strap-the-state-of-an-item/108234
DateTime Default_Morning { init="2020-06-01T06:00:00", etod="MORNING"[type="default"] }
DateTime Default_Day { channel="astro:sun:set120:set#start", etod="DAY"[type="default"] }
DateTime Default_Evening { channel="astro:sun:local:set#start", etod="EVENING"[type="default"] }
DateTime Default_Night { init="23:00:00", etod="NIGHT"[type="default"] }
DateTime Default_Bed { init="00:02:00", etod="BED"[type="default"] }

// Weekend day, notice that not all the states are listed, the unlisted states are skipped
DateTime Weekend_Day { channel="astro:sun:set120:set#start", etod="DAY"[type="weekend"] }
DateTime Weekend_Evening { channel="astro:sun:local:set#start", etod="EVENING"[type="weekend"] }
DateTime Default_Bed { init="00:02:00", etod="BED"[type="weekend"] }

// Custom dayset
DateTime Trash_Morning { init="06:00:00", etod="MORNING"[type="dayset", set="trash"] }
DateTime Trash_Trashtime { init="07:00:00", etod="TRASH"[type="dayset", set="trash"]}
DateTime Trash_Day { channel="astro:sun:set120:set#start", etod="DAY"[type="dayset", set="trash"] }
DateTime Trash_Evening { channel="astro:sun:local:set#start", etod="EVENING"[type="dayset", set="trash"] }
DateTime Trash_Night { init="23:00:00", etod="NIGHT"[type="dayset", set="trash"] }
DateTime Trash_Bed { init="00:02:00", etod="BED"[type="dayset", set="trash"] }

// Default holiday
DateTime Weekend_Day { channel="astro:sun:set120:set#start", etod="DAY"[type="holiday"] }
DateTime Weekend_Evening { channel="astro:sun:local:set#start", etod="EVENING"[type="holiday"] }
DateTime Default_Bed { init="00:02:00", etod="BED"[type="holiday"] }

// Custom holiday
DateTime Weekend_Day { channel="astro:sun:set120:set#start", etod="DAY"[type="custom", file="/openhab/conf/services/custom1.xml"] }
DateTime Weekend_Evening { channel="astro:sun:local:set#start", etod="EVENING"[type="custom", file="/openhab/conf/services/custom1.xml"] }
DateTime Default_Bed { init="00:02:00", etod="BED"[type="custom", file="/openhab/conf/services/custom1.xml"] }
```

# Limitations
- Does not handle cases where custom daysets overlap.
- Does not handle cases where custom holidays defined in different Ephemeris files overlap.
- When adding new DateTime Items, the .py file needs to be reloaded to regenerate the triggers. For JavaScript they need to be added to `TimeOfDay`.
