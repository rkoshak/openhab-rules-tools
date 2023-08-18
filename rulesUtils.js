const RuleManager = osgi.getService('org.openhab.core.automation.RuleManager');
const ruleRegistry = osgi.getService('org.openhab.core.automation.RuleRegistry');
const { itemRegistry } = require('@runtime');

/**
 * Generates an Array of Item triggers for each Item in the list.
 * @param {Array<Item>} list list of Items to generate triggers for
 * @param {triggers.ItemChangedTrigger|triggers.ItemStateUpdateTrigger|triggers.ItemStateUpdateTrigger} trigger type of trigger to generate for each Item in the list
 * @param {int} systemStarted optional, when provided adds a system runlevel trigger. Valid values are 40, 50, 60, 70, 80, 90, or 100.
 * @returns {Array<triggers>} the generated rule triggers
 */
const generateTriggers = (list, trigger, systemStarted) => {
  let triggers = [];
  list.forEach(i => {
    triggers.push(trigger(i.name));
  });
  if(systemStarted && systemStarted >= 40) triggers.push(triggers.SystemStartLevelTrigger(systemStarted));
  return triggers;
}

/**
 * Checks to see if the rule exists
 * Only works for rules defined in the same file so it's utility is suspect
 * @param {String} uid UID for the rule to look for
 * @returns {Boolean} true when the rule exists
 */
const ruleExists = (uid) => {
  return !(RuleManager.getStatusInfo(uid) == null);
}

/**
 * DEPRECATED
 *
 * Deletes the rule if it exists. Does not work in UI rules.
 * @param {String} uid UID for the rule to remove
 */
const removeRule = (uid) => {
  console.warn('rulesUtils.removeRule() is deprecated, use rules.removeRule() instead.');
  if(ruleExists(uid)) {
    ruleRegistry.remove(uid);
    return !ruleExists(uid);
  }
  else {
    return false;
  }
}

/**
 * If a rule with the given UID exists, it's deleted. Then a new rule is created
 * with the given properties. A DYNAMIC_RULE_TAG will be applied to the rule.
 * @param {string} uid unique identifier for the given rule
 * @param {string} ruleName name for the rule as it will appear in MainUI
 * @param {string} ruleDescription explanation of the purpose of the rule
 * @param {Array<triggers.*>} trigs triggers which willcause the rule to run
 * @param {function(event)} func called when the rule triggers
 * @param {Array<string>} [ts=[]] optional list of tags to apply to the rule
 */
const recreateRule = (uid, ruleName, ruleDescription, trigs, func, ts = []) => {
  console.warn('rulesUtils.recreateRule() is known not to work in all cases');
  console.log('Removing the rule if necessary');
  // Remove the existing rule if it exists, only works for rules created in the same file
  if(ruleExists(uid)) if(removeRule(uid)) return null;

  console.log('Old rule removed if it existed');
  ts.push['DYNAMIC_RULE_TAG'];

  let args = {
    name: ruleName,
    description: ruleDescription,
    id: uid,
    triggers: trigs,
    tags: ts,
    execute: func
  };
  console.log('Rule args:', args);


  return rules.JSRule( {
    name: ruleName,
    description: ruleDescription,
    id: uid,
    triggers: trigs,
    tags: ts,
    execute: func
  });

}

/**
 * Creates a rule that is triggered when any Item with valid metadata in the passed in
 * namespace using the passed in trigger type. In addition to the passed in tags,
 * a DYNAMIC_RULE_TAG will also be applied.
 * @param {string} namespace Item metadata namespace used to identify those Items to trigger
 * @param {function(itemName)} checkConfig function that returns true if the metadata on the Item is valid
 * @param {triggers.ItemStateChangeTrigger|triggers.ItemStateUpdateTrigger|triggers.ItemChangeTrigger} event the Item trigger type to create for each Item
 * @param {string} ruleName name of the rule generated
 * @param {function(event)} func function to call when the rule is triggered
 * @param {string} description optional description for the rule
 * @param {Array<string>} tags optional tags to apply to the rule
 * @param {string} uid optional UID to identify the rule
 * @param {int} systemStarted optional when true a runlevel 40 trigger will be added to the rule.
 * @returns {HostRule} the created rule, or null if there was a problem
 */
const createRuleWithMetadata = (namespace, checkConfig, trigger, ruleName, func,
                                description, uid, systemStarted, tags) => {
  // Get the Items
  let triggeringItems = utils.javaSetToJsArray(itemRegistry.getAll())
       .filter(i => items.getItem(i.name).getMetadataValue(namespace) && checkConfig(i.name));

  triggers = generateTriggers(triggeringItems, trigger, systemStarted);
  if(!triggers) return null;
  return recreateRule(uid, ruleName, description, triggers, func, tags);

}

/**
 * Creates a rule that is triggered when any Item with a given tag trigger type.
 * In addition to the passed in tags, a DYNAMIC_RULE_TAG will also be applied.
 * @param {string} tag Item tag used to identify those Items to trigger
 * @param {triggers.ItemStateChangeTrigger|triggers.ItemStateUpdateTrigger|triggers.ItemChangeTrigger} event the Item trigger type to create for each Item
 * @param {string} ruleName name of the rule generated
 * @param {function(event)} func function to call when the rule is triggered
 * @param {string} description optional description for the rule
 * @param {Array<string>} tags optional tags to apply to the rule
 * @param {string} uid optional UID to identify the rule
 * @param {int} systemStarted optional when true a runlevel 40 trigger will be added to the rule.
 * @returns {HostRule} the created rule, or null if there was a problem
 */
const createRuleWithTags = (tag, trigger, ruleName, func, description,
                            uid, systemStarted, tags) => {
  let triggeringItems = items.getItemsByTag(tag);
  triggers = generateTriggers(triggeringItems, trigger, systemStarted);
  if(!triggers) return null;
  return recreateRule(uid, ruleName, description, triggers, func, tags);
}

/**
 * DEPRECATED
 *
 * Calls another rule based on UID or rule name. TODO remove when added to openhab-js
 * @param {string} nameOrUid Rule UID or name to run
 * @param {dict} argsDict optional dict of data to pass to the called rule
 * @param {boolean} cond optional flag, when true the called rule's conditions will be evaluated
 * @returns {boolean} true when the rule is found and successfully called
 */
const runRule = (nameOrUid, argsDict, cond = false) => {
  console.warn('rulesUtils.runRule() is deprecated, use rules.runRule() instead');

  // If it's not a UID, try to find it by name
  if(!RuleManager.getStatusInfo(nameOrUid)) {
    const { ruleRegistry } = require('@runtime/RuleSupport');
    const rule = utils.javaSetToJsArray(ruleRegistry.getAll())
                      .find(rule => rule.getName() == nameOrUid);
    nameOrUid = (rule) ? rule.getUID() : null;
  }

  // run the rule
  if(nameOrUid) {
    RuleManager.runNow(nameOrUid, cond, argsDict);
    return true;
  }
  else {
    return false;
  }
}

module.exports = {
  generateTriggers,
  recreateRule,
  createRuleWithMetadata,
  createRuleWithTags,
  runRule,
  ruleExists,
  removeRule
}