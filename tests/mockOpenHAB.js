const { ZonedDateTime, Duration, ChronoUnit } = require('@js-joda/core');

// 1. Setup Mock Java Types and global Java object
class ConcurrentHashMap {
  constructor() {
    this.map = new Map();
  }
  put(key, value) {
    this.map.set(key, value);
    return value;
  }
  get(key, defaultValueSupplier) {
    if (!this.map.has(key) && defaultValueSupplier) {
      const val = defaultValueSupplier();
      this.map.set(key, val);
    }
    return this.map.has(key) ? this.map.get(key) : null;
  }
  containsKey(key) {
    return this.map.has(key);
  }
  remove(key) {
    const val = this.map.get(key);
    this.map.delete(key);
    return val;
  }
  clear() {
    this.map.clear();
  }
  keySet() {
    const keys = Array.from(this.map.keys());
    return {
      iterator() {
        let index = 0;
        return {
          hasNext() {
            return index < keys.length;
          },
          next() {
            return keys[index++];
          }
        };
      }
    };
  }
}

class ArrayDeque {
  constructor() {
    this.array = [];
  }
  add(e) {
    this.array.push(e);
    return true;
  }
  addLast(e) {
    this.array.push(e);
  }
  remove(e) {
    const idx = this.array.indexOf(e);
    if (idx !== -1) {
      this.array.splice(idx, 1);
      return true;
    }
    return false;
  }
  poll() {
    return this.array.shift();
  }
  pollFirst() {
    return this.array.shift();
  }
  pop() {
    return this.array.shift();
  }
  peek() {
    return this.array[0];
  }
  peekFirst() {
    return this.array[0];
  }
  isEmpty() {
    return this.array.length === 0;
  }
  size() {
    return this.array.length;
  }
  clear() {
    this.array = [];
  }
}

class Thread {
  static sleep(msec) {
    // Under Jest fake timers, sleep should just advance the clock or be a no-op
    // to avoid blocking the single execution thread.
  }
}

global.Java = {
  isJavaObject(obj) {
    return obj && (obj.constructor && (obj.constructor.name === 'ConcurrentHashMap' || obj.constructor.name === 'ArrayDeque' || obj.constructor.name === 'DummyJavaClass' || obj.constructor.name === 'FrameworkUtil'));
  },
  isType(obj) {
    return false;
  },
  typeName(obj) {
    return obj && obj.name;
  },
  type(className) {
    switch (className) {
      case 'org.osgi.framework.FrameworkUtil':
        return class FrameworkUtil {
          static getBundle(clazz) {
            return {
              getHeaders() {
                return {
                  get(key) {
                    return '5.12.0';
                  }
                };
              },
              getVersion() {
                return {
                  toString() { return '5.12.0'; }
                };
              }
            };
          }
        };
      case 'java.util.concurrent.ConcurrentHashMap':
        return ConcurrentHashMap;
      case 'java.util.Hashtable':
        return ConcurrentHashMap;
      case 'java.util.HashMap':
        return ConcurrentHashMap;
      case 'java.util.ArrayDeque':
        return ArrayDeque;
      case 'java.lang.Thread':
        return Thread;
      case 'java.time.ZonedDateTime':
        return ZonedDateTime;
      case 'java.lang.String':
        return String;
      case 'org.openhab.core.library.types.DateTimeType':
        return class DateTimeType {
          constructor(zdtStr) { this.zdt = zdtStr; }
          toString() { return this.zdt; }
        };
      case 'org.openhab.core.library.types.DecimalType':
        return class DecimalType {
          constructor(val) { this.val = Number(val); }
          toString() { return String(this.val); }
        };
      case 'org.openhab.core.library.types.PercentType':
        return class PercentType {
          constructor(val) { this.val = Number(val); }
          toString() { return String(this.val); }
        };
      case 'org.openhab.core.library.types.QuantityType':
        return class QuantityType {
          constructor(val) { this.val = val; }
          toString() { return String(this.val); }
        };
      case 'org.slf4j.helpers.MessageFormatter':
        return class MessageFormatter {
          static arrayFormat(message, array) {
            let formatted = message;
            if (array) {
              for (const arg of array) {
                formatted = formatted.replace('{}', String(arg));
              }
            }
            return {
              getMessage() { return formatted; }
            };
          }
          static format(message, arg1, arg2) {
            return this.arrayFormat(message, [arg1, arg2]);
          }
        };
      case 'org.slf4j.LoggerFactory':
        return class LoggerFactory {
          static getLogger(name) {
            return {
              debug: () => {},
              info: () => {},
              warn: () => {},
              error: () => {},
              trace: () => {},
              isTraceEnabled: () => false,
              isDebugEnabled: () => false,
              isInfoEnabled: () => false,
              isWarnEnabled: () => false,
              isErrorEnabled: () => false,
            };
          }
        };
      default:
        // Return a dummy class so we don't crash on unmocked classes
        return class DummyJavaClass {
          constructor(...args) { this.args = args; }
          toString() { return `[DummyJavaClass: ${className}]`; }
        };
    }
  },
  to(jsArray, javaType) {
    return jsArray;
  }
};

