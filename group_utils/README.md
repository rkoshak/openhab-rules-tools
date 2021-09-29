# Group Utils
A collection of utility functions to work with group members' names, labels and states.

# Purpose
Get the names, labels or states of the direct or all members of a group. 
Perform the arithmetic operations known from the openHAB [group item definition](https://www.openhab.org/docs/configuration/items.html#derive-group-state-from-member-items) on the states or count how many members match a given comparison function.

# How it works

## JavaScript
The JavaScript version of this library was created and tested on openHAB 3.0 and 3.1. 
This library has no dependencies. 

### Import the group_utils
```javascript
var OPENHAB_CONF = Java.type("java.lang.System").getenv("OPENHAB_CONF");
load(OPENHAB_CONF + '/automation/lib/javascript/community/groupUtils.js');
```

### Arguments for all functions
Argument | Purpose | Required
-|-|-
`group` | The name of the group. | yes

### __Get something from direct members__
These functions all return JavaScript arrays unless otherwise specified.
Order is undefined and not guaranteed to be the same.

Function | Purpose | Example
-|-|-
getMembersNames | It returns the __names__ of direct group members. | `var groupNames = getMembersNames(group);`
getMembersStates | It returns the __states__ of direct group members. | `var groupStates = getMembersStates(group);`
getMembersLabels | It returns the __labels__ of direct group members. | `var groupLabels = getMembersLabels(group);`
getMembersLabelsString | It returns the __labels__ of direct group members as a concatenated string. Order of the list is not guaranteed. | `var groupLabelsString = getMembersLabelsString(group);`

### __Get something from direct and child members__
These functions all return JavaScript arrays unless otherwise specified.
Order is undefined and not guaranteed to be the same.
The group items are excluded from the return.

Function | Purpose | Example
-|-|-
getAllMembersNames | It returns the __names__ of direct and child group members. | `var groupAllNames = getAllMembersNames(group);`
getAllMembersStates | It returns the __states__ of direct and child group members. | `var groupAllStates = getAllMembersStates(group);`
getAllMembersLabels | It returns the __labels__ of direct and child group members. | `var groupAllLabels = getAllMembersLabels(group);`
getAllMembersLabelsStrings | This function returns the __labels__ of direct and child group members as a concatenated string. | `var groupAllLabelsString = getAllMembersLabelsString(group);`

### __Arithmetic operations__
Perform arithmetic operations on the numeric states of group members. 
This functionality is the same as in the openHAB [group item definition](https://www.openhab.org/docs/configuration/items.html#derive-group-state-from-member-items).
The following functions only use Items of type: Number, Dimmer or Rollershutter.
Members of other types or with NULL or UNDEF states are ignored, therefore they are excluded from all math functions.

Function | Purpose | Example
-|-|-
membersSum | Get the __SUM__ of direct members' number states. | `var sum = membersSum(group);`
membersAvg | Get the __AVERAGE__ of direct members' number states. | `var avg = membersAvg(group);`
membersMin | Get the __MINIMUM__ of direct members' number states. | `var min = membersMin(group);`
membersMax | Get the __MAXIMUM__ of direct members' number states. | `var max = membersMax(group);`
allMembersSum | Get the __SUM__ of all (also child) members' number states. | `var sum = allMembersSum(group);`
allMembersAvg | Get the __AVERAGE__ of all (also child) members' number states. | `var avg = allMembersAvg(group);`
allMembersMin | Get the __MINIMUM__ of all (also child) members' number states. | `var min = allMembersMin(group);`
allMembersMax | Get the __MAXIMUM__ of all (also child) members' number states. | `var max = allMembersMax(group);`

### __Count operations__

#### countMembers
Count the direct members matching a given comparison function. 
Comparison is done through a user-passed function.
The function returns how many members match the given comparison function.

```javascript
var counter = countMembers(group, compareFunc);
// with the following example scheme:
var counter = countMembers(group, function (i) { return i.getState() /* comparison operators */; });

// examples
var lightsOFF = countMembers('lights', function (i) { return i.getState() == OFF; }); // the number of lights off
var larg24 = countMembers('temperatures', function (i) { return i.getState() > 24; }; // the number of temperatures higher than 24
var smalEq24 = countMembers('temperatures', function (i) { return i.getState() <= 24; }); // the number of temperatures lower or equal than/to 24
```
Argument | Purpose | Required
-|-|-
`group` | The name of the group. | yes
`compareFunc` | The comparison function which must accept at least one argument, an Item Object, and returns a boolean. | yes

#### countAllMembers
Count direct and child group members matching a given comparison function.
The group items are excluded.
The function returns how many members match the given comparison function.

```javascript
var counter = countAllMembers(group, compareFunc);
// with the following example scheme:
var counter = countAllMembers(group, function (i) { return i.getState() /* comparison operators */; });
```
The arguments are exactly the same as for [countMembers](#countmembers).
The examples work in the same way as for [countMembers](#countmembers).

## Jython
Currently, there is no Jython version of this library.