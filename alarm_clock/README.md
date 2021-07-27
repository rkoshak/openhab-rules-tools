# Alarm Clock
The Android openHAB app has the ability to send the time of the next scheduled alarm to a configured Item.
By default the Item is named `AlarmClock`.
However, this rule will work with any source for the Datetime put into `AlarmClock`.

This rule will trigger on changes to the `AlarmClock` Item and schedule a timer to run at the scheduled time (assuming it's not in the past).
When the timer runs, it will call another rule named `alarm_script`.
`alarm_script` should be created and populated with the code to run when the alarm goes off.

# Dependencies
None

# Purpose

Schedule a rule to run at the scheduled alarm time.

# How it works
If the alarm is in the future, a timer is created to expire at that time.
The rule also runs at System started to reschedule the alarm as needed.

# Installation and Configuration
Create an `AlarmClock` Item and configure the Android App tor any other source to send the alarm clock time to this Item.

Install this rule as normal by creating a new rule in MainUI.
Set the UID for the rule to `alarm_clock_mgr` and copy the contents of alarmclock.yml into the code tab.

Next create a new Script in MainUI and use `alarm_script` as the UID for the Script.
Choose any language desired and code what should happen with the alarm clock goes off.