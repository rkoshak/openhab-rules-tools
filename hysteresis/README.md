# Hysteresis

This library consists of a simple function that implements a hysteresis comparison that is compatible with all number types from openHAB (e.g. `Number:Temperature`) and Python primitive types.
Any combination of number types are supported.

Hysteresis is often used when controlling a device that inputs into a system and causes a change in the state of that system.
For example, a heater adds heat to a system to raise the temperature.
It takes some time for the input to change the state.
The sensor that reads the state often has some noise such that when the state is near the threshold it will bounce above and below the threshold for a time.
This bouncing can cause the device (e.g. heater) to rapidly turn on and off in response, also known as flapping.

To avoid flapping, hysteresis defines a "dead zone" where nothing is done despite the sensor reading bouncing around within it.

For example, with a heater, we will turn on the heater at 68 degrees F but not turn it off until 70 degrees F.
Therefore, there is a two degree gap in which the heater is neither turned on nor turned off.

# Usage
Import the function and call it.

```python
    hysteresis(target, value, low, high)
```

Argument | Purpose
-|-
target | The target or setpoint value around which the hysteresis buffer is defined.
value | The current sensor reading.
low | Optional argument to define how much to subtract from the target to define the lower bound of the hysteresis buffer. Defaults to 0.
high | Optional argument to define how much to add to the target to define the upper bound of the hysteresis buffer. Defaults to 1.

# Example

```python
from community.hysteresis import hysteresis
...

    # Inside a Rule or a function, calculate whether the current temp is above
    # 70 (hyst == 1), temp is less than 68 (hyst == -1), or within the
    # hysteresis buffer (hyst == 0).
    hyst = hysteresis(70, items["CurrTemp"], low=2)
    if hyst > 0:
        events.sendCommand("Heater", "OFF")
    elif hyst < 0:
        events.sendCommand("Heater", "OFF")
```
