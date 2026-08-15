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

  describe('MapWrapper and getBackingMap', () => {
    test('wraps a raw Java Map (ConcurrentHashMap)', () => {
      const ConcurrentHashMap = Java.type('java.util.concurrent.ConcurrentHashMap');
      const javaMap = new ConcurrentHashMap();
      const wrapper = new helpers.MapWrapper(javaMap);

      wrapper.put('key1', 'value1');
      expect(wrapper.get('key1')).toBe('value1');
      expect(wrapper.containsKey('key1')).toBe(true);
      expect(wrapper.has('key1')).toBe(true);

      const iterator = wrapper.keySet().iterator();
      expect(iterator.hasNext()).toBe(true);
      expect(iterator.next()).toBe('key1');
      expect(iterator.hasNext()).toBe(false);

      wrapper.remove('key1');
      expect(wrapper.containsKey('key1')).toBe(false);

      wrapper.put('key2', 'value2');
      wrapper.clear();
      expect(wrapper.containsKey('key2')).toBe(false);
    });

    test('wraps a standard JavaScript Map', () => {
      const jsMap = new Map();
      const wrapper = new helpers.MapWrapper(jsMap);

      wrapper.put('key1', 'value1');
      expect(wrapper.get('key1')).toBe('value1');
      expect(wrapper.containsKey('key1')).toBe(true);
      expect(wrapper.has('key1')).toBe(true);

      const iterator = wrapper.keySet().iterator();
      expect(iterator.hasNext()).toBe(true);
      expect(iterator.next()).toBe('key1');
      expect(iterator.hasNext()).toBe(false);

      wrapper.remove('key1');
      expect(wrapper.containsKey('key1')).toBe(false);

      wrapper.put('key2', 'value2');
      wrapper.clear();
      expect(wrapper.containsKey('key2')).toBe(false);
    });

    test('wraps a plain JavaScript Object', () => {
      const jsObj = {};
      const wrapper = new helpers.MapWrapper(jsObj);

      wrapper.put('key1', 'value1');
      expect(wrapper.get('key1')).toBe('value1');
      expect(wrapper.containsKey('key1')).toBe(true);
      expect(wrapper.has('key1')).toBe(true);

      const iterator = wrapper.keySet().iterator();
      expect(iterator.hasNext()).toBe(true);
      expect(iterator.next()).toBe('key1');
      expect(iterator.hasNext()).toBe(false);

      wrapper.remove('key1');
      expect(wrapper.containsKey('key1')).toBe(false);

      wrapper.put('key2', 'value2');
      wrapper.clear();
      expect(wrapper.containsKey('key2')).toBe(false);
    });

    test('handles null/undefined map gracefully', () => {
      const wrapper = new helpers.MapWrapper(null);
      expect(wrapper.containsKey('any')).toBe(false);
      expect(wrapper.get('any')).toBeUndefined();
      expect(() => wrapper.put('any', 'val')).not.toThrow();
      expect(() => wrapper.remove('any')).not.toThrow();
      expect(() => wrapper.clear()).not.toThrow();
      expect(wrapper.keySet().iterator().hasNext()).toBe(false);
    });

    test('getBackingMap returns a MapWrapper', () => {
      const wrapper = helpers.getBackingMap();
      expect(wrapper).toBeInstanceOf(helpers.MapWrapper);
      wrapper.put('testKey', 'testVal');
      expect(wrapper.get('testKey')).toBe('testVal');
    });

    test('performs write-back to cache on modifications when key and cache are provided', () => {
      const mockCache = {
        put: jest.fn(),
        get: jest.fn(() => new Map())
      };
      
      const jsMap = new Map();
      const wrapper = new helpers.MapWrapper(jsMap, 'myKey', mockCache);

      // Test put write-back
      wrapper.put('foo', 'bar');
      expect(mockCache.put).toHaveBeenCalledWith('myKey', jsMap);

      // Test remove write-back
      mockCache.put.mockClear();
      wrapper.remove('foo');
      expect(mockCache.put).toHaveBeenCalledWith('myKey', jsMap);

      // Test clear write-back
      mockCache.put.mockClear();
      wrapper.clear();
      expect(mockCache.put).toHaveBeenCalledWith('myKey', jsMap);
    });
  });
});
