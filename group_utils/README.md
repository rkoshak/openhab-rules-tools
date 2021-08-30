# Group Utils
A collection of utility functions to work with group members' names, labels and states.

# Purpose
Get the names, labels or states of the direct or all members of a group. Perform the arithmetic operations known from the openHAB [group item definition](https://www.openhab.org/docs/configuration/items.html#derive-group-state-from-member-items) on the states or count how many members' states match a given expression.

# How it works

## JavaScript
The JavaScript version of this library was created and tested on openHAB 3.0 and 3.1. This library has no dependencies. It does not work with the GraalVM JavaScript add-on. The class provides four functions.

### Create an instance of group_utils
```javascript
this.OPENHAB_CONF = (this.OPENHAB_CONF === undefined) ? java.lang.System.getenv("OPENHAB_CONF") : this.OPENHAB_CONF
load(OPENHAB_CONF+'/automation/lib/javascript/community/groupUtils.js')
var GroupUtils = new GroupUtils()
```

### getMembers
This function returns the names, the labels or the states of direct group members as an array.
```javascript
var group = GroupUtils.getMembers(groupname, characteristic)

// example
// the states of direct members of "windows"
var windows = GroupUtils.getMembers('windows', 'state') 
```
Argument | Purpose | Required
-|-|-
`groupname` | The name of the group. | no
`characteristic` | Defines what you get from the members. Valid are: name (default), label, state. | yes

### getAllMembers
This function returns the names, the labels or the states of direct and child group members. The group items are excluded from the array.
```javascript
var group = GroupUtils.getAllMembers(groupname, characteristic)

// example
// the names of all (direct & child) members of "doors"
var name = GroupUtils.getMembers('doors', 'name') // the same as ...getMembers('doors')
```
Argument | Purpose | Required
-|-|-
`groupname` | The name of the group. | no
`characteristic` | Defines what you get from the members. Valid are: name (default), label, state. | yes

### arithmetic
Perform arithmetic operations on the states of Number members. This functionality is the same as in the openHAB [group item definition](https://www.openhab.org/docs/configuration/items.html#derive-group-state-from-member-items). The function returns the value from the given function.
```javascript
// get the states
var group = GroupUtils.getMembers(groupname, 'state')

// perform arithmetic operation
var arithmetic = GroupUtils.arithmetic(items, func)

// examples
var power = GroupUtils.getMembers('power', 'state') // the states of direct members of "power"
var max = GroupUtils.arithmetic(power, 'MAX') // the highest value from "power"
var min = GroupUtils.arithmetic(power, 'MIN') // the lowest value from "power"
var avg = GroupUtils.arithmetic(power, 'AVG') // the average value from "power"
var sum = GroupUtils.arithmetic(power, 'SUM') // the summarized value from "power"
```
Argument | Purpose | Required
-|-|-
`items` | The array of item states. | yes
`func` | Defines which function to perform, valid: MAX, MIN, AVG, SUM. | yes

### count
Count the states matching a given comparison expression. This functionality is the same as in the openHAB [group item definition](https://www.openhab.org/docs/configuration/items.html#derive-group-state-from-member-items).
The function returns how many members match the given comparison expression.
```javascript
// get the states
var items = GroupUtils.getMembers(groupname, 'state')
// count
var counter = GroupUtils.count(items, op, comp)

// examples
var lights = GroupUtils.getMembers('lights', 'state') // the states of direct members of "lights"
var lightsOFF = GroupUtils.count(lights, 'equal', 'OFF') // the number of lights off
var lightsNotOFF = GroupUtils.count(lights, 'notEqual', 'OFF') // the number of lights not off

var temp = GroupUtils.getMembers('temperatures', 'state') // the states of direct members of "temperatures"
var larg24 = GroupUtils.count(temp, 'larger', 24) // the number of states higher than 24
var smal24 = GroupUtils.count(temp, 'smaller', 24) // the number of states lower than 24
var largEq24 = GroupUtils.count(temp, 'smallerEqual', 24) // the number of states lower or equal than/to 24
var smalEq24 = GroupUtils.count(temp, 'largerEqual', 24) // the number of states higher or equal than/to 24
```
Argument | Purpose | Required
-|-|-
`items` | The array of item states. | yes
`op` | The comparison operator, available: equal, notEqual, larger, largerEqual, smaller, smallerEqual. | yes
`comp` | The value to compare with, e.g. numbers, ON/OFF states or strings. | yes

### Tests
There are no tests, as the library has no dependencies it should always work.

## Jython
Currently, there is no Jython version of this library.

# Disclaimer
This library class is maintained by [@florian-h05](https://github.com/florian-h05) and also maintained in the repository [openhab-conf](https://github.com/florian-h05/openhab-conf).