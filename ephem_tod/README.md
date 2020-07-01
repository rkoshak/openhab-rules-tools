# Ephemeris Time of Day
An implementation for the [Time of Day](https://community.openhab.org/t/design-pattern-time-of-day/15407) design pattern shows a way to generate a state machine that tracks the current time of day.

# Purpose
The Time of Day design pattern implements a state machine that tracks the various time periods throughout the day.
The day is broken up into contiguous time periods, each of which is defined by a name and start time.
This is adequate for many users, but some users may require a different set of time periods based on the type of day, e.g. MORNING may start later on weekends and holidays and AFTERNOON may not even exists on weekdays.

# Requirements

- Ephemeris configured (see https://www.openhab.org/docs/configuration/actions.html#ephemeris)
- item_init for statically defined times of day
- timer_mgr to manage the Timers.
- time_utils to process DateTimeTypes and it's needed by timer_mgr.

# How it works
The statemachine is driven by DateTime Items with `etod` metadata defined.

```
etod="STATE"[type="daytype", set="dayset", file="uri"]
```

Argument | Values | Purpose
-|-|-
`"STATE"` | The name of the state that starts at the date/time stored in this Item's state. | The String that gets commanded to the TimeOfDay Item which indicates the current timeof day state.
`type` | The Ephemeris type (see below) | Indicates what sort of day type is defined in Ephemeris, defaults to `default`.
`set` | The name of the custom dayset | Only valid when type is `dayset`.
`file` | Path to Ephemeris XML file | Only valid when type is `custom`, the path to the custom Ephemeris holiday configuration.

Ephemeris provides a number of ways to categorize days, daysets and holidays.

A dayset is a list of the days of the week with a name, for example weekend would include SATURDAY and SUNDAY by default.
Weekday is a special dayset that is essentially those days not listed as a weekend.
One can define a custom set of daysets (e.g. garabage-day=MONDAY) if desired.

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

# Examples

```
// Default day, notice the use of init_items to initialize the state of the Item
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
DateTime Default_BEd { init="00:02:00", etod="BED"[type="holiday"] }

// Custom holiday
DateTime Weekend_Day { channel="astro:sun:set120:set#start", etod="DAY"[type="custom", file="/openhab/conf/services/custom1.xml"] }
DateTime Weekend_Evening { channel="astro:sun:local:set#start", etod="EVENING"[type="custom", file="/openhab/conf/services/custom1.xml"] }
DateTime Default_BEd { init="00:02:00", etod="BED"[type="custom", file="/openhab/conf/services/custom1.xml"] }
```
# Limitations
Does not handle cases where custom daysets overlap.

Does not handle cases where custom holidays file overlap.
