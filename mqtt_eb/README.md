# MQTT Event Bus
A set of rules that enable the creation of an MQTT Event Bus.
These rules do require some configuration of the MQTT binding as well as the definition of some variables in configuration.py.

# Purpose
There are times where a user has more than one instance of openHAB running and needs to mirror the Items hosted in one instance in the other instance.
For example, it might be required to host an instance of OH closer to the hardware than a "main" instance.
A user may need to run an older version of OH for compatibility reasons but want to take advantage of new capabilities as well.
There may be a remote instance of openHAB monitoring and controlling a separate building in another location that needs to be monitored from the "main" openHAB.

The event bus can support a one-to-one relationship between two instances of openHAB or a star shaped topology where there is one main openHAB instance with many satellite instances feeding into it.
The library would need modifications to support a many-to-many topology.
More on topologies is below.

# Requirements
- `rules_tools` used to reload the rules when the configuration changes.

# How it works
The rules are split into two parts: publisher and subscription.

## Prerequisites
As one would expect, these rules require the MQTT 2.x binding or later to be installed.
There needs to be an MQTT Broker Thing manually created and configured to connect and that Thing should show as ONLINE.
Take note of the broker Thing's ID.
Additional configuration is required that is specific to the Publisher and Subscriber described below.
More details about configuring the MQTT 2.x binding for use with the event bus can be found at [MQTT 2.5 Event Bus](https://community.openhab.org/t/mqtt-2-5-event-bus/76938).

## Publisher
The Publisher rules are responsible for publishing updates and command to the Item's MQTT topic.
The topic is defined by:

    <openHAB name>/out/<Item Name>/[state|command]

So, given "main-openhab" as the `<openHAB name>` and "MyItem" as the `<Item Name>`, updates will be published to `main-openhab/out/MyItem/state` and command published to `main-openhab/out/MyItem/command`.
`<openHAB name>` is defined in `configuration.py` as `mqtt_eb_name`.

In addition to publish Items updates and commands, the Publisher will also publish the message `ONLINE` to `<openHAB name>/status` when it first comes online as a retained message.
The MQTT broker Thing should be configured to publish `OFFLINE` as a retained message to this same topic as the LWT.
This allows other instances to know when that instance is online or offline.

The publisher also has a few variables that need to be created and populated in `configuration.py`.

Variable | Purpose
-|-
`mqtt_eb_name` | The name used as the root of the event bus topics. It must be a string containing only characters allowed in an MQTT topic.
`mqtt_eb_broker` | Set to the Thing ID of the MQTT broker. This is used with the publishMQTT Action to publish the messages.
`mqtt_eb_puball` | An optional variable. When it's absent or set to True all updates and all commands to the all Items are published. When False, only those Items tagged with `eb_update` have their updates published and only those Items tagged with `eb_command` have their command  published.

After changing any of the three variables in `configuration.py` or changing the tags on any Items, the rule needs to be reloaded.
Either send an `ON` command to `Reload_MQTT_PUB` (it will be created automatically if it doesn't already exist) or trigger the "Reload MQTT event bus Publisher" rule manually from PaperUI which will recreate the rule with the new configuration.

## Subscriber
The Subscriber rule is responsible for receiving the messages published to the event bus and updating or commanding the Items that have the same name as indicated by the topic with the message received.

The subscriber receives all the messages on the indicated event bus topic list and parses out the Item name and event type (state or command) from the topic.
If an Item of that name exists, it is updated or commanded with the contents of the message.
If an Item of that name does not exist, nothing happens.

The subscriber requires an event trigger Channel to be created on the MQTT Broker Thing.
The subscription for that channel should be `<openHAB name>/[in|out]/*`.
What to put for the two options depends on the desired topology.

Once the trigger Channel is created, the Channel ID needs to be set to the `mqtt_eb_chan` variable in `configuration.py`.
If `mqtt_eb_chan` is changed, send an `ON` command to `Reload_MQTT_SUB` or trigger the "Reload MQTT event bus Subscription" rule manually from PaperUI which will recreate the rule with the new Channel as the trigger.

## One-to-One Topology
In a One-to-One Topology, there are only two instances of openHAB.
For this discussion let's call them `local` and `remote`.
Then configure the two instances as follows:

Name|Publish Topic|Subscribe Topic
-|-|-
`local` | `local/out/<Item Name>/[state|command]` | `remote/out/*`
`remote` | `remote/out/<Item Name>/[state|command]` | `local/out/*`

Local publishes to it's own out topic and subscribes to remote's out topic.
Conversely, remote publishes to it's own out topic and subscribes to local's out topic.

## Star Topology
In a star topology there is one central 'main' openHAB instance and multiple "satellite" openHAB instances.
All events from the "satellite" instances need to be published to 'main' and all commands from `main` need to be published to the "satellites".
To facilitate this we will configure the instances as follows:

Name | Publish Topic | Subscribe Topic
-|-|-
`main` | `main/out/<Item Name>/command` | `main/in/*`
`satellite1` | `main/in/<Item Name>/[state|command]` | `main/out/*`
`satellite2` | `main/in/<Item Name>/[state|command]` | `main/out/*`

Notice that the root of the topics is `main` even for the satellites.
Also note that only commands are published by `main`.
This is to prevent infinite loops where `main` publishes an update, `satellite1` picks it up and updates the Item which generates a state message which `main` picks up and updates the Item and so on.
Note that this is not enforced in the code.
It is up to you to not configure Items to publish updates from `main` (i.e. don't tag any Items with `eb_update`).

All Items that need to be synchronized to `main` must have a unique name across all the Items in all the satellite instances.

## Many to Many Topology
This topology is not recommended for use because it is almost impossible to avoid infinite loops.

# Examples

## Tagging Items for the event bus
```
Switch Foo [eb_command] // publishes only commands to the event bus
String Bar [eb_update] // publishes only updates to the event bus
Number Baz [eb_command,eb_update] // publishes both command and updates to the event bus
```

## Example `configuration.py`

```python
# The Channel ID of the MQTT Event Bus subscription channel
mqtt_eb_in_chan = "mqtt:broker:mosquitto:eventbus"

# The name to use for this instance of openHAB, forms the root of the MQTT topic
# hierarchy.
mqtt_eb_name = "remote-openhab"

# Thing ID for the MQTT broker Thing.
mqtt_eb_broker = "mqtt:broker:mosquitto"

# Optional flag, when True all Item commands and updates are published.
# Defaults to True.
mqtt_eb_puball = True
```
