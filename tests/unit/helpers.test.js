const helpers = require('../../helpers');
const { items } = require('openhab');

describe('helpers', () => {
  beforeEach(() => {
    items._clear();
  });

  test('compareVersions', () => {
    expect(helpers.compareVersions('2.1.0', '2.0.0')).toBe(1);
    expect(helpers.compareVersions('1.5.0', '1.5.0')).toBe(0);
    expect(helpers.compareVersions('1.0.0', '1.0.1')).toBe(-1);
    expect(() => helpers.compareVersions('invalid', '1.0.0')).toThrow();
  });

  test('validateLibraries', () => {
    // Should not throw since mock actual openhab-js version is newer or equal
    expect(() => helpers.validateLibraries('1.0.0', '1.0.0')).not.toThrow();
  });

  test('checkGrpAndMetadata', () => {
    // Create a group
    const grp = items.getItem('TestGroup');
    grp.members = [];

    // Validating on empty group should be successful
    const result = helpers.checkGrpAndMetadata('test-namespace', 'TestGroup', () => true, 'Usage text');
    expect(result).toBe(true);
  });
});
