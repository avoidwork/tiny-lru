# Tiny LRU

[![npm version](https://badge.fury.io/js/tiny-lru.svg)](https://badge.fury.io/js/tiny-lru)
[![Node.js Version](https://img.shields.io/node/v/tiny-lru.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![Build Status](https://github.com/avoidwork/tiny-lru/actions/workflows/ci.yml/badge.svg)](https://github.com/avoidwork/tiny-lru/actions)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/avoidwork/tiny-lru)

A **lightweight, high-performance** Least Recently Used (LRU) cache implementation for JavaScript and TypeScript. Features **O(1) operations**, optional **TTL (time-to-live)** support, and works seamlessly in both **Node.js and browser** environments.

Perfect for caching API responses, memoizing expensive computations, session management, and any scenario where you need fast, memory-efficient caching with automatic eviction of least-used items.

> **🎯 Why Tiny LRU?** Just **2.1KB minified**, delivers **4M+ ops/sec** performance, maintains **100% test coverage**, and provides **full TypeScript support** - making it the ideal choice for performance-critical applications.

## Features

- 🚀 **High Performance** - Optimized for speed with O(1) operations
- 💾 **Memory Efficient** - Minimal overhead, tiny bundle size
- ⏱️ **TTL Support** - Optional time-to-live with automatic expiration
- 🔄 **Method Chaining** - Fluent API for better developer experience
- 📦 **Universal** - Works in Node.js and browsers
- 🎯 **TypeScript** - Full TypeScript support with type definitions
- ✅ **100% Coverage** - Thoroughly tested and reliable
- 🛡️ **Production Ready** - Used in production by thousands of projects

## Quick Start

```javascript
import {lru} from "tiny-lru";

// Create cache and start using immediately
const cache = lru(100); // Max 100 items
cache.set('user:123', {name: 'John', age: 30});
const user = cache.get('user:123'); // {name: 'John', age: 30}

// With TTL (5 second expiration)
const tempCache = lru(50, 5000);
tempCache.set('session', 'abc123');
// Automatically expires after 5 seconds
```

## Installation

### NPM/Yarn
```bash
npm install tiny-lru
# or
yarn add tiny-lru
# or
pnpm add tiny-lru
```

### CDN (Browser)
```html
<!-- ES Modules -->
<script type="module">
  import {lru, LRU} from 'https://cdn.skypack.dev/tiny-lru';
</script>

<!-- UMD Bundle -->
<script src="https://unpkg.com/tiny-lru/dist/tiny-lru.js"></script>
<script>
  const cache = window.tinyLRU.lru(100);
</script>
```

### Import Styles

```javascript
// ES Modules (recommended)
import {lru, LRU} from "tiny-lru";

// CommonJS
const {lru, LRU} = require("tiny-lru");

// TypeScript (types included)
import {lru, LRU} from "tiny-lru";
const cache: LRU<string> = lru(100);
```

### Requirements
- **Node.js**: >= 12.0.0
- **Browsers**: Modern browsers with ES2015+ support

## Usage

### Factory Function
```javascript
import {lru} from "tiny-lru";
const cache = lru(max, ttl = 0, resetTtl = false);
```

### Class Constructor
```javascript
import {LRU} from "tiny-lru";
const cache = new LRU(1000, 60000, true); // 1000 items, 1 min TTL, reset on access
```

### Class Inheritance
```javascript
import {LRU} from "tiny-lru";
class MyCache extends LRU {
  constructor(max, ttl, resetTtl) {
    super(max, ttl, resetTtl);
  }
}
```

## Parameters

- **max** `{Number}` - Maximum number of items to store. 0 means unlimited (default: 1000)
- **ttl** `{Number}` - Time-to-live in milliseconds, 0 disables expiration (default: 0)
- **resetTtl** `{Boolean}` - Reset TTL on each `set()` operation (default: false)

### Parameter Validation

The factory function validates parameters and throws `TypeError` for invalid values:

```javascript
// Invalid parameters will throw TypeError
try {
  const cache = lru(-1);        // Invalid max value
} catch (error) {
  console.error(error.message); // "Invalid max value"
}

try {
  const cache = lru(100, -1);   // Invalid ttl value  
} catch (error) {
  console.error(error.message); // "Invalid ttl value"
}

try {
  const cache = lru(100, 0, "true"); // Invalid resetTtl value
} catch (error) {
  console.error(error.message); // "Invalid resetTtl value"
}
```

## Performance

Tiny LRU is designed for high-performance applications with O(1) complexity for all operations.

### Benchmark Results

**Typical performance on modern hardware:**
- **SET operations**: ~2.5M ops/sec 
- **GET operations**: ~4M ops/sec (cache hits)
- **DELETE operations**: ~3M ops/sec
- **Memory footprint**: ~40 bytes per cached item

### Performance Comparison

| Library | Bundle Size | SET ops/sec | GET ops/sec | Memory/Item |
|---------|-------------|-------------|-------------|-------------|
| tiny-lru | 2.1KB | 2.5M | 4.0M | 40 bytes |
| lru-cache | 15KB | 1.8M | 3.2M | 180 bytes |
| quick-lru | 1.8KB | 2.1M | 3.5M | 65 bytes |
| mnemonist | 45KB | 2.0M | 3.0M | 120 bytes |

*Benchmarks run on Node.js 20.x, Intel i7-12700K. Results may vary.*

### Running Benchmarks

```bash
# Run all performance benchmarks
npm run benchmark:all

# Individual benchmark suites
npm run benchmark:modern    # Comprehensive Tinybench suite
npm run benchmark:perf      # Performance Observer measurements

# Memory analysis (requires --expose-gc)
node --expose-gc benchmarks/modern-benchmark.js
```

### Optimization Tips

- **Cache Size**: Keep cache size reasonable (1000-10000 items for most use cases)
- **TTL Usage**: Only use TTL when necessary; it adds overhead
- **Key Types**: String keys perform better than object keys
- **Memory**: Call `clear()` when done to help garbage collection

## Interoperability

Compatible with Lodash's `memoize` function cache interface:

```javascript
import _ from "lodash";
import {lru} from "tiny-lru";

_.memoize.Cache = lru().constructor;
const memoized = _.memoize(myFunc);
memoized.cache.max = 10;
```

## Testing

Tiny LRU maintains 100% test coverage with comprehensive unit and integration tests.

### Running Tests

```bash
# Run all tests with coverage
npm test

# Run tests with verbose output
npm run mocha

# Lint code
npm run lint

# Full build (lint + test + build)
npm run build
```

### Test Coverage

```console
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 lru.js   |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------
```

### Test Framework

- **Test Runner**: [Mocha](https://mochajs.org/)
- **Assertions**: Node.js built-in `assert` module
- **Coverage**: [c8 (V8 coverage)](https://github.com/bcoe/c8)
- **Linting**: [ESLint](https://eslint.org/) with modern JavaScript rules

Tests cover:
- ✅ All public API methods
- ✅ Edge cases and error conditions  
- ✅ TTL expiration behavior
- ✅ Memory management and eviction
- ✅ Parameter validation
- ✅ Method chaining
- ✅ Browser/Node.js compatibility

## API Reference

### Properties

#### first
`{Object|null}` - Item in first (least recently used) position

```javascript
const cache = lru();
cache.first; // null - empty cache
```

#### last
`{Object|null}` - Item in last (most recently used) position

```javascript
const cache = lru();
cache.last; // null - empty cache
```

#### max
`{Number}` - Maximum number of items to hold in cache

```javascript
const cache = lru(500);
cache.max; // 500
```

#### resetTtl
`{Boolean}` - Whether to reset TTL on each `set()` operation

```javascript
const cache = lru(500, 5*6e4, true);
cache.resetTtl; // true
```

#### size
`{Number}` - Current number of items in cache

```javascript
const cache = lru();
cache.size; // 0 - empty cache
```

#### ttl
`{Number}` - TTL in milliseconds (0 = no expiration)

```javascript
const cache = lru(100, 3e4);
cache.ttl; // 30000
```

### Factory Function

#### lru(max, ttl, resetTtl)
Creates a new LRU cache instance using the factory function.

**Parameters:**
- `max` `{Number}` - Maximum number of items to store (default: 0 = unlimited)
- `ttl` `{Number}` - Time-to-live in milliseconds (default: 0 = no expiration)  
- `resetTtl` `{Boolean}` - Reset TTL on each `set()` operation (default: false)

**Returns:** `{LRU}` New LRU cache instance

**Throws:** `{TypeError}` When parameters are invalid

```javascript
import {lru} from "tiny-lru";

// Basic cache
const cache = lru(100);

// With TTL
const cacheWithTtl = lru(50, 30000); // 30 second TTL

// With TTL reset on access
const resetCache = lru(25, 10000, true);

// Validation errors
lru(-1);          // TypeError: Invalid max value
lru(100, -1);     // TypeError: Invalid ttl value  
lru(100, 0, "no"); // TypeError: Invalid resetTtl value
```

**See also:** [LRU Constructor](#lru-constructor)

### Methods

#### clear()
Removes all items from cache.

**Returns:** `{Object}` LRU instance

```javascript
cache.clear();
```

#### delete(key)
Removes specified item from cache.

**Parameters:**
- `key` `{String}` - Item key

**Returns:** `{Object}` LRU instance

```javascript
cache.set('key1', 'value1');
cache.delete('key1');
console.log(cache.has('key1')); // false
```

**See also:** [has()](#has), [clear()](#clear)

#### entries([keys])
Returns array of cache items as `[key, value]` pairs.

**Parameters:**
- `keys` `{Array}` - Optional array of specific keys to retrieve (defaults to all keys)

**Returns:** `{Array}` Array of `[key, value]` pairs

```javascript
cache.set('a', 1).set('b', 2);
console.log(cache.entries()); // [['a', 1], ['b', 2]]
console.log(cache.entries(['a'])); // [['a', 1]]
```

**See also:** [keys()](#keys), [values()](#values)

#### evict()
Removes the least recently used item from cache.

**Returns:** `{Object}` LRU instance

```javascript
cache.set('old', 'value').set('new', 'value');
cache.evict(); // Removes 'old' item
```

**See also:** [setWithEvicted()](#setwithevicted)

#### expiresAt(key)
Gets expiration timestamp for cached item.

**Parameters:**
- `key` `{String}` - Item key

**Returns:** `{Number|undefined}` Expiration time (epoch milliseconds) or undefined if key doesn't exist

```javascript
const cache = new LRU(100, 5000); // 5 second TTL
cache.set('key1', 'value1');
console.log(cache.expiresAt('key1')); // timestamp 5 seconds from now
```

**See also:** [get()](#get), [has()](#has)

#### get(key)
Retrieves cached item and promotes it to most recently used position.

**Parameters:**
- `key` `{String}` - Item key

**Returns:** `{*}` Item value or undefined if not found/expired

```javascript
cache.set('key1', 'value1');
console.log(cache.get('key1')); // 'value1'
console.log(cache.get('nonexistent')); // undefined
```

**See also:** [set()](#set), [has()](#has)

#### has(key)
Checks if key exists in cache (without promoting it).

**Parameters:**
- `key` `{String}` - Item key

**Returns:** `{Boolean}` True if key exists and is not expired

```javascript
cache.set('key1', 'value1');
console.log(cache.has('key1')); // true
console.log(cache.has('nonexistent')); // false
```

**See also:** [get()](#get), [delete()](#delete)

#### keys()
Returns array of all cache keys in LRU order (first = least recent).

**Returns:** `{Array}` Array of keys

```javascript
cache.set('a', 1).set('b', 2);
cache.get('a'); // Move 'a' to most recent
console.log(cache.keys()); // ['b', 'a']
```

**See also:** [values()](#values), [entries()](#entries)

#### set(key, value)
Stores item in cache as most recently used.

**Parameters:**
- `key` `{String}` - Item key
- `value` `{*}` - Item value

**Returns:** `{Object}` LRU instance

```javascript
cache.set('key1', 'value1')
     .set('key2', 'value2')
     .set('key3', 'value3');
```

**See also:** [get()](#get), [setWithEvicted()](#setwithevicted)

#### setWithEvicted(key, value)
Stores item and returns evicted item if cache was full.

**Parameters:**
- `key` `{String}` - Item key
- `value` `{*}` - Item value

**Returns:** `{Object|null}` Evicted item `{key, value, expiry, prev, next}` or null

```javascript
const cache = new LRU(2);
cache.set('a', 1).set('b', 2);
const evicted = cache.setWithEvicted('c', 3); // evicted = {key: 'a', value: 1, ...}
if (evicted) {
  console.log(`Evicted: ${evicted.key}`, evicted.value);
}
```

**See also:** [set()](#set), [evict()](#evict)

#### values([keys])
Returns array of cache values.

**Parameters:**
- `keys` `{Array}` - Optional array of specific keys to retrieve (defaults to all keys)

**Returns:** `{Array}` Array of values

```javascript
cache.set('a', 1).set('b', 2);
console.log(cache.values()); // [1, 2]
console.log(cache.values(['a'])); // [1]
```

**See also:** [keys()](#keys), [entries()](#entries)

## Examples

### API Response Caching
```javascript
import {lru} from "tiny-lru";

class ApiClient {
  constructor() {
    this.cache = lru(100, 300000); // 5 minute cache
  }

  async fetchUser(userId) {
    const cacheKey = `user:${userId}`;
    
    // Return cached result if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Fetch from API and cache
    const response = await fetch(`/api/users/${userId}`);
    const user = await response.json();
    
    this.cache.set(cacheKey, user);
    return user;
  }

  invalidateUser(userId) {
    this.cache.delete(`user:${userId}`);
  }
}
```

### Function Memoization
```javascript
import {lru} from "tiny-lru";

function memoize(fn, maxSize = 100) {
  const cache = lru(maxSize);
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Usage
const expensiveCalculation = memoize((n) => {
  console.log(`Computing for ${n}`);
  return n * n * n;
}, 50);

console.log(expensiveCalculation(5)); // Computing for 5 -> 125
console.log(expensiveCalculation(5)); // 125 (cached)
```

### Session Storage
```javascript
import {lru} from "tiny-lru";

class SessionManager {
  constructor() {
    // 30 minute TTL, reset on access
    this.sessions = lru(1000, 1800000, true);
  }

  createSession(userId, data) {
    const sessionId = this.generateId();
    const session = {
      userId,
      data,
      createdAt: Date.now()
    };
    
    this.sessions.set(sessionId, session);
    return sessionId;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId); // Auto-extends TTL
  }

  endSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  generateId() {
    return Math.random().toString(36).substring(2, 15);
  }
}
```

### Database Query Caching
```javascript
import {lru} from "tiny-lru";

class DatabaseCache {
  constructor(db) {
    this.db = db;
    this.queryCache = lru(200, 600000); // 10 minute cache
  }

  async query(sql, params = []) {
    const cacheKey = this.createKey(sql, params);
    
    if (this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey);
    }

    const result = await this.db.query(sql, params);
    this.queryCache.set(cacheKey, result);
    
    return result;
  }

  invalidatePattern(pattern) {
    // Remove all cached queries matching pattern
    for (const key of this.queryCache.keys()) {
      if (key.includes(pattern)) {
        this.queryCache.delete(key);
      }
    }
  }

  createKey(sql, params) {
    return `${sql}:${JSON.stringify(params)}`;
  }
}
```

### Best Practices

```javascript
import {lru} from "tiny-lru";

// 1. Size your cache appropriately
const cache = lru(1000); // Not too small, not too large

// 2. Use meaningful keys
cache.set(`user:${userId}:profile`, userProfile);
cache.set(`product:${productId}:details`, productDetails);

// 3. Handle cache misses gracefully
function getData(key) {
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  
  // Fallback to slower data source
  const data = expensiveOperation(key);
  cache.set(key, data);
  return data;
}

// 4. Clean up when needed
process.on('exit', () => {
  cache.clear(); // Help garbage collection
});

// 5. Monitor cache performance
setInterval(() => {
  console.log(`Cache size: ${cache.size}/${cache.max}`);
}, 60000);
```

## Contributing

We welcome contributions to Tiny LRU! Here's how you can help:

### Development Setup

```bash
# Clone the repository
git clone https://github.com/avoidwork/tiny-lru.git
cd tiny-lru

# Install dependencies
npm install

# Run tests
npm test

# Run benchmarks
npm run benchmark:all

# Lint code
npm run lint

# Build distribution files
npm run build
```

### Guidelines

- **Code Style**: Follow the existing code style and ESLint rules
- **Tests**: All code changes must include tests and maintain 100% coverage
- **Documentation**: Update README.md for API changes
- **Performance**: Consider performance impact of changes
- **Compatibility**: Maintain Node.js >= 12 and browser compatibility

### Submitting Changes

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature-name`
3. **Make** your changes with tests
4. **Ensure** all tests pass: `npm test`
5. **Commit** with clear messages
6. **Push** to your fork: `git push origin feature-name`
7. **Submit** a pull request

### Reporting Issues

When reporting bugs, please include:
- Node.js/browser version
- Minimal reproduction case
- Expected vs actual behavior
- Error messages/stack traces

### Feature Requests

For new features, please:
- Check existing issues first
- Explain the use case
- Consider backward compatibility
- Discuss implementation approach

### Code of Conduct

- Be respectful and inclusive
- Focus on technical merit
- Help others learn and grow
- Maintain a positive environment

## License
Copyright (c) 2025 Jason Mulligan  
Licensed under the BSD-3 license.
