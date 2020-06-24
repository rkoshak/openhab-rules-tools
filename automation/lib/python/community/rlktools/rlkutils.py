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
from core.jsr223 import scope

def hysteresis(target, value, low=0, high=0):
    """
    Checks if the passed in value is below, above or between the hysteresis gap
    defined by

        target-low <= value <= target+high.

    The function accepts Python primitives, QuantityTypes, DecimalTypes, or
    PercentTypes or any combination of the four types. When using QuantityTypes,
    the default units of the Units of Measure is used.

    Arguments:
        - target: defines the setpoint for the comparison
        - value: value to determine where it is in the hysteresis
        - low: value subtracted from target to define the lower bounds of the
        hysteresis gap, defaults to 0
        - high: value added to target to define the upper bounds of the
        hystersis gap, defaults to 0

    Returns:
        - 1 if value is >= target+high
        - 0 if the value is between target-low and target+high or if low and
        high are both zero and value == target
        - (-1) if value is <= target-low

    Examples:
        - hysteresis(70, 69, 2, 3) : returns 0
        - hysteresis(70, 67, 2, 3) : returns -1
        - hysteresis(70, 71, 2, 3) : returns 0
        - hysteresis(70, 74, 2, 3) : returns 1
    """
    target, value, low, high = [x.floatValue()
                                if isinstance(x, (scope.QuantityType,
                                                  scope.DecimalType,
                                                  scope.PercentType))
                                else x
                                for x in [target, value, low, high]]

    if value == target or target - low < value < target + high:
        rval = 0
    elif value <= (target - low):
        rval = -1
    else:
        rval = 1

    return rval
