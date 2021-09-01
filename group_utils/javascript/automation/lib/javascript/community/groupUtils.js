/**
 * Utilities for working with openHAB groups in JavaScript.
 * This code is not compatible with the GraalVM JavaScript add-on.
 *
 * Copyright (c) 2021 Florian Hotze under MIT License
 * @florian-h05(https://github.com/florian-h05)
 */

(function (context) {
  /**
   * Imports.
   */
  var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.model.script.Rules.GroupUtils')
  var Collectors = Java.type('java.util.stream.Collectors')

  /**
   * Get the direct members of a group.
   *
   * @param {*} group Name of the openHAB group
   * @param {*} characteristic Which characteristic of the members you get, valid: name (default), label, state
   */
  context.getMembers = function (group, characteristic) {
    logger.debug('Getting direct members of group ' + group)
    var groupMembers = context.itemRegistry.getItem(group) // an Java ArrayList
      .getMembers()
      .stream()
      .map(function (i) {
        if (characteristic === 'label') {
          return i.getLabel()
        } else if (characteristic === 'state') {
          return i.getState()
        } else {
          return i.getName()
        }
      })
      .collect(Collectors.toList())
    return Java.from(groupMembers) // convert to JavaScript Array
  }

  /**
   * Get all (also childs) members of a group.
   *
   * @param {*} group Name of the openHAB group
   * @param {*} characteristic Which characteristic of the members you get, valid: name (default), label, state
   */
  context.getAllMembers = function (group, characteristic) {
    logger.debug('Getting all members of group ' + group)
    var groupAllMembers = context.itemRegistry.getItem(group) // an Java ArrayList
      .getMembers()
      .stream()
      .map(function (i) {
        if (characteristic === 'label') {
          return i.getLabel()
        } else if (characteristic === 'state') {
          return i.getState()
        } else {
          return i.getName()
        }
      })
      .collect(Collectors.toList())
    return Java.from(groupAllMembers) // convert to JavaScript Array
  }

  /**
   * Perform arithmetic operations on an given array of states.
   *
   * @param {*} items Array of states
   * @param {*} func Arithmetic function to perform, valid: SUM, AVG, MIN, MAX
   */
  context.arithmetic = function (items, func) {
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
   * Returns the number of states matching the given operator and target.
   *
   * @param {*} items Array of states
   * @param {*} op Operator, valid: equal, notEqual, larger, largerEqual, smaller, smallerEqual
   * @param {*} comp State to compare with
   */
  context.count = function (items, op, comp) {
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
})(this)
