"""
Copyright June 26, 2020 Richard Koshak

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

from core.metadata import get_value, get_metadata
from core.utils import send_command_if_different, post_update_if_different
from core.log import logging, LOG_PREFIX, log_traceback
from community.time_utils import parse_duration
from community.timer_mgr import TimerMgr
from community.rules_utils import create_simple_rule, delete_rule, load_rule_with_metadata

log = logging.getLogger("{}.Debounce".format(LOG_PREFIX))

timers = TimerMgr()

RELOAD_DEBOUNCE_ITEM = "Reload_Debounce"

@log_traceback
def get_config(item_name, log):
    """Parses the config string to validate it's correctness and completeness.
    At a minimum it verifies the proxy Item exists, the timeout exists and is
    parsable.
    Arguments:
      item_name: the name of an Item to get the debounce metadata from
    Returns:
      An Item metadata Object or None if there is no such metadata or the
      metadata is malformed.
    """

    error = False
    cfg = get_metadata(item_name, "debounce")
    if not cfg:
        log.error("Item {} has no debounce metadata!".format(item_name))
        error = True
    elif not cfg.value or cfg.value not in items:
        log.error("Proxy Item {} for Item {} does not exist!"
                        .format(cfg.value, item_name))
        error = True
    elif not "timeout" in cfg.configuration:
        log.error("Debounce metadata for Item {} does not include a "
                        "timeout property!".format(item_name))
        error = True
    elif not parse_duration(cfg.configuration["timeout"]):
        log.error("timeout property for Item {} is invalid!"
                        .format(item_name))
        error = True

    if error:
        log.error("Debounce config on {} is not valid: {}"
                  "\nExpected format is : debounce=\"ProxyItem\"[timeout=\"duration\", states=\"State1,State2\", command=\"True\"]"
                  "\nwhere:"
                  "\n  ProxyItem: name of the Item that will be commanded or updated after the debounce"
                  "\n  timeout: required parameter with the duration of the format 'xd xh xm xs' where each field is optional and x is a number, 2s would be 2 seconds, 0.5s would be 500 msec"
                  "\n  states: optional, list all the states that are debounced; when not present all states are debounced; states not in the list go directly to the proxy"
                  "\n  command: optional, when True the proxy will be commanded; when False proxy will be updated, defaults to False"
                  .format(item_name, get_value(item_name, "expire")))
        return None
    else:
        return cfg

@log_traceback
def end_debounce(state, proxy_name, is_command):
    """Called at the end of the debounce period, update or commands the proxy
    Item with the passed in state if it's different from the proxy's current
    state.
    Arguments:
      state: the state to update or command the proxy Item to
      proxy_name: the name of the proxy Item
      is_command: flag that when true will cause the function to issue a command
      instead of an update.
      log: logger used for debug logging
    """
    if is_command:
        log.debug("Commanding {} to {} if it's not already that state"
            .format(proxy_name, state))
        send_command_if_different(proxy_name, state)
    else:
        log.debug("Updating {} to {} if it's not already that state"
            .format(proxy_name, state))
        post_update_if_different(proxy_name, state)

@log_traceback
def debounce(event):
    """Rule that get's triggered by any Item with a valid debounce metadata
    config changes. Based on the configuration it will debounce some or all of
    the possible states, waiting the indicated amount of time before forwarding
    the state (command or update) to a proxy Item.
    """
    cfg = get_metadata(event.itemName, "debounce")
    if not cfg:
        return

    timers.cancel(event.itemName)

    isCommand = True if "command" in cfg.configuration and cfg.configuration["command"] == "True" else False
    proxy = cfg.value
    states = [st.strip() for st in cfg.configuration["state"].split(",")] if "state" in cfg.configuration else None
    timeout = str(cfg.configuration["timeout"])

    if not states or (states and str(event.itemState) in states):
        log.debug("Debouncing {} with proxy={}, command={}, timeout={}, and"
                  " states={}".format(event.itemName, proxy, isCommand,
                  timeout, states))
        timers.check(event.itemName, timeout, function=lambda: end_debounce(event.itemState, proxy, isCommand))
    else:
        log.debug("{} changed to {} which is not in {}, not debouncing"
                  .format(event.itemName, event.itemState, states))
        end_debounce(event.itemState, proxy, isCommand)

@log_traceback
def load_debounce(event):
    """Called at startup or when the Reload Debounce rule is triggered. It
    deletes and recreates the Debounce rule. Should be called at startup and
    when the metadata is changes on Items since there is no event to do this
    automatically.
    """

    if not delete_rule(debounce, log):
        log.error("Failed to delete rule!")
        return

    debounce_items = load_rule_with_metadata("debounce", get_config, "changed",
            "Debounce", debounce, log,
            description=("Delays updating a proxy Item until the configured "
                         "Item remains in that state for the configured amount "
                         "of time"),
            tags=["openhab-rules-tools","debounce"])

    if debounce_items:
        # Cancel any existing timers for Items that are no longer debounced.
        # Leave the timers for those that are still debounced.
        for i in [i for i in timers.timers if not i in debounce_items]:
            timers.cancel(i)

        # Synchronize the debounce_item with it's configured proxy.
        log.info("debounce_items = {}".format(debounce_items))
        for i in debounce_items:
            cfg = get_config(i, log)
            if cfg:
                post_update_if_different(cfg.value, items[i].toString())

@log_traceback
def scriptLoaded(*args):
    if create_simple_rule(RELOAD_DEBOUNCE_ITEM, "Reload Debounce", load_debounce,
                          log,
                          description=("Recreates the Debounce rule with the "
                                       "latest debounce metadata. Run this rule "
                                       "when modifying debounce metadata"),
                          tags=["openhab-rules-tools","debounce"]):
        load_debounce(None)

@log_traceback
def scriptUnloaded():
    """
    Cancels all the timers when the script is unloaded to avoid timers from
    hanging around and deletes the rules.
    """

    timers.cancel_all()
    delete_rule(load_debounce, log)
    delete_rule(debounce, log)
