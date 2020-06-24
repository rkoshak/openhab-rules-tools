"""
Copyright June 23, 2020 Richard Koshak

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

import community.rlktools.rlkutils
reload(community.rlktools.rlkutils)
from community.rlktools.rlkutils import hysteresis
from core.log import logging, LOG_PREFIX

log = logging.getLogger("{}.TEST.util".format(LOG_PREFIX))
try:
    log.info("Starting hysteresis tests")
    assert hysteresis(30, 30, 1, 1) == 0, "Failed 30, 30, 1, 1"
    assert hysteresis(30, 29, 1, 1) == -1, "Failed 30, 29, 1, 1"
    assert hysteresis(30, 31, 1, 1) == 1, "Failed 30, 31, 1, 1"
    assert hysteresis(30, 30) == 0, "Failed 30, 30"
    assert hysteresis(30, 31) == 1, "Failed 30, 31"
    assert hysteresis(30, 29) == -1, "Failed 30, 29"
    assert hysteresis(QuantityType(u"30 %"),
                      QuantityType(u"29 %"),
                      low=QuantityType(u"1 %")) == -1, "Failed QuantityType low"
    assert hysteresis(QuantityType(u"30 %"), QuantityType(u"29 %"), 1, 1) == -1, "Failed QuantityType default"
    assert hysteresis(QuantityType(u"30 %"),
                      QuantityType(u"31 %"),
                      high=QuantityType(u"1 %")) == 1, "Failed QuantityType high"
    assert hysteresis(DecimalType(30),
                      DecimalType(29),
                      low=DecimalType(1)) == -1, "Failed DecimalType low"
    assert hysteresis(DecimalType(30), DecimalType(29), 1, 1) == -1, "Failed DecimalType default"
    assert hysteresis(DecimalType(30),
                      DecimalType(31),
                      high=DecimalType(1)) == 1, "Failed DecimalType high"
    assert hysteresis(PercentType(30),
                      PercentType(29),
                      low=PercentType(1)) == -1, "Failed PercentType low"
    assert hysteresis(PercentType(30), PercentType(29), 1, 1) == -1, "Failed PercentType default"
    assert hysteresis(PercentType(30),
                      PercentType(31),
                      high=PercentType(1)) == 1, "Failed PercentType high"
    assert hysteresis(QuantityType(u"30 %"),
                      DecimalType(29),
                      PercentType(1), 1) == -1, "Failed mix of Quantitytype, DecimalType and PercentType"

except AssertionError:
    import traceback
    log.error("Exception: {}".format(traceback.format_exc()))
else:
    log.info("hysteresis tests passed!")
