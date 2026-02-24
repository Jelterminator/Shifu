// Stub for react-native internal modules that use ES module syntax
// or Flow features not easily transformed in tests.
// Uses a recursive Proxy to avoid errors for any method call or property access.

const dummy = () => proxy;

const handler = {
  get: (target, prop) => {
    if (prop === '__esModule') return true;
    if (prop === 'default') return proxy;
    if (typeof prop === 'symbol') return undefined;
    return proxy;
  },
  apply: () => proxy,
  construct: () => proxy,
};

const proxy = new Proxy(dummy, handler);

module.exports = proxy;
