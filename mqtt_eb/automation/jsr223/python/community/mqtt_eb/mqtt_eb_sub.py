"""
Copyright July 10, 2020 Richard Koshak

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
from core.log import logging, LOG_PREFIX, log_traceback
from community.rules_utils import create_simple_rule, delete_rule, create_rule

init_logger = logging.getLogger("{}.mqtt_eb".format(LOG_PREFIX))

@log_traceback
def mqtt_eb_sub(event):
    """Called when a new message is received on the event bus subscription.
    Splits the topic from the state using "#" and extracts the item and event
    type from the topic.

    Any message for an Item that doesn't exist generates a debug message in the
    log.
    """

    topic = event.event.split("#")[0]
    state = event.event.split("#")[1]
    item_name = topic.split("/")[2]
    event_type = topic.split("/")[3]

    if item_name not in items:
        mqtt_eb_sub.log.debug("Local openHAB does not have Item {}, ignoring."
                             .format(item_name))
    elif event_type == "command":
        mqtt_eb_sub.log.debug("Received command {} for Item {}"
                              .format(state, item_name))
        events.sendCommand(item_name, state)
    else:
        mqtt_eb_sub.log.debug("Received update {} for Item {}"
                              .format(state, item_name))
        events.postUpdate(item_name, state)

@log_traceback
def load_mqtt_eb_sub(event):
    """Deletes and recreates the MQTT Event Bus subscription rule."""

    # Delete the old rule
    delete_rule(mqtt_eb_sub, init_logger)

    # Reload to get the latest subscription channel
    import configuration
    reload(configuration)
    try:
        from configuration import mqtt_eb_in_chan
    except:
        load_mqtt_eb_sub.log.error("mqtt_eb_in_chan is not defined in "
                                   "configuration.py")
        return

    # Add the trigger
    triggers = ["Channel {} triggered".format(mqtt_eb_in_chan)]
    if not create_rule("MQTT Event Bus Subscription", triggers, mqtt_eb_sub,
            load_mqtt_eb_sub.log,
            description=("Triggers by an MQTT event Channel and updates or "
                         "commands based on the topic the message came from"),
            tags=["openhab-rules-tools","mqtt_eb"]):
        load_mqtt_eb_sub.log.error("Failed to create MQTT Event Bus Subscription!")

@log_traceback
def scriptLoaded(*args):
    """Creates and then calls the Reload MQTT Event Bus Subsciption rule."""

    if create_simple_rule("Reload_MQTT_SUB",
                          "Reload MQTT Event Bus Subscription",
                          load_mqtt_eb_sub, init_logger,
                          description=("Reload the MQTT Event Bus subscription "
                                       "rule. Run when changing configuration.py"),
                          tags=["openhab-rules-tools","mqtt_eb"]):
        load_mqtt_eb_sub(None)

@log_traceback
def scriptUnloaded():
    """Deletes the MQTT Event Bus Subscription rule and the reload rule."""

    delete_rule(load_mqtt_eb_sub, init_logger)
    delete_rule(mqtt_eb_sub, init_logger)
