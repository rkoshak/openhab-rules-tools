"""
Copyright June 29, 2020 Richard Koshak

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
from core.metadata import get_metadata, get_key_value, get_value, remove_metadata
from core.utils import postUpdate, post_update_if_different

TRIGGER_ITEM = "InitItems"

# Create the triggering Item if it doesn't already exist.
if TRIGGER_ITEM not in items:
    from core.items import add_item
    add_item(TRIGGER_ITEM, item_type="Switch")

@rule("Initialize Items",
      description="Updates Items with an initialization value at System start",
      tags=["init", "openhab-rules-tools"])
@when("System started")
@when("Item {} received command ON".format(TRIGGER_ITEM))
def item_init(event):
    """Rule that triggers at System started and populates Items with an initial
    value. The initialization value is defined in metadata with three key/values.
        - value: value to send update the Item to
        - override: optional boolean value to override the state of the Item
        even if it isn't NULL, defaults to "False".
        - clear: optional boolean value to delete the metadata once the Item is
        updated. Defaults to "False".
    For example:
        - { init="ON"[override="true", clear="true"] }: Initialize
            the Switch Item to ON whether or not it already has a value and then
        delete the metadata.
        - { init="123,45,67" }: Initialize the Color Item to the value only if
        it is NULL or UNDEF.
    Limitations:
        - The clear option only works for Items not created through .items
            files. For Items defined in .items files, you must manually remove
            the metadata or else it will get reloaded next time the file is
            loaded.
    """

    item_init.log.info("Initializing Items")
    for item_name in [i for i in items if get_metadata(i, "init")]:
        try:
            value = get_value(item_name, "init")           

            # Always update if override is True
            if get_key_value(item_name, "init", "override") == "True":
                post_update_if_different(item_name, value)
                item_init.log.info("Overriding current value {} of {} to {}"
                                    .format(items[item_name], item_name, value))

            # If not overridden, only update if the Item is currently NULL or UNDEF.
            elif isinstance(items[item_name], UnDefType):
                item_init.log.info("Initializing {} to {}"
                                    .format(item_name, value))
                postUpdate(item_name, value)

            # Delete the metadata now that the Item is initialized.
            if get_key_value(item_name, "init", "clear") == "true":
                item_init.log.info("Removing init metadata from {}"
                                    .format(item_name))
                remove_metadata(item_name, "init")
                
        except:
            #catch iitialization errors and go to the next item
            item_init.log.warn("Could not set item {} to {}".format(item_name, value))
            continue

    item_init.log.info("Item initialization complete")
