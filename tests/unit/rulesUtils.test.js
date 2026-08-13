const rulesUtils = require('../../rulesUtils');
const { items } = require('openhab');
const { mockRulesSet } = require('../mockOpenHAB');

describe('rulesUtils', () => {
  beforeEach(() => {
    items._clear();
    mockRulesSet.clear();
    mockRulesSet.add('existing-rule');
  });

  test('generateTriggers', () => {
    const list = [items.getItem('Item1'), items.getItem('Item2')];
    const triggerFn = jest.fn(name => `trigger-${name}`);

    const result = rulesUtils.generateTriggers(list, triggerFn);
    expect(result).toEqual(['trigger-Item1', 'trigger-Item2']);
    expect(triggerFn).toHaveBeenCalledTimes(2);
  });

  test('ruleExists', () => {
    // 'existing-rule' is mocked to return active status info, others null
    expect(rulesUtils.ruleExists('existing-rule')).toBe(true);
    expect(rulesUtils.ruleExists('non-existent-rule')).toBe(false);
  });

  test('removeRule', () => {
    // Since mock remove does nothing and exists checks uid, removeRule of 'existing-rule' returns true
    expect(rulesUtils.removeRule('existing-rule')).toBe(true);
    expect(rulesUtils.removeRule('non-existent-rule')).toBe(false);
  });

  test('runRule', () => {
    expect(rulesUtils.runRule('existing-rule', {})).toBe(true);
  });
});
