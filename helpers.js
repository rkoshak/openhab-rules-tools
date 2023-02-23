const { actions, time, utils } = require('openhab');
const VERSION = require('./package.json').version;

/**
 * Utility function to create a named timer.
 *
 * The name can be set with the name parameter or is autogenerated from the ruleUID (for UI) or filename and the timer's key (if available).
 *
 * @param {*} when any representation of time or duration, see {@link https://openhab.github.io/openhab-js/time.html#.toZDT time.toZDT}
 * @param {function} func function to call when the timer expires
 * @param {string} [name] name for the timer
 * @param {string} [key] key of the timer to append to the generated name
 * @returns openHAB Java {@link https://www.openhab.org/javadoc/latest/org/openhab/core/model/script/actions/timer Timer}
 */
const createTimer = (when, func, name, key) => {
  const timeout = time.toZDT(when);
  if (name === null || name === undefined) {
    if (global.ruleUID !== undefined) { // Use UI ruleUID and key if available
      name = 'ui.' + global.ruleUID + ((key !== undefined) ? '.' + key : '');
    } else if (global['javax.script.filename'] !== undefined) { // Use filename and key if available
      name = 'file.' + global['javax.script.filename'].replace(/^.*[\\/]/, '') + ((key !== undefined) ? '.' + key : '');
    }
  }
  return actions.ScriptExecution.createTimer(name, timeout, func);
};

/**
 * Utility function mostly used by rule templates to check the metadata and Group membership
 * of the Items that drive a rule like Debounce or Time Based State Machine. An Item metadata
 * namespace and Group is passed along with a function and usage text.
 *
 * The function validates that all Items that have the given namespace are members of grp,
 * no members of grp lack the namespace metadata, and the validateFunc is called to validate
 * the metadata on each individual Item. validateFunc should throw an exception with the
 * reason why the Item failed validation when it fails. The usage text will be logged if one
 * or more Items fail validations.
 *
 * @param {string} namespace the Item metadata namespace to check
 * @param {string} grp name of the Group Item all the Items with namespace should belong to
 * @param {function} validateFunc function called to validate the metadata is valid
 * @param {string} usage text to log out when an Item fails validation
 * @returns {boolean} true if validation passes, false if there's a problem
 **/
const checkGrpAndMetadata = (namespace, grp, validateFunc, usage) => {
  let isGood = true;
  let badItems = [];

  // Get all the Item with NAMESPACE metadata
  const allItems = items.getItems();
  const filtered = allItems.filter(item => item.getMetadata(namespace));

  // Check the metadata of members of the Group membership
  filtered.forEach(item => {
    try {
      const cfg = validateFunc(item.name);
      if (!item.groupNames.includes(grp)) {
        console.warn(item.name + ' has ' + namespace + ' metadata but is not a member of ' + grp + '!');
        isGood = false;
        badItems.push(item.name);
      }
    }
    catch (e) {
      console.warn('Item ' + item.name + "'s configuration is invalid:\n" + e);
      isGood = false;
      badItems.push(item.name);
    }
  });

  // Check Group membership
  if (!items[grp]) {
    console.warn('There is no ' + grp + ' Group!');
    isGood = false;
  }
  else if (!items[grp].members) {
    console.warn(grp + ' does not have any members!');
    isGood = false;
  }
  else {
    items[grp].members.filter(item => { !item.getMetadata(namespace) }).forEach(item => {
      console.warn(item.name + ' is a member of ' + grp + ' but lacks ' + namespace + ' metadata!');
      isGood = false;
      badItems.push(item.name);
    });
  }

  // Report the bad Items and print usage info
  if (isGood) {
    console.info('All ' + namespace + ' Items are configured correctly');
  }
  else {
    if (badItems.length) console.warn('The following Items have an invalid configuration: ' + badItems + '\n');
    console.warn(usage);
  }
  return isGood;
};

/**
 * Validates that the passed in version number is of the format X.Y.Z where
 * X, Y, and Z are numbers.
 *
 * @param {string} version a version string to validate
 * @returns {boolean} true if valid, false otherwise
 */
const _validateVersionNum = (version) => {
  const re = /\d+\.\d+\.\d+/;
  if (version === null || version === undefined || !(typeof version === 'string')) return false;
  return re.test(version);
};

/**
 * Compare version numbers of the format X.Y.Z.
 *
 * @param {string} v1 the first version number
 * @param {string} v2 the second version number
 * @throws error if v1 or v2 are not parsable
 * @returns {-1|0|1} 0 if the versions are equal, -1 if v1 is lower and 1 if v1 is higher
 */
const compareVersions = (v1, v2) => {
  if (!_validateVersionNum(v1)) throw v1 + ' is not a valid version number in the format X.Y.Z where X, Y, and Z are numbers!';
  if (!_validateVersionNum(v2)) throw v2 + ' is not a valid version number in the format X.Y.Z where X, Y, and Z are numbers!';

  const v1Version = Number.parseFloat(v1);
  const v1Point = Number.parseInt(v1.split('.')[2]);
  const v2Version = Number.parseFloat(v2);
  const v2Point = Number.parseFloat(v2.split('.')[2]);

  if (v1 == v2) return 0;
  else if (v1Version > v2Version) return 1;
  else if (v1Version == v2Version && v1Point > v2Point) return 1;
  else return -1;
};

/**
 * Checks to see if the minimum versions of openhab-js and openhab_rules_tools
 * are met.
 *
 * @throws error if one or more of the version numbers are malformed
 * @throws error if one or more of the versions are too old
 */
const validateLibraries = (minOHJS, minOHRT) => {
  if (compareVersions(utils.OPENHAB_JS_VERSION, minOHJS) < 0)
    throw 'Minimum library version not met: openhab-js '
    + utils.OPENHAB_JS_VERSION + ' installed, ' + minOHJS + ' required';
  if (compareVersions(VERSION, minOHRT) < 0)
    throw 'Minimum library version not met: openhab_rules_tools '
    + VERSION + ' installed, ' + minOHRT + ' required';
};

module.exports = {
  createTimer,
  checkGrpAndMetadata,
  compareVersions,
  validateLibraries,
  OHRT_VERSION: VERSION
};
