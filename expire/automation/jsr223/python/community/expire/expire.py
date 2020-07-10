"""
Copyright July 7, 2020 Richard Koshak

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

from core.metadata import get_value
from core.log import logging, LOG_PREFIX, log_traceback
from community.time_utils import parse_duration, to_datetime
from community import deferred
from community.rules_utils import create_simple_rule, delete_rule, load_rule_with_metadata

# Create an Item to trigger the rule on command if it doesn't exist.
RELOAD_EXPIRE_ITEM = "Reload_Expire"

init_logger = logging.getLogger("{}.Expire Init".format(LOG_PREFIX))

# Maps the UnDefType string representation with their actual types.
special_types = { "UNDEF": UnDefType.UNDEF,
                  "NULL":  UnDefType.NULL }

@log_traceback
def get_config(i, log):
    """Parses the expire metadata and generates a dict with the values. If the
    config is not valid, None is returned.

    The expected format is:

    expire="<duration>[,[command=|state=]<new state>]"

        - <duration>: a time duration of the format described in parse_time.
        - [,]: if supplying more than just the duration, a comma is required
        here.
        - [command=|state=]: an optional definition of the type of of event to
        send to this Item when it expires. If not supplied it defaults to
        "state=".
        - [<new state>]: an optional state that the Item get's updated (state)
        or commanded (command) to when the time expires. Use '' to represent the
        empty String (differs from Expire1 Binding). Use 'UNDEF' or 'NULL' to
        represent the String rather than the state.

    Examples (taken from the Expire1 Binding docs):
        - expire="1h,command=STOP" (send the STOP command after one hour)
        - expire="5m,state=0"      (update state to 0 after five minutes)
        - expire="3m12s,Hello"     (update state to Hello after three minutes
                                    and 12 seconds)
        - expire="2h"              (update state to UNDEF 2 hours after the last
                                    value)
    Unique to this implementation:
        - expire="5s,state=''"      (update a String Item to the empty String)
        - expire="5s,state=UNDEF"   (for String Items, expires to UNDEF, not the
                                     string, "UNDEF")
        - expire="5s,state='UNDEF'" (for String Items, expires to the String
                                     "UNDEF")
    Argument:
        - i : name of the Item to process the metadata
        - log : logs warning explaining why a config is invalid
    Returns:
        None if the config is invalid.
        A dict with:
            - time : Duration string as defined in time_utils.parse_duration
            - type : either "state" or "command"
            - state : the Expire state
    """

    cfg = get_value(i, "expire")

    # Separate the time from the command/update.
    if cfg:
        cfg = cfg.split(",")
    else:
        log.error("Invalid expire config: Item {} does not have an expire config"
                  .format(i))
        return None

    # Check that the time part parses.
    if not parse_duration(cfg[0], log):
        log.error("Invalid expire config: Item {} does not have a valid duration string: {}"
                  .format(i, cfg[0]))
        return None

    # Default to state updates and UNDEF.
    event = "state"
    state = "UNDEF"

    # If there is more than one element in the split cfg, the user has overridden
    # the defaults. Parse them out.
    if len(cfg) > 1:
        event_str = cfg[1].split("=")

        # If there is an "=" that means we have both the event type and the state
        # defined. Otherwise we only have the state.
        #
        # Preserve any white space until we know whether or not this is for a
        # String Item.
        if len(event_str) > 1:
            event = event_str[0].strip().lower()
            state = event_str[1]
        else:
            state = event_str[0]

        # Convert "UNDEF" and "NULL" to their actual types. This let's us handle
        # using the String "`UNDEF`" and "`NULL`".
        if state.strip() in special_types:
            state = special_types[state]
        # If not a special type, remove any single quotes around the state.
        else:
            state = state.strip("'")

        # Handle the case where the state is empty.
        state = state if str(state).strip() != "" else UNDEF

        # Force the state to a StringType if this is for a String type Item.
        # This is required to set the string "UNDEF" and "NULL".
        if ir.getItem(i).type == "String":
            if isinstance(state, basestring):
                state = StringType(state)
        # Finally, strip whitespace for non String items.
        elif isinstance(state, basestring):
            state = state.strip()

    # Make sure the event is valid
    if event not in ["state", "command"]:
        log.error("Invalid expire config: Unrecognized action '{}' for item '{}'"
                  .format(event, item_name))
        return None

    if isinstance(state, UnDefType) and event == "command":
        log.error("Invalid expire config: Cannot command Item {} to {}"
                  .format(i, state))
        return None

    # Return the dict as a dict
    return { "time": cfg[0], "type": event, "state": state }


@log_traceback
def expire_event(event):
    """Called when any Item with a valid expire config changes state."""

    # Cancel any deffered action if the new state is UnDefType.
    if isinstance(event.itemState, UnDefType):
        expire_event.log.debug("Item {} change to an UnDefType {}, cancelling timer"
                 .format(event.itemName, event.itemState))
        deferred.cancel(event.itemName)
        return

    # Get the configuration for the Item.
    cfg = get_config(event.itemName, expire_event.log)
    if not cfg:
        exipre_event.log.error("Item {} has an invalid expire config")
        deferred.cancel(event.itemName)
        return

    # Cancel the timer if we've changed to the expire state.
    if unicode(event.itemState) == cfg["state"]:
        expire_event.log.debug("Item {} has returned to the expired state {}, "
                              "cancelling timer".format(event.itemName, cfg["state"]))
        deferred.cancel(event.itemName)
        return

    # If we get to this point we need to schedule a deferred action to expire
    # the Item to the configured state.
    expire_event.log.debug("Scheduling expire timer for {} with duration {}, "
                           "type {} and state {}".format(event.itemName,
                                                         cfg["time"],
                                                         cfg["type"],
                                                         cfg["state"]))


    deferred.defer(event.itemName, cfg["state"], cfg["time"],
                   expire_event.log,
                   is_command=True if cfg["type"] == "command" else False)

@log_traceback
def load_expire(event):
    """Called at startup or when the Reload Expire rule is triggered, deletes
    and recreates the Expire rule. Should be called at startup and when the
    metadata is changed on Items since there is no event to do this
    automatically.
    """

    expire_items = load_rule_with_metadata("expire", get_config, "changed",
                   "Expire", expire_event, init_logger,
                   description="Drop in replacement for the Expire 1.x binding",
                   tags=["openhab-rules-tools","expire"])
    if expire_items:
        [deferred.cancel(i) for i in deferred.timers.timers if not i in expire_items]

@log_traceback
def scriptLoaded(*args):
    """Create the Expire rule."""

    if create_simple_rule(RELOAD_EXPIRE_ITEM, "Reload Expire", load_expire,
                       init_logger,
                       description=("Regenerates the Expire rule using the "
                                    "latest expire metadata. Run after changing "
                                    "any expire metadata."),
                        tags=["openhab-rules-tools","expire"]):
        load_expire(None)

@log_traceback
def scriptUnloaded():
    """Cancel all the timers."""

    deferred.cancel_all()
    delete_rule(expire_event, init_logger)
    delete_rule(load_expire, init_logger)
