"""
Copyright September 23, 2020 Sascha Volkenandt

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
from core.osgi import register_service, unregister_service
from core.log import logging, log_traceback, LOG_PREFIX
from core.jsr223.scope import StringType
from java.util.concurrent import TimeUnit

# imports not supported by core.jsr223.scope
try:
    from org.eclipse.smarthome.core.thing.profiles import ProfileTypeUID, ProfileFactory, \
        TriggerProfile
except:
    from org.openhab.core.thing.profiles import ProfileTypeUID, ProfileFactory, \
        TriggerProfile

scriptExtension.importPreset(None) # fix for compatibility with Jython > 2.7.0

log = logging.getLogger("{}.MultiPress".format(LOG_PREFIX))

UID_MULTI_PRESS = ProfileTypeUID("jython", "multiPress")

SERVICE_CLASS = "{}.{}".format(ProfileFactory.__module__, ProfileFactory.__name__)
FACTORY_INSTANCE = None

class MultiPressProfile(TriggerProfile):
    """The profile class is instantiated when a link using this profile gets triggered for the 
    first time and stores the current state and context. 
    ATTENTION:
    This class is not intended for use by scripts. It will be instantiated and managed by the
    framework!
    """

    @log_traceback
    def __init__(self, callback, context):
        """Initializes the profile's context and state.
        Arguments:
            - callback: The ProfileCallback object used to communicate with the linked item and 
            channel
            - context: The ProfileContext object holding the profile configuration and rules 
            scheduler
        Members:
            - callback
            - context
            - future: A ScheduledFuture representing the running timer or None if no timer is 
            active
            - state: The current state of the button prior to any invocation to track changes
            - clicks: The number of taps counted so far
        """

        log.info("Initializing MultiPressProfile with configuration {}"
                 .format(context.configuration))
        self.callback = callback
        self.context = context
        self.future = None
        self.state = False
        self.clicks = 0

    @log_traceback
    def onTriggerFromHandler(self, event):
        """See TriggerProfile#onTriggerFromHandler
        Tracks state changes and the time in between to count taps and hold/release events.
        """

        if self.__state_changed(event):
            self.__cancel()

            if self.state:
                delay = int(str(self.context.configuration.get("longDelay") or "1000"))
                log.debug("Arming {} ms timer for multiPress profile".format(delay))
                self.future = self.context.executorService.schedule(
                    lambda: self.__long_press(), delay, TimeUnit.MILLISECONDS)
            elif self.clicks != -1:
                delay = int(str(self.context.configuration.get("shortDelay") or "200"))
                log.debug("Arming {} ms timer for multiPress profile".format(delay))
                self.clicks += 1
                self.future = self.context.executorService.schedule(
                    lambda: self.__clicks(), delay, TimeUnit.MILLISECONDS)
            else:
                self.clicks = 0
                self.callback.sendCommand(StringType("RELEASE"))

    @log_traceback
    def onStateUpdateFromItem(self, state):
        """See Profile#onStateUpdateFromItem
        Ignored since channel is supposed to be read-only.
        """

    @log_traceback
    def __cancel(self):
        """Cancels any previously scheduled timer."""

        if not self.future is None:
            self.future.cancel(True)
            self.future = None

    @log_traceback
    def __state_changed(self, event):
        """Translates the trigger event into a boolean representing the current state and returns
        True if the state has changed since the last invocation. This allows for devices that
        occasionally report an event although the button has not been touched (i.e. Shelly
        Dimmer).
        """

        on_value = str(self.context.configuration.get("on") or "ON")
        off_value = str(self.context.configuration.get("off") or "OFF")
        if event == on_value:
            new_state = True
        elif event == off_value:
            new_state = False
        else:
            log.warn("Channel has triggered unrecognized event {}".format(event))
            return False

        if self.state != new_state:
            self.state = new_state
            return True

        return False

    @log_traceback
    def __long_press(self):
        """Gets invoked by a timer firing after longDelay ms and reports a HOLD event to the 
        item.
        """

        log.debug("Detected long press on multiPress profile")
        self.callback.sendCommand(StringType("HOLD"))
        self.clicks = -1

    @log_traceback
    def __clicks(self):
        """Gets invoked by a timer firing after shortDelay ms and reports the number of taps
        encountered consecutively.
        """

        log.debug("Detected {} clicks on multiPress profile".format(self.clicks))
        self.callback.sendCommand(StringType(str(self.clicks)))
        self.clicks = 0

class MultiPressProfileFactory(ProfileFactory):
    """The profile factory class gets injected into OpenHABs service registry and can thus be used
    by specifying "jython:multiPress" as a profile when linking channels and items.
    ATTENTION:
    This class is not intended for use by scripts. It will be instantiated only once and managed 
    by the framework!
    """

    @log_traceback
    def createProfile(self, type, callback, context):
        """See ProfileFactory#createProfile
        Called when a link using this profile gets triggered for the first time.
        """

        return MultiPressProfile(callback, context)

    @log_traceback
    def getSupportedProfileTypeUIDs(self):
        """See ProfileFactory#getSupportedProfileTypeUIDs
        Reports which profiles this factory supports to OpenHAB's service registry.
        """

        return [UID_MULTI_PRESS]

@log_traceback
def scriptLoaded(*args):
    """Registers the profile factory in OpenHAB's service registry."""

    global FACTORY_INSTANCE
    FACTORY_INSTANCE = MultiPressProfileFactory()
    register_service(FACTORY_INSTANCE, [SERVICE_CLASS])
    log.debug("Registered service MultiPressProfileFactory")

@log_traceback
def scriptUnloaded():
    """Removes the profile factory from OpenHAB's service registry."""

    global FACTORY_INSTANCE
    if FACTORY_INSTANCE is not None:
        unregister_service(FACTORY_INSTANCE)
        FACTORY_INSTANCE = None
        log.debug("Unregistered service")
