# Group Utils
A collection of utility functions to work with group members' names, labels and states.

# Purpose
Get the names, labels or states of the direct or all members of a group. 
Perform the arithmetic operations known from the openHAB [group item definition](https://www.openhab.org/docs/configuration/items.html#derive-group-state-from-member-items) on the states or count how many members match a given comparison function.

# How it works

## JavaScript
The JavaScript version of this library was created and tested on openHAB 3.0 and 3.1. 
This library has no dependencies. 
It __does not work__ with the GraalVM JavaScript add-on.

### Import the group_utils
```javascript
var OPENHAB_CONF = Java.type("java.lang.System").getenv("OPENHAB_CONF")
load(OPENHAB_CONF + '/automation/lib/javascript/community/groupUtils.js')
```

### Arguments for all functions
Argument | Purpose | Required
-|-|-
`group` | The name of the group. | yes

### __Get something from members__

### getMembersNames
This function returns the __names__ of direct group members as an array.
```javascript
var groupNames = getMembersNames(group)
```

### getMembersStates
This function returns the __states__ of direct group members as an array.
```javascript
var groupStates = getMembersStates(group)
```

### getMembersLabels
This function returns the __labels__ of direct group members as an array.
```javascript
var groupLabels = getMembersLabels(group)
```

### getMembersLabelsString
This function returns the __labels__ of direct group members as a concatenated string.
```javascript
var groupLabelsString = getMembersLabelsString(group)
```

### getAllMembersNames
This function returns the __names__ of direct and child group members as an array.
The group items are excluded.
```javascript
var groupAllNames = getAllMembersNames(group)
```

### getAllMembersStates
This function returns the __states__ of direct and child group members as an array.
The group items are excluded.
```javascript
var groupAllStates = getAllMembersStates(group)
```

### getAllMembersLabels
This function returns the __labels__ of direct and child group members as an array.
The group items are excluded.
```javascript
var groupAllLabels = getAllMembersLabels(group)
```

### getAllMembersLabelsStrings
This function returns the __labels__ of direct and child group members as a concatenated string.
The group items are excluded.
```javascript
var groupAllLabelsString = getAllMembersLabelsString(group)
```

### __Arithmetic operations__
Perform arithmetic operations on the states of Number members. 
This functionality is the same as in the openHAB [group item definition](https://www.openhab.org/docs/configuration/items.html#derive-group-state-from-member-items).
The following functions only use Items of type: Number, Dimmer or Rollershutter.
Other Items and NULL or UNDEF states are ignored.

### MembersSum
Get the __SUM__ of direct members' number states.
```javascript
var sum = MembersSum(group)
```

### MembersAvg
Get the __AVERAGE__ of direct members' number states.
```javascript
var avg = MembersAvg(group)
```

### MembersMin
Get the __MINIMUM__ of direct members' number states.
```javascript
var min = MembersMin(group)
```

### MembersMax
Get the __MAXIMUM__ of direct members' number states.
```javascript
var max = MembersMax(group)
```

### allMembersSum
Get the __SUM__ of all (also child) members' number states.
```javascript
var sum = allMembersSum(group)
```

### allMembersAvg
Get the __AVERAGE__ of all (also child) members' number states.
```javascript
var avg = allMembersAvg(group)
```

### allMembersMin
Get the __MINIMUM__ of all (also child) members' number states.
```javascript
var min = allMembersMin(group)
```

### allMembersMax
Get the __MAXIMUM__ of all (also child) members' number states.
```javascript
var max = allMembersMax(group)
```

### __Count operations__

### countMembers
Count the direct members matching a given comparison function. 
Comparison is done through a user-passed function.
The function returns how many members match the given comparison function.
```javascript
var counter = countMembers(group, compareFunc)
// with the following example scheme:
var counter = countMembers(group, function (i) { return i.getState() /* comparison operators */ })

// examples
var lightsOFF = countMembers('lights', function (i) { return i.getState() == OFF }) // the number of lights off
var larg24 = GroupUtils.count('temperatures', return i.getState() > 24 ) // the number of temperatures higher than 24
var smalEq24 = GroupUtils.count('temperatures', function (i) { return i.getState() <= 24 }) // the number of temperatures lower or equal than/to 24
```
Argument | Purpose | Required
-|-|-
`group` | The name of the group. | yes
`compareFunc` | The comparison function, pass and use `i` to work with the item.  | yes

### countAllMembers
Count direct and child group members matching a given comparison function.
The group items are excluded.
The function returns how many members match the given comparison function.
```javascript
var counter = countAllMembers(group, compareFunc)
// with the following example scheme:
var counter = countAllMembers(group, function (i) { return i.getState() /* comparison operators */ })
```
The arguments are exactly the same as for [countMembers](#countmembers).
The examples work in the same way as for [countMembers](#countmembers).

### __Testing__
Copy the contents of [groupUtils_tests.js](javascript/test/groupUtils_tests.js) to a new Script created in MainUI on openHAB 3 and press the Play button.

## Jython
Currently, there is no Jython version of this library.