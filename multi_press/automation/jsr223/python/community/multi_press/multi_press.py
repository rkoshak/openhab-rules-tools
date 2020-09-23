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
scriptExtension.importPreset(None) # fix for compatibility with Jython > 2.7.0

import core
import traceback
from core.osgi import register_service, unregister_service
from core.log import logging, LOG_PREFIX
from java.util.concurrent import TimeUnit
from org.eclipse.smarthome.core.library.types import StringType
from org.eclipse.smarthome.core.thing.profiles import ProfileTypeUID, \
        ProfileFactory, ProfileTypeProvider, TriggerProfile

log = logging.getLogger("{}.MultiPress".format(LOG_PREFIX))

FACTORY_CLASS = "{}.{}".format(ProfileFactory.__module__, ProfileFactory.__name__)

UID_MULTI_PRESS = ProfileTypeUID("jython", "multiPress")

class MultiPressProfile(TriggerProfile):
    """
    The profile class is instantiated when a link using this profile gets triggered for the first 
    time. Holds configuration, callback and internal state of the profile.
    """

    def __init__(self, callback, context):
        """
        Constructor
        """

        log.info("Initializing MultiPressProfile with configuration {}".format(context.configuration))
        self.callback = callback
        self.context = context
        self.future = None
        self.state = False
        self.clicks = 0

    def onTriggerFromHandler(self, event):
        """
        Overrides TriggerProfile#onTriggerFromHandler
        Gets called every time the channel triggers and tracks the number of consecutive taps.
        """

        if self.__stateChanged(event):
            self.__cancel()

            if self.state:
                delay = int(str(self.context.configuration.get("longDelay") or "1000"))
                log.debug("Arming {} ms timer for multiPress profile".format(delay))
                self.future = self.context.executorService.schedule(
                        lambda: self.__longPress(), delay, TimeUnit.MILLISECONDS)
            elif self.clicks != -1:
                delay = int(str(self.context.configuration.get("shortDelay") or "200"))
                log.debug("Arming {} ms timer for multiPress profile".format(delay))
                self.clicks += 1
                self.future = self.context.executorService.schedule(
                        lambda: self.__clicks(), delay, TimeUnit.MILLISECONDS)
            else:
                self.clicks = 0

    def onStateUpdateFromItem(self, state):
        """
        Overrides TriggerProfile#onStateUpdateFromItem
        Gets called every time the item updates its state. Ignored since channel is supposed
        to be read-only.
        """

        pass

    def __cancel(self):
        """
        Cancels any previously scheduled timer.
        """

        if not self.future is None:
            self.future.cancel(True)
            self.future = None

    def __stateChanged(self, event):
        """
        Translates the trigger event into a boolean representing the current state and returns
        if the state has changed since the last invocation. This allows for devices that 
        occasionally report an event although the button has not been touched (i.e. Shelly 
        Dimmer).
        """

        onValue = str(self.context.configuration.get("on") or "ON")
        offValue = str(self.context.configuration.get("off") or "OFF")
        if event == onValue:
            newState = True
        elif event == offValue:
            newState = False
        else:
            log.warn("Channel has triggered unrecognized event {}".format(event))
            return False

        if self.state != newState:
            self.state = newState
            return True

        return False

    def __longPress(self):
        """
        Gets invoked by a timer firing after longDelay ms and reports a HOLD event to the item.
        """

        log.debug("Detected long press on multiPress profile")
        self.callback.sendCommand(StringType("HOLD"))
        self.clicks = -1

    def __clicks(self):
        """
        Gets invoked by a timer firing after shortDelay ms and reports the number of taps 
        encountered consecutively.
        """

        log.debug("Detected {} clicks on multiPress profile".format(self.clicks))
        self.callback.sendCommand(StringType(str(self.clicks)))
        self.clicks = 0

class MultiPressProfileFactory(ProfileFactory):
    """
    The profile factory class gets injected into OpenHABs service registry and can thus be used 
    by specifying "jython:multiPress" as a profile when linking channels and items.
    """

    def createProfile(self, type, callback, context):
        """
        Called when a link using this profile gets triggered for the first time.
        """

        return MultiPressProfile(callback, context)

    def getSupportedProfileTypeUIDs(self):
        """
        Reports, which profiles this factory supports to OpenHAB's service registry.
        """

        return [UID_MULTI_PRESS]

try:        
    core.MultiPressProfileFactory = MultiPressProfileFactory()
except:
    core.MultiPressProfileFactory = None
    log.error(traceback.format_exc())

def scriptLoaded(*args):
    """
    Registers the profile factory in OpenHAB's service registry.
    """

    if core.MultiPressProfileFactory is not None:
        register_service(core.MultiPressProfileFactory, [FACTORY_CLASS])
        log.debug("Registered service")

def scriptUnloaded():
    """
    Removes the profile factory from OpenHAB's service registry.
    """

    if core.MultiPressProfileFactory is not None:
        unregister_service(core.MultiPressProfileFactory)
        core.MultiPressProfileFactory = None
        log.debug("Unregistered service")
