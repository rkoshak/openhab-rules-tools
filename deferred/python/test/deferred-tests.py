import community.deferred
reload(community.deferred)
from community.deferred import defer, cancel_all, cancel
from core.log import log_traceback, logging, LOG_PREFIX
from org.joda.time import DateTime
import time

log = logging.getLogger("{}.TEST.deferred".format(LOG_PREFIX))

log.info("Starting deferred tests")

# Create an Item to test with
log.info("Creating test Item Deferred_Test")
from core.items import add_item
item = "Deferred_Test"
add_item(item, item_type="Switch")

try:
    events.postUpdate(item, "OFF")
    time.sleep(0.1)
    assert items[item] == OFF, "Item didn't initialize to OFF"

    # Schedule based on DT
    t = DateTime.now().plusSeconds(1)
    defer(item, "ON", t, log)
    time.sleep(1.1)
    assert items[item] == ON, "Item didn't go to ON after a second with specific time"

    # Schedule based on duration
    defer(item, "OFF", "1s", log)
    time.sleep(1.1)
    assert items[item] == OFF, "Item didn't go to OFF after a second with duration"

    # Reschedule
    defer(item, "ON", "1s", log)
    time.sleep(0.1)
    assert items[item] == OFF, "Item isn't still OFF after initial schedule"
    defer(item, "ON", "2s", log)
    time.sleep(1)
    assert items[item] == OFF, "Timer didn't get rescheduled!"
    time.sleep(1.1)
    assert items[item] == ON, "Timer didn't reschedule on time!"

    # Cancel
    defer(item, "OFF", "1s", log)
    assert items[item] == ON, "Item isn't still ON after last test"
    cancel(item)
    time.sleep(1.1)
    assert items[item] == ON, "Timer didn't cancel!"

    # Cancel All
    defer(item, "OFF", "1s", log)
    cancel_all()
    time.sleep(1.1)
    assert items[item] == ON, "Timer didn't cancel all"

except AssertionError:
    import traceback
    log.error("Exception: {}".format(traceback.format_exc()))
except TypeError:
    import traceback
    log.error("Exception: {}".format(traceback.format_exc()))
else:
    log.info("Deferred tests passed!")
finally:
    log.info("Deleting test Item")
    from core.items import remove_item
    remove_item(item)
