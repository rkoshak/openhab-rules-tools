const groupUtils = require('../../groupUtils');
const { items } = require('openhab');

describe('groupUtils', () => {
  beforeEach(() => {
    items._clear();
  });

  test('membersToMappedList and descendentsToMappedList', () => {
    const group = items.getItem('TestGroup');
    const item1 = items.getItem('Item1');
    const item2 = items.getItem('Item2');
    
    item1.postUpdate('ON');
    item2.postUpdate('OFF');
    
    group.members = [item1, item2];

    const result = groupUtils.membersToMappedList('TestGroup', i => i.state);
    expect(result).toEqual(['ON', 'OFF']);
  });

  test('membersToString and descendentsToString', () => {
    const group = items.getItem('TestGroup');
    const item1 = items.getItem('Item1');
    const item2 = items.getItem('Item2');
    
    group.members = [item1, item2];

    const str = groupUtils.membersToString('TestGroup', ',', i => i.name);
    expect(str).toBe('Item1,Item2');
  });

  test('reduceMemberStates', () => {
    const group = items.getItem('TestGroup');
    const item1 = items.getItem('Item1');
    const item2 = items.getItem('Item2');
    
    item1.rawState = 5;
    item2.rawState = 10;
    group.members = [item1, item2];

    const total = groupUtils.reduceMemberStates('TestGroup', (sum, state) => sum + state);
    expect(total).toBe(15);
  });

  test('list calculations: sumList, avgList, minList, maxList, countList', () => {
    const item1 = items.getItem('Item1');
    const item2 = items.getItem('Item2');
    
    item1.rawState = { floatValue: () => 10.0 };
    item2.rawState = { floatValue: () => 20.0 };

    const list = [item1, item2];

    expect(groupUtils.sumList(list)).toBe(30.0);
    expect(groupUtils.avgList(list)).toBe(15.0);
    expect(groupUtils.minList(list)).toBe(10.0);
    expect(groupUtils.maxList(list)).toBe(20.0);
    expect(groupUtils.countList(list, i => i.name === 'Item1')).toBe(1);
  });
});