// 2. Setup mock logging log function
global.log = (loggerName) => {
  return {
    debug: (...args) => {},
    info: (...args) => {},
    warn: (...args) => {},
    error: (...args) => console.error(`[${loggerName}]`, ...args)
  };
};

// 3. Create items Registry & MockItem
class MockItem {
  constructor(name, state = 'UNDEF', metadata = {}) {
    this.name = name;
    this.state = state;
    this.metadata = metadata;
    this.groupNames = [];
    this.members = [];
  }
  postUpdate(newState) {
    this.state = String(newState);
  }
  sendCommand(command) {
    this.state = String(command);
  }
  getMetadata(namespace) {
    return this.metadata[namespace] || null;
  }
}

const itemRegistry = new Map();
const mockItems = new Proxy({
  getItem(name, nullIfMissing = false) {
    if (!itemRegistry.has(name)) {
      if (nullIfMissing) return null;
      itemRegistry.set(name, new MockItem(name));
    }
    return itemRegistry.get(name);
  },
  getItems() {
    return Array.from(itemRegistry.values());
  },
  _registerItem(item) {
    itemRegistry.set(item.name, item);
  },
  _clear() {
    itemRegistry.clear();
  }
}, {
  get(target, prop) {
    if (prop in target || typeof prop === 'symbol') {
      return target[prop];
    }
    return target.getItem(prop, true) || undefined;
  },
  set(target, prop, value) {
    if (value instanceof MockItem) {
      itemRegistry.set(prop, value);
      return true;
    }
    return false;
  }
});

// 4. Create mock Actions and ScriptExecution Timers
const mockActions = {
  ScriptExecution: {
    createTimer(...args) {
      let name, timeout, func;
      if (args.length === 3) {
        [name, timeout, func] = args;
      } else {
        [timeout, func] = args;
      }

      const nowMs = Date.now();
      let timeoutMs;
      if (timeout && typeof timeout.toInstant === 'function') {
        timeoutMs = timeout.toInstant().toEpochMilli();
      } else if (timeout && typeof timeout.toEpochMilli === 'function') {
        timeoutMs = timeout.toEpochMilli();
      } else if (timeout instanceof Date) {
        timeoutMs = timeout.getTime();
      } else {
        timeoutMs = Date.now() + 1000;
      }

      const delay = Math.max(0, timeoutMs - nowMs);
      let executed = false;
      let cancelled = false;

      const timeoutId = setTimeout(() => {
        executed = true;
        func();
      }, delay);

      const timerObj = {
        _timeoutId: timeoutId,
        _executionTime: timeout,
        cancel() {
          if (!executed && !cancelled) {
            clearTimeout(this._timeoutId);
            cancelled = true;
            return true;
          }
          return false;
        },
        reschedule(newTime) {
          this.cancel();
          let newTimeMs;
          if (newTime && typeof newTime.toInstant === 'function') {
            newTimeMs = newTime.toInstant().toEpochMilli();
          } else if (newTime && typeof newTime.toEpochMilli === 'function') {
            newTimeMs = newTime.toEpochMilli();
          } else if (newTime instanceof Date) {
            newTimeMs = newTime.getTime();
          } else {
            newTimeMs = Date.now() + 1000;
          }
          const newDelay = Math.max(0, newTimeMs - Date.now());
          executed = false;
          cancelled = false;
          this._executionTime = newTime;
          this._timeoutId = setTimeout(() => {
            executed = true;
            func();
          }, newDelay);
        },
        isActive() {
          return !executed && !cancelled;
        },
        isCancelled() {
          return cancelled;
        },
        hasTerminated() {
          return executed;
        },
        getExecutionTime() {
          return this._executionTime;
        }
      };

      return timerObj;
    }
  }
};

