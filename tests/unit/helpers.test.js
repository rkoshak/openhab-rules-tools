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

  describe('getBackingMap with conditional jsify bypassing', () => {
    test('returns a raw ConcurrentHashMap', () => {
      const map = helpers.getBackingMap();
      const ConcurrentHashMap = Java.type('java.util.concurrent.ConcurrentHashMap');
      expect(map).toBeInstanceOf(ConcurrentHashMap);
    });

    test('passes jsify = false to cache.shared.get to bypass automatic jsification', () => {
      const mockSharedCache = {
        get: jest.fn(() => 'rawMapInstance')
      };
      
      // Temporarily mock global cache.shared
      const oldCache = global.cache;
      global.cache = {
        private: {},
        shared: mockSharedCache
      };

      try {
        const result = helpers.getBackingMap('myKey', mockSharedCache);
        expect(result).toBe('rawMapInstance');
        expect(mockSharedCache.get).toHaveBeenCalledWith('myKey', expect.any(Function), false);
      } finally {
        global.cache = oldCache;
      }
    });

    test('does NOT pass jsify = false parameter when using another cache like private', () => {
      const mockPrivateCache = {
        get: jest.fn(() => 'privateMapInstance')
      };

      const oldCache = global.cache;
      global.cache = {
        private: mockPrivateCache,
        shared: {}
      };

      try {
        const result = helpers.getBackingMap('myKey', mockPrivateCache);
        expect(result).toBe('privateMapInstance');
        expect(mockPrivateCache.get).toHaveBeenCalledWith('myKey', expect.any(Function));
        expect(mockPrivateCache.get.mock.calls[0].length).toBe(2); // strictly key and defaultSupplier
      } finally {
        global.cache = oldCache;
      }
    });
  });
});
