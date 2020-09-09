"""
This script registers the profile multiPress that can be attached to a trigger channel. Suppose
you have a channel that reports the state of a momentary wall switch (on or off), this profile
watches and counts the number of consecutive taps (on, off in a short time) and sends a command
to the linked string item corresponding to the number of taps ("1", "2"). It also reports a hold 
after a specific amount of time as "HOLD".

Example:
String MyButton { channel="mqtt:topic:mosquitto:Tasmota:Switch"[profile="jython:multiPress", on="1", off="0", longDelay=900, shortDelay=150] }

Option     Purpose
on         (String, default "ON") Event on the trigger channel recognized as "on"
off        (String, default "OFF") Event on the trigger channel recognized as "off"
longDelay  (Number, default 1000) Time in ms until a pressed switch is recognized as HOLD
shortDelay (Number, default 200) Time between off and on for the second tap to be recognized
           as a double tap instead of two individual single taps
"""
scriptExtension.importPreset(None)# fix for compatibility with Jython > 2.7.0

import core
import traceback
from core.osgi import register_service, unregister_service
from core.log import logging, LOG_PREFIX
from java.util.concurrent import TimeUnit
from org.eclipse.smarthome.core.library import CoreItemFactory
from org.eclipse.smarthome.core.library.types import StringType
from org.eclipse.smarthome.core.thing.profiles import ProfileTypeUID, ProfileTypeBuilder, \
        ProfileFactory, ProfileTypeProvider, TriggerProfile

log = logging.getLogger("{}.core.MultiPressProfile".format(LOG_PREFIX))

FACTORY_CLASS = "{}.{}".format(ProfileFactory.__module__, ProfileFactory.__name__)
PROVIDER_CLASS = "{}.{}".format(ProfileTypeProvider.__module__, ProfileTypeProvider.__name__)

UID_MULTI_PRESS = ProfileTypeUID("jython", "multiPress")

TYPE_MULTI_PRESS = ProfileTypeBuilder.newTrigger(UID_MULTI_PRESS, "Multi Press") \
                                     .withSupportedItemTypes(CoreItemFactory.STRING) \
                                     .build()

try:
    class MultiPressProfile(TriggerProfile):

        def __init__(self, callback, context):
            log.info("Initializing MultiPressProfile with configuration {}".format(context.configuration))
            self.callback = callback
            self.context = context
            self.future = None
            self.state = False
            self.clicks = 0

        def onTriggerFromHandler(self, event):
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
            pass # channel is supposed to be read-only

        def __cancel(self):
            if not self.future is None:
                self.future.cancel(True)
                self.future = None

        def __stateChanged(self, event):
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
            log.debug("Detected long press on multiPress profile")
            self.callback.sendCommand(StringType("HOLD"))
            self.clicks = -1

        def __clicks(self):
            log.debug("Detected {} clicks on multiPress profile".format(self.clicks))
            self.callback.sendCommand(StringType(str(self.clicks)))
            self.clicks = 0

    class MultiPressProfileFactory(ProfileFactory):

        def createProfile(self, type, callback, context):
            return MultiPressProfile(callback, context)

        def getSupportedProfileTypeUIDs(self):
            return [UID_MULTI_PRESS]
        
    core.MultiPressProfileFactory = MultiPressProfileFactory()
except:
    core.MultiPressProfileFactory = None
    log.error(traceback.format_exc())

def scriptLoaded(*args):
    if core.MultiPressProfileFactory is not None:
        register_service(core.MultiPressProfileFactory, [FACTORY_CLASS])
        log.debug("Registered service")

def scriptUnloaded():
     if core.MultiPressProfileFactory is not None:
        unregister_service(core.MultiPressProfileFactory)
        core.MultiPressProfileFactory = None
        log.debug("Unregistered service")
