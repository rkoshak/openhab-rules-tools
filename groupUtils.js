/**Credit goes to Florian Hotze for the initial idea previously submitted 
 * to openhab_rules_tools. However, with the changes to JSScripting and
 * ECMAScript 11, a complete rewrite was warranted including some 
 * simplification and generalization.
 * 
 * The original is still available in the before-npm branch for reference.
 */

/**
 * Utility that will return the passed in Group's members mapped with the
 * passed in mapping function. An example mapping funciton would be:
 * 
 *     i => i.name
 * 
 * which will return an array of the member's names. Supports an optional
 * filterFunc to filter the members before generating the mapped list. A
 * filter looks something like
 * 
 *     i => !i.isUninitialized
 * @param {string} groupName
 * @param {function(i)} mapFunc function called to map the Item
 * @param {function(i)} filterFunc optional filtering function
 * @returns {Array} the filtered Items with the mapping function applies
 */
 const membersToMappedList = (groupName, mapFunc, filterFunc) => {
  if(!filterFunc) filterFunc = i => i;
  return items.getItem(groupName).members.filter(filterFunc).map(mapFunc);
}

/**
 * Same as membersToMappingList except it works on descendents of the Group.
 * @param {string} groupName 
 * @param {function(i)} mapFunc 
 * @param {function(i)} filterFunc
 * @returns {Array} 
 */
const descendentsToMappedList = (groupName, mapFunc, filterFunc) => {
  if(!filterFunc) filterFunc = i => i;
  return items.getItem(groupName).descendents.filter(filterFunc).map(mapFunc);
}

/**
 * Calls membersToMappedList and joins the result into a separator
 * separated string.
 * @param {string} groupName
 * @param {string} separator string to separate the list in the resultant string
 * @param {function(i)} mapFunc
 * @param {function(i)} filterFunc
 * @returns {string} the mapped values concetanted to a single string
 */
const membersToString = (groupName, separator, mapFunc, filterFunc) => {
  return membersToMappedList(groupName, mapFunc, filterFunc).join(separator);
}

/**
 * Same as membersToString except it operates on the Group's descendents.
 * @param {string} groupName
 * @param {string} separator
 * @param {function(i)} mapFunc
 * @param {function(i)} filterFunc
 * @returns {string}
 */
const descendentsToString = (groupName, separator, mapFunc, filterFunc) => {
  return descendentsToMappedList(groupName, mapFunc, filterFunc).join(separator);
}

/**
 * Optionally, filters the members of the group, maps the Items to rawState,
 * and applies the reduce function. The function should take two values, 
 * a total and a value. It would look something like this for a sum.
 * 
 *     (total, value) => total += value
 * 
 * @param {string} groupName 
 * @param {function(i)} reduceFunc 
 * @param {function(i)} filterFunc
 * @returns A single reduced value calculated from all members of the group
 */
const reduceMemberStates = (groupName, reduceFunc, filterFunc) => {
  return membersToMappedList(groupName, (m) => m.rawState, filterFunc)
           .reduce(reduceFunc, null);
}

/**
 * Same as reduceMemberStates except it does it for all descendents.
 * @param {string} groupName 
 * @param {function(i)} reduceFunc 
 * @param {function(i)} filterFunc
 * @returns A single reduced value calculated from all members of the group
 */
const reduceDecendentStates = (groupName, reduceFunc, filterFunc) => {
  return descendentsToMappedList(groupName, (m) => m.rawState, filterFunc)
           .reduce(reduceFunc, null);
}

/**
 * Tests to see if i is an Item with a numeric state.
 * @param {*} i 
 * @returns {boolean} true if i's rawState has a floatValue function
 */
const isNumber = (i) => {
  return i.rawState.floatValue;
}

/**
 * Sums the states of the passed in list of Items. Items with a non-numeric
 * state are ignored.
 * @param {Array<item>} list
 * @returns {float} sum of the Items with numeric states.
 */
const sumList = (list) => {
  return list.filter(isNumber)
             .map(i => i.rawState.floatValue())
             .reduce((total, value) => total += value);
}

/**
 * Averages the states of the passed in list of Items. Items with a non-numeric
 * state are completely ignored and not considered part of the calculation.
 * @param {Array<item>} list
 * @returns {float} average of the Item's with numberic states.
 */
const avgList = (list) => {
  const filtered = list.filter(isNumber);
  const sum = sumList(list);
  return sum / filtered.length;
}

/**
 * @param {Array<item>} list 
 * @returns {num} Minimum value of the Items with numeric states. 
 */
const minList = (list) => {
  return list.filter(isNumber)
             .map(i => i.rawState.floatValue())
             .reduce((total, value) => (total < value) ? total : value);
}

/**
 * @param {Array<item>} list
 * @returns {num} Maxiumum value of the Items with numeric states.
 */
const maxList = (list) => {
  return list.filter(isNumber)
             .map(i => i.rawState.floatValue())
             .reduce((total, value) => (total > value) ? total : value);
}

/**
 * @param {Array<item>} list
 * @returns {num} the count of the Items that match the filterFunc
 */
const countList = (list, filterFunc) => {
  return list.filter(filterFunc).length;
}

module.exports = {
  membersToMappedList,
  descendentsToMappedList,
  membersToString,
  descendentsToString,
  reduceMemberStates,
  reduceDecendentStates,
  sumList,
  avgList,
  minList,
  maxList,
  countList
}