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
   * Get the direct members' labels of a group as a concatenated string.
   *
   * @param {string} group Name of the openHAB group
   * @returns {string} Concatenated labels of direct members
   */
  context.getMembersLabelsString = function (group) {
    logger.debug('Getting direct members of group ' + group)
    return context.itemRegistry.getItem(group)
      .getMembers()
      .stream()
      .map(function (i) {
        return i.getLabel()
      })
      .collect(Collectors.joining(', '))
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
   * Get all (also childs) members' labels of a group as a concatenated string.
   *
   * @param {string} group Name of the openHAB group
   * @returns {string} Concatenated labels of direct members
   */
  context.getAllMembersLabelsString = function (group) {
    logger.debug('Getting all members of group ' + group)
    return context.itemRegistry.getItem(group)
      .getAllMembers()
      .stream()
      .map(function (i) {
        return i.getLabel()
      })
      .collect(Collectors.joining(', '))
  }

  /**
   * Private function to get numeric states of direct members of a group.
   * This function only uses Items of type: Number, Dimmer, Rollershutter.
   * Units of measurement are ignored.
   *
   * @param {string} group  Name of the openHAB group
   * @returns {*} Statistics for Java Collectors.summarizingDouble()
   */
  function getMembersNumeric (group) {
    return context.itemRegistry.getItem(group)
      .getMembers()
      .stream()
      .filter(function (i) {
        // Log: Check for Item of type: Number, Dimmer or Rollershutter
        if (!((i.getType() === 'Number') || (i.getType() === 'Dimmer') || (i.getType() === 'Rollershutter'))) {
          logger.debug(i.getName() + ' ignored, no supported type: ' + i.getType())
        }
        // Log: Check for UnDefType (NULL or UNDEF)
        if (items[i.getName()].class === UnDefType.class) {
          logger.debug(i.getName() + ' ignored, state is UNDEF or NULL.')
        }
        return (
          // Check for Item of type: Number, Dimmer or Rollershutter
          ((i.getType() === 'Number') || (i.getType() === 'Dimmer') || (i.getType() === 'Rollershutter')) &&
          // Check for UnDefType (NULL or UNDEF)
          (!(items[i.getName()].class === UnDefType.class))
        )
      })
      .collect(Collectors.summarizingDouble(function (i) {
        return parseFloat(i.getState())
      }))
  }

  /**
   * Get the sum of direct members' number states.
   *
   * @param {string} group Name of the openHAB group
   * @returns {number} Sum of direct members number states
   */
  context.MembersSum = function (group) {
    return getMembersNumeric(group).getSum()
  }

  /**
   * Get the average of direct members' number states.
   *
   * @param {string} group Name of the openHAB group
   * @returns {number} Average of direct members number states
   */
  context.MembersAvg = function (group) {
    return getMembersNumeric(group).getAverage()
  }

  /**
   * Get the minimum of direct members' number states.
   *
   * @param {string} group Name of the openHAB group
   * @returns {number} Minimum of direct members number states
   */
  context.MembersMin = function (group) {
    return getMembersNumeric(group).getMin()
  }

  /**
   * Get the maximum of direct members' number states.
   *
   * @param {string} group Name of the openHAB group
   * @returns {number} Maximum of direct members number states
   */
  context.MembersMax = function (group) {
    return getMembersNumeric(group).getMax()
  }

  /**
   * Private function to get numeric states of all (also child) members of a group.
   * This function only uses Items of type: Number, Dimmer, Rollershutter.
   * Units of measurement are ignored.
   *
   * @param {string} group  Name of the openHAB group
   * @returns {*} Statistics for Java Collectors.summarizingDouble()
   */
  function getAllMembersNumeric (group) {
    return context.itemRegistry.getItem(group)
      .getAllMembers()
      .stream()
      .filter(function (i) {
        // Log: Check for Item of type: Number, Dimmer or Rollershutter
        if (!((i.getType() === 'Number') || (i.getType() === 'Dimmer') || (i.getType() === 'Rollershutter'))) {
          logger.debug(i.getName() + ' ignored, no supported type: ' + i.getType())
        }
        // Log: Check for UnDefType (NULL or UNDEF)
        if (items[i.getName()].class === UnDefType.class) {
          logger.debug(i.getName() + ' ignored, state is UNDEF or NULL.')
        }
        return (
          // Check for Item of type: Number, Dimmer or Rollershutter
          ((i.getType() === 'Number') || (i.getType() === 'Dimmer') || (i.getType() === 'Rollershutter')) &&
          // Check for UnDefType (NULL or UNDEF)
          (!(items[i.getName()].class === UnDefType.class))
        )
      })
      .collect(Collectors.summarizingDouble(function (i) {
        return parseFloat(i.getState())
      }))
  }

  /**
   * Get the sum of all (also child) members' number states.
   *
   * @param {string} group Name of the openHAB group
   * @returns {number} Sum of all (also child) members number states
   */
  context.allMembersSum = function (group) {
    return getAllMembersNumeric(group).getSum()
  }

  /**
   * Get the average of all (also child) members' number states.
   *
   * @param {string} group Name of the openHAB group
   * @returns {number} Average of all (also child) members number states
   */
  context.allMembersAvg = function (group) {
    return getAllMembersNumeric(group).getAverage()
  }

  /**
   * Get the minimum of all (also child) members' number states.
   *
   * @param {string} group Name of the openHAB group
   * @returns {number} Minimum of all (also child) members number states
   */
  context.allMembersMin = function (group) {
    return getAllMembersNumeric(group).getMin()
  }

  /**
   * Get the maximum of all (also child) members' number states.
   *
   * @param {string} group Name of the openHAB group
   * @returns {number} Maximum of all (also child) members number states
   */
  context.allMembersMax = function (group) {
    return getAllMembersNumeric(group).getMax()
  }

  /**
   * Count the number of direct members' states matching the given comparison function.
   *
   * @param {string} group Name of the openHAB group
   * @param {string} compareFunc Comparison function, example: function (i) { return i.getState() == ON }
   * @returns {number} States matching the given comparison function
   */
  context.countMembers = function (group, compareFunc) {
    return context.itemRegistry.getItem(group)
      .getMembers()
      .stream()
      .filter(compareFunc)
      .collect(Collectors.counting())
  }

  /**
   * Count the number of all (also child) members' states matching the given comparison function.
   *
   * @param {string} group Name of the openHAB group
   * @param {string} compareFunc Comparison function, example: function (i) { return i.getState() == ON }
   * @returns {number} States matching the given comparison function
   */
  context.countAllMembers = function (group, compareFunc) {
    return context.itemRegistry.getItem(group)
      .getAllMembers()
      .stream()
      .filter(compareFunc)
      .collect(Collectors.counting())
  }
})(this)
