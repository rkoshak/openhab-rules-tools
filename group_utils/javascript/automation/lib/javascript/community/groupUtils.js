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
   * Private function to get the direct members of a group.
   *
   * @param {string} group Name of the openHAB group
   * @param {string} characteristic Which characteristic of the members you get, valid: name (default), label, state
   * @returns {Array} Given characteristic of direct members
   */
  function getMembers (group, characteristic) {
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
   * Get the direct members' names of a group.
   *
   * @param {string} group Name of the openHAB group
   * @returns {Array} Names of direct members
   */
  context.getMembersNames = function (group) {
    return getMembers(group, 'name')
  }

  /**
   * Get the direct members' states of a group.
   *
   * @param {string} group Name of the openHAB group
   * @returns {Array} States of direct members
   */
  context.getMembersStates = function (group) {
    return getMembers(group, 'state')
  }

  /**
   * Get the direct members' labels of a group.
   *
   * @param {string} group Name of the openHAB group
   * @returns {Array} Labels of direct members
   */
  context.getMembersLabels = function (group) {
    return getMembers(group, 'label')
  }

  /**
   * Private function to get all (also childs) members of a group.
   *
   * @param {string} group Name of the openHAB group
   * @param {string} characteristic Which characteristic of the members you get, valid: name (default), label, state
   * @returns {Array} Given characteristic of all members
   */
  function getAllMembers (group, characteristic) {
    logger.debug('Getting all members of group ' + group)
    var groupAllMembers = context.itemRegistry.getItem(group) // an Java ArrayList
      .getAllMembers()
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
   * Get all (also childs) members' names of a group.
   *
   * @param {string} group Name of the openHAB group
   * @returns {Array} Names of all members
   */
  context.getAllMembersNames = function (group) {
    return getAllMembers(group, 'name')
  }

  /**
   * Get all (also childs) members' states of a group.
   *
   * @param {string} group Name of the openHAB group
   * @returns {Array} States of all members
   */
  context.getAllMembersStates = function (group) {
    return getAllMembers(group, 'state')
  }

  /**
   * Get all (also childs) members' labels of a group.
   *
   * @param {string} group Name of the openHAB group
   * @returns {Array} Labels of all members
   */
  context.getAllMembersLabels = function (group) {
    return getAllMembers(group, 'label')
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
