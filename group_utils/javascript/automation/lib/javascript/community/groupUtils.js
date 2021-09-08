/**
 * Utilities for working with openHAB groups in JavaScript.
 * This code is not compatible with the GraalVM JavaScript add-on.
 */

/**
Copyright September 8, 2021 Florian Hotze

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

(function (context) {
  /**
   * Imports.
   */
  var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.model.script.Rules.GroupUtils');
  var Collectors = Java.type('java.util.stream.Collectors');

  /**
   * Private function to get the direct members of a group.
   *
   * @param {string} group Name of the openHAB group
   * @param {string} characteristic Which characteristic of the members you get, valid: name (default), label, state
   * @returns {Array} Given characteristic of direct members
   */
  function _getMembers (group, characteristic) {
    logger.debug('Getting direct members of group ' + group);
    var groupMembers = context.itemRegistry.getItem(group) // an Java ArrayList
      .getMembers()
      .stream()
      .map(function (i) {
        if (characteristic === 'label') {
          return i.getLabel();
        } else if (characteristic === 'state') {
          return i.getState();
        } else {
          return i.getName();
        }
      })
      .collect(Collectors.toList());
    return Java.from(groupMembers); // convert to JavaScript Array
  }

  /*
  Get something from members
  */

  /**
   * Get the direct members' names of a group.
   *
   * @param {string} group Name of the openHAB group
   * @returns {Array} Names of direct members
   */
  context.getMembersNames = function (group) {
    return _getMembers(group, 'name');
  }

  /**
   * Get the direct members' states of a group.
   *
   * @param {string} group Name of the openHAB group
   * @returns {Array} States of direct members
   */
  context.getMembersStates = function (group) {
    return _getMembers(group, 'state');
  }

  /**
   * Get the direct members' labels of a group.
   *
   * @param {string} group Name of the openHAB group
   * @returns {Array} Labels of direct members
   */
  context.getMembersLabels = function (group) {
    return _getMembers(group, 'label');
  }

  /**
   * Get the direct members' labels of a group as a concatenated string.
   *
   * @param {string} group Name of the openHAB group
   * @returns {string} Concatenated labels of direct members
   */
  context.getMembersLabelsString = function (group) {
    logger.debug('Getting direct members of group ' + group);
    return context.itemRegistry.getItem(group)
      .getMembers()
      .stream()
      .map(function (i) {
        return i.getLabel();
      })
      .collect(Collectors.joining(', '));
  }

  /**
   * Private function to get all (also childs) members of a group.
   *
   * @param {string} group Name of the openHAB group
   * @param {string} characteristic Which characteristic of the members you get, valid: name (default), label, state
   * @returns {Array} Given characteristic of all members
   */
  function _getAllMembers (group, characteristic) {
    logger.debug('Getting all members of group ' + group);
    var groupAllMembers = context.itemRegistry.getItem(group) // an Java ArrayList
      .getAllMembers()
      .stream()
      .map(function (i) {
        if (characteristic === 'label') {
          return i.getLabel();
        } else if (characteristic === 'state') {
          return i.getState();
        } else {
          return i.getName();
        }
      })
      .collect(Collectors.toList());
    return Java.from(groupAllMembers); // convert to JavaScript Array
  }

  /**
   * Get all (also childs) members' names of a group.
   *
   * @param {string} group Name of the openHAB group
   * @returns {Array} Names of all members
   */
  context.getAllMembersNames = function (group) {
    return _getAllMembers(group, 'name');
  }

  /**
   * Get all (also childs) members' states of a group.
   *
   * @param {string} group Name of the openHAB group
   * @returns {Array} States of all members
   */
  context.getAllMembersStates = function (group) {
    return _getAllMembers(group, 'state');
  }

  /**
   * Get all (also childs) members' labels of a group.
   *
   * @param {string} group Name of the openHAB group
   * @returns {Array} Labels of all members
   */
  context.getAllMembersLabels = function (group) {
    return _getAllMembers(group, 'label');
  }

  /**
   * Get all (also childs) members' labels of a group as a concatenated string.
   *
   * @param {string} group Name of the openHAB group
   * @returns {string} Concatenated labels of direct members
   */
  context.getAllMembersLabelsString = function (group) {
    logger.debug('Getting all members of group ' + group);
    return context.itemRegistry.getItem(group)
      .getAllMembers()
      .stream()
      .map(function (i) {
        return i.getLabel();
      })
      .collect(Collectors.joining(', '));
  }

  /*
  Math/arithmetic operations
  */

  /**
   * Private function to get numeric states of direct members of a group.
   * This function only uses Items of type: Number, Dimmer, Rollershutter.
   * Units of measurement are ignored.
   *
   * @param {string} group  Name of the openHAB group
   * @returns {*} Statistics for Java Collectors.summarizingDouble()
   */
  function _getMembersNumeric (group) {
    return context.itemRegistry.getItem(group)
      .getMembers()
      .stream()
      .filter(function (i) {
        // Log: Check for Item of type: Number, Dimmer or Rollershutter
        if (!((i.getType() === 'Number') || (i.getType() === 'Dimmer') || (i.getType() === 'Rollershutter'))) {
          logger.debug(i.getName() + ' ignored, no supported type: ' + i.getType());
        }
        // Log: Check for UnDefType (NULL or UNDEF)
        if (items[i.getName()].class === UnDefType.class) {
          logger.debug(i.getName() + ' ignored, state is UNDEF or NULL.');
        }
        return (
          // Check for Item of type: Number, Dimmer or Rollershutter
          ((i.getType() === 'Number') || (i.getType() === 'Dimmer') || (i.getType() === 'Rollershutter')) &&
          // Check for UnDefType (NULL or UNDEF)
          (!(items[i.getName()].class === UnDefType.class))
        )
      })
      .collect(Collectors.summarizingDouble(function (i) {
        return parseFloat(i.getState());
      }));
  }

  /**
   * Get the sum of direct members' number states.
   *
   * @param {string} group Name of the openHAB group
   * @returns {number} Sum of direct members number states
   */
  context.membersSum = function (group) {
    return _getMembersNumeric(group).getSum();
  }

  /**
   * Get the average of direct members' number states.
   *
   * @param {string} group Name of the openHAB group
   * @returns {number} Average of direct members number states
   */
  context.membersAvg = function (group) {
    return _getMembersNumeric(group).getAverage();
  }

  /**
   * Get the minimum of direct members' number states.
   *
   * @param {string} group Name of the openHAB group
   * @returns {number} Minimum of direct members number states
   */
  context.membersMin = function (group) {
    return _getMembersNumeric(group).getMin();
  }

  /**
   * Get the maximum of direct members' number states.
   *
   * @param {string} group Name of the openHAB group
   * @returns {number} Maximum of direct members number states
   */
  context.membersMax = function (group) {
    return _getMembersNumeric(group).getMax();
  }

  /**
   * Private function to get numeric states of all (also child) members of a group.
   * This function only uses Items of type: Number, Dimmer, Rollershutter.
   * Units of measurement are ignored.
   *
   * @param {string} group  Name of the openHAB group
   * @returns {*} Statistics for Java Collectors.summarizingDouble()
   */
  function _getAllMembersNumeric (group) {
    return context.itemRegistry.getItem(group)
      .getAllMembers()
      .stream()
      .filter(function (i) {
        // Log: Check for Item of type: Number, Dimmer or Rollershutter
        if (!((i.getType() === 'Number') || (i.getType() === 'Dimmer') || (i.getType() === 'Rollershutter'))) {
          logger.debug(i.getName() + ' ignored, no supported type: ' + i.getType());
        }
        // Log: Check for UnDefType (NULL or UNDEF)
        if (items[i.getName()].class === UnDefType.class) {
          logger.debug(i.getName() + ' ignored, state is UNDEF or NULL.');
        }
        return (
          // Check for Item of type: Number, Dimmer or Rollershutter
          ((i.getType() === 'Number') || (i.getType() === 'Dimmer') || (i.getType() === 'Rollershutter')) &&
          // Check for UnDefType (NULL or UNDEF)
          (!(items[i.getName()].class === UnDefType.class))
        )
      })
      .collect(Collectors.summarizingDouble(function (i) {
        return parseFloat(i.getState());
      }));
  }

  /**
   * Get the sum of all (also child) members' number states.
   *
   * @param {string} group Name of the openHAB group
   * @returns {number} Sum of all (also child) members number states
   */
  context.allMembersSum = function (group) {
    return _getAllMembersNumeric(group).getSum();
  }

  /**
   * Get the average of all (also child) members' number states.
   *
   * @param {string} group Name of the openHAB group
   * @returns {number} Average of all (also child) members number states
   */
  context.allMembersAvg = function (group) {
    return _getAllMembersNumeric(group).getAverage();
  }

  /**
   * Get the minimum of all (also child) members' number states.
   *
   * @param {string} group Name of the openHAB group
   * @returns {number} Minimum of all (also child) members number states
   */
  context.allMembersMin = function (group) {
    return _getAllMembersNumeric(group).getMin();
  }

  /**
   * Get the maximum of all (also child) members' number states.
   *
   * @param {string} group Name of the openHAB group
   * @returns {number} Maximum of all (also child) members number states
   */
  context.allMembersMax = function (group) {
    return _getAllMembersNumeric(group).getMax();
  }

  /*
  Count operations
  */

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
      .collect(Collectors.counting());
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
      .collect(Collectors.counting());
  }
})(this)
