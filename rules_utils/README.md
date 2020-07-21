# Rules Utils
A series of utility functions useful for dynamically creating rules using a list of Items with a given set of metadata.

# Purpose
Because there is no event when metadata is modified, the user can send a command to an Item to cause the rule, and therefore the rule's triggers, to be recreated.
Otherwise the user would have to cause the .py file to be reloaded.

# How it works

## create_switch_trigger_item
An Item is required to kick off the reload rule.
This function creates a Switch Item if one doesn't already exist.

Argument | Purpose
-|-
`item_name` | Name of the Item to create if it doesn't exist.
`logger` | For logging errors and information

```python
create_switch_trigger_item("Reload_Debounce")
```

The rule does not check to make sure that if the Item already exists that it's of a type that can receive an ON command.

Returns True if successful in creating the Item or it already exists.

## delete_rule

Deletes the rule attached to the passed in function, if it exists.

Argument | Purpose
-|-
`function` | Function that may have a rule attached to it
`logger` | For logging an error

Returns True if the rule was successfully deleted.

```python
delete_rule(debounce, init_logger)
```

## create_rule

Creates a rule with the passed in triggers and attaches it to the passed in function.

Argument | Purpose
-|-
`name` | Name for the rule
`triggers` | A list of rule trigger strings
`function` | Gets called when the rule triggers
`description` | Optional, supplies the description for the rule
`tags` | Optional, supplies the tags for the rule

Returns False if there was a problem creating the rule.

```python
if create_simple_rule("Debounce", triggers, debounce, init_logger)
```

## create_simple_rule

Creates a rule with a single "Item item_name received command ON" trigger.
This is useful to create the rule that triggers on command to generate the other rule that does the work.

Argument | Purpose
-|-
`item_name` | Name of the Item that will trigger the rule. If it doesn't exist it will be created.
`name` | Name for the rule
`function` | Called when the rule triggers
`logger` | For logging errors
`description` | Optional description of the rule
`tags`| Optional tags for the rule

If successful, returns True.

```python
    if create_simple_rule(RELOAD_EXPIRE_ITEM, "Reload Expire", load_expire,
                       init_logger,
                       description=("Regenerates the Expire rule using the "
                                    "latest expire metadata. Run after changing "
                                    "any expire metadata."),
                        tags=["openhab-rules-tools","expire"]):
        load_expire(None)
```

## load_rule_with_metadata

Creates a rule with triggers for all of the Items that possess the passed in metadata namespace that is valid based on check_config.

Argument | Purpose
-|-
`namespace` | The metadata namespace to look for
`check_config` | function to call with the Item name and the logger to check the metadata is valid
`event` | The Item event to trigger the rule with (e.g. `"changed"`)
`rule_name` | Name of rule
`function` | Called when the rule triggers
`logger` | For logging errors, particularly why a given metadata is invalid
`description` | Optional description of the rule
`tags`| Optional tags for the rule

Returns a list of the Item names for which a rule trigger was created or None if there was an error.

```python
    debounce_items = load_rule_with_metadata("debounce", get_config, "changed",
            "Debounce", debounce, init_logger,
            description=("Delays updating a proxy Item until the configured "
                         "Item remains in that state for the configured amount "
                         "of time"),
            tags=["openhab-rules-tools","debounce"])
```

## generate_triggers
Creates a rule trigger string for all the Items that possess a valid metadata of the given namespace as verified by check_config.
The type of the Item rule trigger is indicated by event.

Argument | Purpose
-|-
`namespace` | The metadata namespace to look for
`check_config` | Function that is called with the metadata. The function should expect the Item name and logger to log out why the metadata fails validation.
`event` | The event to configure the rule trigger to react to (e.g. "received update to ON")
`logger` | Used by the check_config function to log errors.

Returns a list of rule Item trigger strings or an empty list if there are no valid Items.

```python

    # Generate the rule triggers with the latest metadata configs.
    triggers = generate_triggers("etod", check_config, "changed",
                                 init_logger)
```

## get_items_from_triggers

Extracts the Item names from a list of trigger strings from the Item triggers.
The purpose of this function is to get the list of Item for which generate_triggers created a rule trigger since it has a valid metadata.
In the rule that calls it, this list of Item names can be used to do stuff like cancelling Timers for Items that no longer have valid metadata.

Argument | Purpose
-|-
`triggers` | A list of rule trigger strings

Returns a list of item_names or the empty list if there are none.

```python
    etod_items = get_items_from_triggers(triggers)
```

# Examples
The following is a complete example for creating dynamically recreated rules.

```python
from core.metadata import get_value, get_metadata
from core.utils import send_command_if_different, post_update_if_different
from core.log import logging, LOG_PREFIX, log_traceback
from community.time_utils import parse_duration
from community.timer_mgr import TimerMgr
from community.rules_utils import create_simple_rule, delete_rule, load_rule_with_metadata

init_logger = logging.getLogger("{}.Example".format(LOG_PREFIX))

# Used to show how to clean up existing timers after recreating the rule.
timers = TimerMgr()

RELOAD_DEBOUNCE_ITEM = "Reload_Test"
NAMESPACE = "test"

@log_traceback
def get_config(item_name, logger):
    cfg = get_metadata(item_name, NAMESPACE)

    # Code that verifies all required parts of the metadata is present goes here.
    # Log an error if there is a problem and return None

    if not cfg:
        logger.error("{} metadata not present!".format(NAMESPACE))
        return None

    return cfg

@log_traceback
gef test_action(event):

    # Function called by the rule that does the actual work. In statically
    # defined rules, this would be the function after the @rule decorator.

@log_traceback
def load_test(event):

    # Called when the script file is loaded or when RELOAD_DEBOUNCE_ITEM
    # receives a command. Deletes the old test_action rule and recreates it
    # with the current metadata.

    # The rule will trigger when correctly configured Items change.
    test_items = load_rule_with_metadata("test", get_config, "changed",
            "Test", test_action, init_logger,
            description=("Illustrates how to create the action rule."),
            tags=["openhab-rules-tools","test"])

    # An example of cancelling Timers for any Item that no longer has a valid
    # metadata config
    if test_items:
        [timers.cancel(i) for i in timers.timers if not i in test_items]

@log_traceback
def scriptLoaded(*args):
    if create_simple_rule(RELOAD_DEBOUNCE_ITEM, "Reload Test", load_test,
                          init_logger,
                          description=("Illustrates how to create the reload rule"),
                          tags=["openhab-rules-tools","test"]):
        load_test(None)

@log_traceback
def scriptUnloaded():

    timers.cancel_all()
    delete_rule(load_test, init_logger)
    delete_rule(test_action, init_logger)

```

If you need to have more triggers than just those for the configured Items (e.g. a System started trigger) see `ephem_tod`.
