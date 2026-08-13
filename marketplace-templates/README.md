# openHAB Rules Tools Marketplace Templates

OH 5.2+ YAML formatted files containing rule templates for the community marketplace. 
All templates are standalone, but almost all of them require the core `openhab_rules_tools` JS Scripting library to be installed.

For development or sparse checkouts, this folder can be checked out over the `$OH_CONF/automation/templates` folder.

---

## Catalog of Rule Templates

The following table summarizes the high-level purpose and usability of each rule template in the marketplace catalog, along with direct links to their official community forum postings.

| Template Filename | Template Label / Purpose | Forum / Marketplace Link |
| --- | --- | --- |
| **`ohrt-debounce.yaml`** | **Debounce**: Prevents rapid flipping of Item states (e.g., motion sensor flapping) by waiting a configured duration before forwarding the state to a Proxy Item. | [Debounce [4.0.0.0;4.9.9.9]](https://community.openhab.org/t/debounce-40004999/147427) |
| **`ohrt-delayStart.yaml`** | **Delay Start**: Delays the execution of selected rule(s) by a specified duration after a start trigger has occurred. | [Delay Start [4.0.0.0;4.9.9.9]](https://community.openhab.org/t/delay-start-40004999/145824) |
| **`ohrt-driveTime.yaml`** | **Drive Time**: Uses the Waze API to calculate the drive times and distance between two points. | [Drive Time [4.0.0.0;4.9.9.9]](https://community.openhab.org/t/drive-time-40004999/148419) |
| **`ohrt-expireUpdater.yaml`** | **Expire Updater**: Dynamically modifies the `expire` configuration on Items based on passed in data. | [Expire Updater [4.0.0.0;4.9.9.9]](https://community.openhab.org/t/expire-updater-40004999/146031) |
| **`ohrt-installOHRT.yaml`** | **Install OHRT**: A helper rule template to automatically download, install, or update the `openhab_rules_tools` library. | [Install openHAB Rules Tools [4.0.0.0;4.9.9.9]](https://community.openhab.org/t/install-openhab-rules-tools-40004999/145825) |
| **`ohrt-lastShutdown.yaml`** | **Last Shutdown**: On startup, reads the timestamp of the last log statement from the previous run of OH to determin when it last shutdown. | [Last Shutdown [4.0.0.0;4.9.9.9]](https://community.openhab.org/t/last-shutdown-40004999/146032) |
| **`ohrt-meterReading.yaml`** | **Meter Reading**: Tracks increments and updates utility/energy meter readings correctly across roll-overs and resets. | [Meter Reading [4.0.0.0;4.9.9.9]](https://community.openhab.org/t/meter-reading-40004999/148523) |
| **`ohrt-mqttEventBus.yaml`** | **MQTT Event Bus**: Synchronizes states, updates, and commands between multiple openHAB instances or other OH systems over MQTT. | [MQTT Event Bus [4.0.0.0;4.9.9.9]](https://community.openhab.org/t/mqtt-event-bus-40004999/148312) |
| **`ohrt-presenseSim.yaml`** | **Presence Simulator**: Plays back historical state changes of selected lights/appliances to simulate occupancy when you are away. | [Presence Simulator [4.0.0.0;4.9.9.9]](https://community.openhab.org/t/presence-simulator-40004999/148119) |
| **`ohrt-restartExpire.yaml`** | **Restart Expire**: Ensures active `expire` timers are correctly reinitialized and restarted after a system reboot. | [Restart Expire [4.0.0.0;4.9.9.9]](https://community.openhab.org/t/restart-expire-40004999/145826) |
| **`ohrt-thresholdAlert.yaml`** | **Threshold Alert**: Monitors a Group of numerical Items and triggers alerts when values exceed or fall below configured thresholds for a specific amount of time, with built-in hysteresis. | [Threshold Alert [4.0.0.0;4.9.9.9]](https://community.openhab.org/t/threshold-alert-40004999/148011) |
| **`ohrt-timeSM.yaml`** | **Time State Machine**: Implements a time-of-day state machine, driving state transitions based on time-based triggers. | [Time State Machine [4.0.0.0;4.9.9.9]](https://community.openhab.org/t/time-state-machine-40004999/146033) |
| **`ohrt-upgradeCheck.yaml`** | **Upgrade Check**: Periodically checks for updates to openHAB, and populates an Item when a new version is available. | [Upgrade Check [4.0.0.0;4.9.9.9]](https://community.openhab.org/t/upgrade-check-40004999/145827) |

---

## Usability Guidelines

To use any of these templates:
1. Ensure the `openhab_rules_tools` JS library is installed (openHABian, manually, or via `Install OHRT` template).
2. Go to **Settings -> Automation** in openHAB MainUI.
3. Choose the rule template from the Add-on Store or add it via sparse checkout/manual copy.
4. Create a new Rule, choose the installed template, configure the required Item parameters, and save.
