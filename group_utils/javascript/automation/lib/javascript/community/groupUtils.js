/**
 * Utilities for working with openHAB groups in JavaScript.
 * This code is not compatible with the GraalVM JavaScript add-on.
 *
 * Tested to work with openHAB 3.1.0 stable.
 * Copyright (c) 2021 Florian Hotze under MIT License
 * @florian-h05(https://github.com/florian-h05)
 */

/**
 * Constructor, initializes the logger.
 */
var GroupUtils = function () {
  this.log = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.model.script.Rules.GroupUtils')
  this.log.debug('Building groupUtils instance.')
}

/**
 * Get the direct members of a group.
 *
 * @param {*} group Name of the openHAB group
 * @param {*} characteristic Which characteristic of the members you get, valid: name (default), label, state
 */
GroupUtils.prototype.getMembers = function (group, characteristic) {
  this.log.debug('Getting direct members of group ' + group)
  var groupMembers = Array()
  itemRegistry.getItem(group).getMembers().stream().forEach(function (item) {
    if (characteristic === 'label') {
      groupMembers.push(item.getLabel())
    } else if (characteristic === 'state') {
      groupMembers.push(item.getState())
    } else {
      groupMembers.push(item.getName())
    }
  })
  // return the array
  return groupMembers
}

/**
 * Get all (also childs) members of a group, the group items are excluded from this list.
 *
 * @param {*} group Name of the openHAB group
 * @param {*} characteristic Which characteristic of the members you get, valid: name (default), label, state
 */
GroupUtils.prototype.getAllMembers = function (group, characteristic) {
  this.log.debug('Getting all members of group ' + group)
  var groupAllMembers = Array()
  itemRegistry.getItem(group).getAllMembers().stream().forEach(function (item) {
    if (characteristic === 'label') {
      groupAllMembers.push(item.getLabel())
    } else if (characteristic === 'state') {
      groupAllMembers.push(item.getState())
    } else {
      groupAllMembers.push(item.getName())
    }
  })
  // return the array
  return groupAllMembers
}

/**
 * Perform arithmetic operations on multiple states.
 *
 * @param {*} items Array of states
 * @param {*} func Arithmetic function to perform, valid: SUM, AVG, MIN, MAX
 */
GroupUtils.prototype.arithmetic = function (items, func) {
  if (func === 'SUM') {
    var sum = items[0]
    for (var i = 1; i < items.length; i++) {
      sum += items[i]
    }
    return sum
  } else if (func === 'AVG') {
    var sum = items[0]
    for (var i = 1; i < items.length; i++) {
      sum += items[i]
    }
    var avg = sum / items.length
    return avg
  } else if (func === 'MIN') {
    var min = items[0]
    for (var i = 1; i < items.length; ++i) {
      if (items[i] < min) {
        min = items[i]
      }
    }
    return min
  } else if (func === 'MAX') {
    var max = items[0]
    for (var i = 1; i < items.length; ++i) {
      if (items[i] > max) {
        max = items[i]
      }
    }
    return max
  }
}

/**
 * Returns the number of states matching the given comparison expression.
 *
 * @param {*} items Array of states
 * @param {*} op Comparison operator, valid: equal, notEqual, larger, largerEqual, smaller, smallerEqual
 * @param {*} comp State to compare with
 */
GroupUtils.prototype.count = function (items, op, comp) {
  var counter = 0
  for (var i = 0; i < items.length; ++i) {
    if (op === 'equal') {
      if (items[i] == comp) {
        ++counter
      }
    } else if (op === 'notEqual') {
      if (items[i] != comp) {
        ++counter
      }
    } else if (op === 'larger') {
      if (items[i] > comp) {
        ++counter
      }
    } else if (op === 'largerEqual') {
      if (items[i] >= comp) {
        ++counter
      }
    } else if (op === 'smaller') {
      if (items[i] < comp) {
        ++counter
      }
    } else if (op === 'smallerEqual') {
      if (items[i] <= comp) {
        ++counter
      }
    }
  }
  return counter
}
