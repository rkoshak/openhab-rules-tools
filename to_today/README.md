# To Today
A rule template that will search for all Items with a given tag that is a DateTimeItem.
Those Items that are found are filtered to only those with a valid DateTime and moves those that are in the past to today's date.
DST is accounted for.

# Dependencies
None.

# How it Works
The rule template allows one to define the tag to search for among Items.
By default the rule will trigger at midnight.
If a different time is desired the trigger can be manually changed.
All DateTime Items that are tagged with the indicated tag that have a DateTimeType date (i.e. not NULL or UNDEF) and whose date time is in the past (and therefore the previous day) will have their date moved to today.
Any Item that does not meet that criteria will be ignored.

# Installation and Configuration
This rule template has been posted to the openHAB Marketplace.
