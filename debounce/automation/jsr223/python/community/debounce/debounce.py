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

from core.rules import rule
from core.triggers import when
from core.metadata import get_value, get_metadata
from core.utils import send_command_if_different, post_update_if_different
from core.log import logging, LOG_PREFIX, log_traceback
from community.time_utils import parse_duration
from community.timer_mgr import TimerMgr

init_logger = logging.getLogger("{}.Expire Init".format(LOG_PREFIX))

timers = TimerMgr()

@log_traceback
def get_config(item_name):
    """Parses the config string to validate it's correctness and completeness.
    At a minimum it verifies the proxy Item exists, the timeout exists and is
    parsable.
    Arguments:
      item_name: the name of an Item to get the debounce metadata from
    Returns:
      An Item metadata Object or None if there is no such metadata or the
      metadata is malformed.
    """
    try:
        cfg = get_metadata(item_name, "debounce")
        assert cfg, "There is no debounce metadata"
        assert items[cfg.value], "The proxy Item {} does not exist".format(cfg.value)
        assert "timeout" in cfg.configuration, "There is no timeout supplied"
        assert parse_duration(cfg.configuration["timeout"]), "Timeout is not valid"
        return cfg
    except AssertionError:
        init_logger.error("Debounce config on {} is not valied: {}"
                          "\nExpected format is : debounce=\"ProxyItem\"[timeout=\"duration\", states=\"State1,State2\", command=\"True\"]"
                          "\nwhere:"
                          "\n  ProxyItem: name of the Item that will be commanded or updated after the debounce"
                          "\n  timeout: required parameter with the duration of the format 'xd xh xm xs' where each field is optional and x is a number, 2s would be 2 seconds, 0.5s would be 500 msec"
                          "\n  states: optional, list all the states that are debounced; when not present all states are debounced; states not in the list go directly to the proxy"
                          "\n  command: optional, when True the proxy will be commanded; when False proxy will be updated, defaults to False"
                          .format(item_name, get_value(item_name, "expire")))
        return None

def trigger_generator():
    """Generates triggers for the Expire Rule for all Items that have the expire
    metadata value set.
    Returns:
      Item changed triggers for those Items that have a valid debounce metadata.
    Errors:
      A error complaining about function not having triggers will appear if
      there are no Items with valid debounce metadata.
    """
    def generate_triggers(function):
        for item_name in [i for i in items if get_metadata(i, "debounce")]:
            if get_config(item_name):
                when("Item {} changed".format(item_name))(function)
        return function
    return generate_triggers

@log_traceback
def end_debounce(state, proxy_name, is_command, log):
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

@rule("Debounce",
      description="Debounces Items configured with the debounce metadata",
      tags=["debounce", "openhab-rules-tools"])
@trigger_generator()
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

    isCommand = True if cfg.configuration["command"] == "True" else False
    proxy = cfg.value
    states = [st.strip() for st in cfg.configuration["state"].split(",")] if cfg.configuration["state"] else None
    timeout = str(cfg.configuration["timeout"])

    if not states or (states and str(event.itemState) in states):
        debounce.log.debug("Debouncing {} with proxy={}, command={}, timeout={}, and"
                      " states={}".format(event.itemName, proxy, isCommand,
                      timeout, states))
        timers.check(event.itemName, timeout, function=lambda: end_debounce(event.itemState, proxy, isCommand, debounce.log))
    else:
        debounce.log.debug("{} changed to {} which is not in {}, not debouncing"
                      .format(event.itemName, event.itemState, states))
        end_debounce(event.itemState, proxy, isCommand, debounce.log)

@log_traceback
def scriptUnloaded():
    """
    Cancels all the timers when the script is unloaded to avoid timers from
    hanging around.
    """
    timers.cancel_all()
