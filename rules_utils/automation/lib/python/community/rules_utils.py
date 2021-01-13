"""
Copyright June 25, 2020 Richard Koshak

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
from core.metadata import get_value
from core.jsr223 import scope
from core.log import log_traceback


@log_traceback
def create_switch_trigger_item(item_name, logger):
    """Checks to see if the passed in Item exists and if it doesn't creates it
    as a Switch Item.

    Arguments:
        - item_name: the name of the Item to create
        - logger: used to log out informational statement
    Returns:
        True if the Item was created or it exists already and it's the right
        type. False otherwise.
    """

    if item_name not in scope.items:
        from core.items import add_item
        logger.info("Creating Item {}".format(item_name))
        add_item(item_name, item_type="Switch")
        return True

    # TODO: figure out how to test the Item's type.
#    if not isinstance(scope.ir.getItem(item_name),
#                      (scope.SwitchItem,
#                       scope.DimmerItem,
#                       scope.ColorItem)):
#        logger.error("Item {} already exists but it can't receive ON commands"
#                     .format(item_name))
#        return False
    else:
        return True


@log_traceback
def delete_rule(function, logger):
    """Deletes a rule attached to the passed in function, if it exists.

    Arguments:
        - function: the function the rule is attached to
        - logger: used to log out information and errors
    Returns:
        True if the rule is successfully deleted, False otherwise.
    """

    if hasattr(function, "UID"):
        logger.info("Deleting rule {}".format(function.UID))
        scope.scriptExtension.get("ruleRegistry").remove(function.UID)
        delattr(function, "triggers")
        delattr(function, "UID")

    if hasattr(function, "UID"):
        logger.error("Failed to delete rule {}".format(function.UID))
        return False
    else:
        return True


@log_traceback
def create_rule(name, triggers, function, logger, description=None, tags=None):
    """Creates a rule with the passed in data

    Arguments:
        - name: the name for the rule
        - triggers: a list of rule trigger strings
        - function: the function to attach the rule to
        - logger: logs out informational and error messages
        - description: optional description for the rule
        - tags: optional list of tags
    Returns:
        True if successful, False otherwise.
    """

    for trigger in triggers:
        when(trigger)(function)

    rule(name, description, tags)(function)

    if hasattr(function, "UID"):
        logger.info("Successfully created rule {}".format(name))
        return True
    else:
        logger.error("Failed to create rule {}".format(name))
        return False


@log_traceback
def create_simple_rule(item_name, name, function, logger, description=None,
                       tags=None):
    """Creates a rule triggered by a Switch Item receiving an ON command whcih
    calls the passed in function. If the Item doesn't exit, it's automatically
    created.

    Arguments:
        - item_name: Name of the Switch Item to create
        - name: Name of the rule
        - function: function to call when the rule is triggered
        - logger: logs out errors and information
        - description: description for the rule
        - tags: tags for the rule
    Returns:
        True if successful, False otherwise.
    """
    if create_switch_trigger_item(item_name, logger):
        triggers = ["Item {} received command ON".format(item_name)]
        if create_rule(name, triggers, function, logger, description, tags):
            return True
    return False


@log_traceback
def load_rule_with_metadata(namespace, check_config, event, rule_name, function,
                            logger, description=None, tags=None, systemstarted=False):
    """Creates a rule triggered by event on all Items with valid a valid
    configuration for the passed in namespace. Based additions to the original
    submission of the Expire binding to the openhab-helper-libraries by
    CrazyIvan359.


    Arguments:
        - namespace: the metadata namespace to search for.
        - check_config: a function called to check the validity of the config;
        it expects the item name as the first argument and logger as the second.
        check_config should log errors and warnings explaining what is wrong with
        the config
        - event: the event part of the rule trigger, e.g. "received command ON"
        - rule_name: The name to apply to the rule
        - function: called when the rule triggers
        - logger: log errors and information statements
        - descrption: optional description to apply to the rule
        - tags: optional tags to apply to the rule
        - systemstarted: optional system started trigger
    Returns:
        None if there was an error creating the rule, the list of Item names
        for which a trigger was created on the new rule if successful.
    """

    logger.info("Creating {} rule...".format(rule_name))

    # Remove the existing rule if it exists.
    if not delete_rule(function, logger):
        return None

    # Generate the rule triggers with the latest metadata configs.
    triggers = generate_triggers(namespace, check_config, event, logger)
    if not triggers:
        logger.warn("There are no Items with a valid {} metadata"
                    .format(namespace))
        return None

    if systemstarted:
        triggers = ["System started"] + triggers

    # Create the rule.
    if not create_rule(rule_name, triggers, function, logger, description, tags):
        return None

    return get_items_from_triggers(triggers)


def generate_triggers(namespace, check_config, event, logger):
    """Generates a trigger for all Items with namespace metadata that passes
    check_config. The event is defined in event.

    Arguments:
        - namespace: the metadata namespace to look for
        - check_config: function to call to check the validity of the metadata
        - event: rule trigger event (e.g. changed)
        - logger: used to log out errors and informational statement
    Returns:
        A list of rule trigger strings.
    """

    triggers = []
    for i in [i for i in scope.items if get_value(i, namespace)]:
        if check_config(i, logger):
            triggers.append("Item {} {}".format(i, event))

    return triggers


def get_items_from_triggers(triggers):
    """Given a list of Item rule triggers, extract the names of the Items and
    return them in a list.

    Arguments:
        - triggers: the list of rule trigger strings.
    Returns:
        A list of item_names.
    """

    return [t.split(" ")[1] for t in triggers if t.startswith("Item")]