// 5. Setup virtual runtime mocks for openhab-js dependencies
const mockRulesSet = new Set(['existing-rule']);

const mockService = {
  getTimeZone: () => ({
    getId: () => 'GMT'
  }),
  get: () => null,
  getAll: () => ({ toArray: () => [] }),
  getItem: () => null,
  getMetadata: () => null,
  getMetadataRegistry: () => null,
  getStatusInfo: (uid) => mockRulesSet.has(uid) ? { getStatus: () => 'RUNNING' } : null,
  runNow: () => {},
  remove: (uid) => {
    mockRulesSet.delete(uid);
  },
};

global.osgi = {
  getService: (className) => {
    return mockService;
  }
};

jest.mock('@runtime/osgi', () => {
  const mockBundleContext = {
    getServiceReference: (classname) => {
      return classname;
    },
    getService: (ref) => {
      return mockService;
    },
    getAllServiceReferences: (classname, filter) => {
      return [];
    },
    registerService: () => ({
      unregister: () => {}
    })
  };
  return {
    bundleContext: mockBundleContext,
    getService: (className) => {
      return mockService;
    }
  };
}, { virtual: true });

jest.mock('@runtime', () => {
  return {
    itemRegistry: {
      get: () => null,
      getItems: () => []
    },
    events: {
      postUpdate: () => {},
      sendCommand: () => {}
    }
  };
}, { virtual: true });

jest.mock('@runtime/RuleSupport', () => {
  return {
    ruleRegistry: {
      getAll: () => ({
        toArray: () => []
      })
    }
  };
}, { virtual: true });

jest.mock('@runtime/cache', () => {
  return {
    private: {
      get: () => null,
      put: () => {}
    },
    shared: {
      get: () => null,
      put: () => {}
    }
  };
}, { virtual: true });

jest.mock('@runtime/metadata', () => {
  return {
    get: () => null,
    getAll: () => []
  };
}, { virtual: true });

jest.mock('@runtime/provider', () => {
  return {};
}, { virtual: true });

// Require ACTUAL openhab-js and build the mocked module
const mockActualOpenhab = jest.requireActual('openhab');

// Setup globals ruleUID and javax.script.filename
global.ruleUID = 'test-rule-uid';
global['javax.script.filename'] = 'test-file.js';
global.time = mockActualOpenhab.time;
global.items = mockItems;
global.actions = mockActions;
global.utils = {
  javaSetToJsArray: (set) => {
    if (set && typeof set.toArray === 'function') {
      return set.toArray();
    }
    return Array.from(set || []);
  }
};
global.osgi = {
  getService: (className) => {
    return mockService;
  }
};
// We can set osgi globally using our mockService!

// Define cache using ACTUAL openhab utils javaify/jsify
const utilsJavaify = (mockActualOpenhab.utils && mockActualOpenhab.utils.javaify) || ((val) => val);
const utilsJsify = (mockActualOpenhab.utils && mockActualOpenhab.utils.jsify) || ((val) => val);

const makeCache = () => {
  const map = new Map();
  return {
    put(key, value) {
      // javaify the value using the real openhab-js method
      const javaified = utilsJavaify(value);
      map.set(key, javaified);
      return javaified;
    },
    get(key, defaultFunc, jsify) {
      if (!map.has(key)) {
        if (defaultFunc) {
          const defaultValue = defaultFunc();
          this.put(key, defaultValue);
        } else {
          return null;
        }
      }
      // jsify back using the real openhab-js method unless jsify is explicitly false
      if (jsify === false) {
        return map.get(key);
      }
      return utilsJsify(map.get(key));
    },
    containsKey(key) {
      return map.has(key);
    },
    remove(key) {
      const val = map.get(key);
      map.delete(key);
      return val;
    },
    clear() {
      map.clear();
    }
  };
};

global.cache = {
  private: makeCache(),
  shared: makeCache()
};

// Mock the openhab module
jest.mock('openhab', () => {
  return {
    ...mockActualOpenhab,
    actions: mockActions,
    items: mockItems,
    cache: global.cache,
  };
});

module.exports = {
  MockItem,
  itemRegistry,
  items: mockItems,
  actions: mockActions,
  cache,
  mockRulesSet
};
