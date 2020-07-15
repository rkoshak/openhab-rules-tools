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
def check_config(log):
    """Verifies that all the settings exist and are usable."""

    try:
        from configuration import mqtt_eb_name
    except:
        log.error("mqtt_eb_name is not defined in configuration.py!")
        return False

    broker = None
    try:
        from configuration import mqtt_eb_broker
        broker = mqtt_eb_broker
    except:
        log.error("mqtt_eb_broker is not defined in configuration.py!")
        return False

    if not actions.get("mqtt", broker):
        log.error("{} is not a valid broker Thing ID".format(broker))
        return False
    return True

@log_traceback
def mqtt_eb_pub(event):
    """Called when a configured Item is updated or commanded and publsihes the
    event to the event bus.
    """

    if not check_config(mqtt_eb_pub.log):
        init_logger.error("Cannot publish event bus event, deleting rule")
        delete_rule(mqtt_eb_pub, init_logger)
        return

    from configuration import mqtt_eb_name, mqtt_eb_broker

    is_cmd = hasattr(event, 'itemCommand')
    msg = str(event.itemCommand if is_cmd else event.itemState)
    topic = "{}/out/{}/{}".format(mqtt_eb_name, event.itemName,
                                  "command" if is_cmd else "state")
    retained = False if is_cmd else True
    init_logger.info("Publishing {} to  {} on {} with retained {}"
                     .format(msg, topic, mqtt_eb_broker, retained))
    action = actions.get("mqtt", mqtt_eb_broker)
    if action:
        action.publishMQTT(topic, msg, retained)
    else:
        init_logger.error("There is no broker Thing {}!".format(mqtt_eb_broker))

@log_traceback
def load_publisher():

    # Delete the old publisher rule.
    if not delete_rule(mqtt_eb_pub, init_logger):
        init_logger("Failed to delete rule!")
        return False

    # Default to publishing all updates and all commands for all Items.
    puball = True
    try:
        from configuration import mqtt_eb_puball
        puball = mqtt_eb_puball
    except:
        init_logger.warn("No mqtt_eb_puball in configuration.py, "
                                  "defaulting to publishing all Items")

    # Don't bother to create the rule if we can't use it.
    if not check_config(init_logger):
        init_logger.error("Cannot create MQTT event bus publication rule!")
        return False

    triggers = []

    # Create triggers for all Items.
    if puball:
        [triggers.append("Item {} received update".format(i))
         for i in items]
        [triggers.append("Item {} received command".format(i))
         for i in items]

    # Create triggers only for those Items with eb_update and eb_command tags.
    else:
        [triggers.append("Item {} received update".format(i))
         for i in items
         if ir.getItem(i).getTags().contains("eb_update")]
        [triggers.append("Item {} received command".format(i))
         for i in items
         if ir.getItem(i).getTags().contains("eb_command")]

    # No triggers, no need for the rule.
    if not triggers:
        init_logger.warn("No event bus Items found")
        return False

    # Create the rule to publish the events.
    if not create_rule("MQTT Event Bus Publisher", triggers, mqtt_eb_pub,
                       init_logger,
                       description=("Publishes updates and commands on "
                                    "configured Items to the configured "
                                    "event bus topics"),
                       tags=["openhab-rules-tools","mqtt_eb"]):
        init_logger.error("Failed to create MQTT Event Bus Publisher!")
        return False

    return True

@log_traceback
def online(event):
    """Publishes ONLINE to mqtt_eb_name/status on System started."""

    init_logger.info("Reporting the event bus as ONLINE")
    from configuration import mqtt_eb_broker, mqtt_eb_name
    actions.get("mqtt", mqtt_eb_broker).publishMQTT("{}/status"
                                                    .format(mqtt_eb_name),
                                                    "ONLINE", True)

@log_traceback
def load_online():
    """Loads the online status publishing rule."""

    # Delete the old online rule.
    if not delete_rule(online, init_logger):
        init_logger("Failed to delete rule!")
        return False

    triggers = ["System started"]

    if not create_rule("MQTT Event Bus Online", triggers, online, init_logger,
                       description=("Publishes ONLINE to the configured LWT "
                                    "topic."),
                       tags=["openhab-rules-tools","mqtt_eb"]):
        init_logger.error("Failed to create MQTT Event Bus Online rule!")

@log_traceback
def load_mqtt_eb_pub(event):
    """Deletes and recreates the MQTT Event Bus publisher and online rules."""

    # Reload to get the latest config parameters.
    import configuration
    reload(configuration)

    if load_publisher():
        load_online()

@log_traceback
def scriptLoaded(*args):
    """Creates and then calls the Reload MQTT Event Bus Publisher rule."""

    if create_simple_rule("Reload_MQTT_PUB",
                          "Reload MQTT Event Bus Publisher",
                          load_mqtt_eb_pub, init_logger,
                          description=("Reload the MQTT Event Bus publisher "
                                       "rule. Run when changing configuration.py"),
                          tags=["openhab-rules-tools","mqtt_eb"]):
        load_mqtt_eb_pub(None)

@log_traceback
def scriptUnloaded():
    """Deletes the MQTT Event Bus Publisher and Online rules and the reload rule."""

    delete_rule(load_mqtt_eb_pub, init_logger)
    delete_rule(mqtt_eb_pub, init_logger)
