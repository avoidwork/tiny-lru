# 🚀 Tiny LRU

[![npm version](https://badge.fury.io/js/tiny-lru.svg)](https://badge.fury.io/js/tiny-lru)
[![Node.js Version](https://img.shields.io/node/v/tiny-lru.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![Build Status](https://github.com/avoidwork/tiny-lru/actions/workflows/ci.yml/badge.svg)](https://github.com/avoidwork/tiny-lru/actions)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/avoidwork/tiny-lru)

A **high-performance, lightweight** LRU cache for JavaScript with **industry-leading UPDATE operations** and the **smallest bundle size** among full-featured libraries. Built for developers who need fast caching without compromising on features.

> **Just 2.3KB** • **348K UPDATE ops/sec** • **100% TypeScript support** • **Works everywhere**

```javascript
import {lru} from "tiny-lru";

// Create cache and start using immediately
const cache = lru(100); // Max 100 items
cache.set('user:123', {name: 'John', age: 30});
const user = cache.get('user:123'); // {name: 'John', age: 30}

// With TTL (5 second expiration)
const tempCache = lru(50, 5000);
tempCache.set('session', 'abc123'); // Automatically expires after 5 seconds
```

## 🏆 Why Choose Tiny LRU?

### Performance That Leads the Pack

| Library | SET ops/sec | GET ops/sec | UPDATE ops/sec | DELETE ops/sec | Bundle Size | Memory/Item |
|---------|-------------|-------------|---------------|---------------|-------------|-------------|
| **tiny-lru** | 43,022 | 113,531 | **348,829** 🥇 | **335,038** 🥇 | **2.3KB** 🥇 | 185 bytes |
| lru-cache | 27,819 | 96,739 | 133,706 | 149,700 | ~15KB | **114 bytes** 🥇 |
| quick-lru | **52,200** 🥇 | 118,758 | 321,377 | **391,763** 🥇 | ~1.8KB | 176 bytes |
| mnemonist | 29,933 | **192,073** 🥇 | 210,628 | N/A† | ~45KB | **99 bytes** 🥇 |

† *mnemonist uses different method names for delete operations*  
*Benchmarks run on Node.js v24.5.0, Apple Silicon (M4)*

### 🎯 **Key Highlights**
- **🚀 348K UPDATE operations per second** - Leads the field in cache update performance
- **📦 Just 2.3KB minified** - Smallest bundle among full-featured LRU libraries  
- **⚡ O(1) complexity** - Consistent performance that scales
- **🛡️ 100% test coverage** - Battle-tested and reliable
- **🌐 Universal compatibility** - Works in Node.js and browsers
- **📝 Full TypeScript support** - Complete type definitions included

## ✨ Features

- 🚀 **Leading UPDATE Performance** - 348K UPDATE ops/sec, optimized O(1) operations
- 💾 **Smallest Bundle** - Just 2.3KB minified among full-featured LRU libraries
- ⏱️ **TTL Support** - Optional time-to-live with automatic expiration
- 🔄 **Method Chaining** - Fluent API for better developer experience
- 📦 **Universal** - Works in Node.js and browsers
- 🎯 **TypeScript** - Full TypeScript support with type definitions
- ✅ **100% Coverage** - Thoroughly tested and reliable
- 🛡️ **Production Ready** - Used in production by thousands of projects

## 📊 Performance Deep Dive

### Real-World Benchmarks

**Validated performance on modern hardware (Node.js v24.5.0, Apple Silicon M4):**
- **SET operations**: 43,022 ops/sec 
- **GET operations**: 113,531 ops/sec (cache hits)
- **UPDATE operations**: 348,829 ops/sec (existing keys)
- **DELETE operations**: 335,038 ops/sec
- **Memory footprint**: 185 bytes per cached item

### When to Choose Tiny LRU

**✅ Perfect for:**
- **Frequent cache updates** - Leading UPDATE performance (340K ops/sec)
- **Mixed read/write workloads** - Balanced GET/UPDATE/DELETE performance
- **Bundle size constraints** - Smallest size (2.3KB) among full-featured LRU libraries
- **High-frequency operations** - Optimized for speed with O(1) complexity
- **Production applications** - 100% test coverage and TypeScript support

### Running Your Own Benchmarks

```bash
# Run all performance benchmarks
npm run benchmark:all

# Individual benchmark suites
npm run benchmark:modern     # Comprehensive Tinybench suite
npm run benchmark:perf       # Performance Observer measurements
npm run benchmark:comparison # Compare against other LRU libraries
```

## 🚀 Getting Started

### Installation

```bash
npm install tiny-lru
# or
yarn add tiny-lru
# or  
pnpm add tiny-lru
```

### Quick Examples

```javascript
import {lru} from "tiny-lru";

// Basic cache
const cache = lru(100);
cache.set('key1', 'value1')
     .set('key2', 'value2')
     .set('key3', 'value3');

console.log(cache.get('key1')); // 'value1'
console.log(cache.size); // 3

// With TTL (time-to-live)
const cacheWithTtl = lru(50, 30000); // 30 second TTL
cacheWithTtl.set('temp-data', {important: true});
// Automatically expires after 30 seconds

// TTL that resets on access
const resetCache = lru(25, 10000, true);
resetCache.set('session', 'user123');
// TTL resets every time you access the item
```

### CDN Usage (Browser)

```html
<!-- ES Modules -->
<script type="module">
  import {lru, LRU} from 'https://cdn.skypack.dev/tiny-lru';
  const cache = lru(100);
</script>

<!-- UMD Bundle -->
<script src="https://unpkg.com/tiny-lru/dist/tiny-lru.js"></script>
<script>
  const cache = window.tinyLRU.lru(100);
</script>
```

### TypeScript Usage

```typescript
import {lru, LRU} from "tiny-lru";

// Type-safe cache
const cache: LRU<string> = lru(100);
cache.set('user:123', 'John Doe');
const user: string | undefined = cache.get('user:123');

// Class inheritance
class MyCache extends LRU<User> {
  constructor() {
    super(1000, 60000, true); // 1000 items, 1 min TTL, reset on access
  }
}
```

## 💡 Real-World Examples

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

### Session Management

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
}
```

## 🔧 Configuration & Best Practices

### Factory Function

```javascript
import {lru} from "tiny-lru";

const cache = lru(max, ttl = 0, resetTtl = false);
```

**Parameters:**
- `max` `{Number}` - Maximum number of items (0 = unlimited, default: 1000)
- `ttl` `{Number}` - Time-to-live in milliseconds (0 = no expiration, default: 0)
- `resetTtl` `{Boolean}` - Reset TTL on each `set()` operation (default: false)

### Class Constructor

```javascript
import {LRU} from "tiny-lru";

const cache = new LRU(1000, 60000, true); // 1000 items, 1 min TTL, reset on access
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
```

### Optimization Tips

- **Cache Size**: Keep cache size reasonable (1000-10000 items for most use cases)
- **TTL Usage**: Only use TTL when necessary; it adds overhead
- **Key Types**: String keys perform better than object keys
- **Memory**: Call `clear()` when done to help garbage collection

## 🔗 Interoperability

Compatible with Lodash's `memoize` function cache interface:

```javascript
import _ from "lodash";
import {lru} from "tiny-lru";

_.memoize.Cache = lru().constructor;
const memoized = _.memoize(myFunc);
memoized.cache.max = 10;
```

## 🧪 Testing

Tiny LRU maintains 100% test coverage with comprehensive unit and integration tests.

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

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup

```bash
# Clone and setup
git clone https://github.com/avoidwork/tiny-lru.git
cd tiny-lru
npm install

# Run tests
npm test

# Run benchmarks  
npm run benchmark:all
```

### Guidelines

- **Code Style**: Follow existing style and ESLint rules
- **Tests**: All changes must include tests and maintain 100% coverage
- **Documentation**: Update README.md for API changes
- **Performance**: Consider performance impact of changes

### Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with tests
4. Ensure all tests pass: `npm test`
5. Submit a pull request

---

## 📖 API Reference

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

#### evict()
Removes the least recently used item from cache.

**Returns:** `{Object}` LRU instance

```javascript
cache.set('old', 'value').set('new', 'value');
cache.evict(); // Removes 'old' item
```

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

#### keys()
Returns array of all cache keys in LRU order (first = least recent).

**Returns:** `{Array}` Array of keys

```javascript
cache.set('a', 1).set('b', 2);
cache.get('a'); // Move 'a' to most recent
console.log(cache.keys()); // ['b', 'a']
```

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

---

## 📄 License

Copyright (c) 2025 Jason Mulligan  
Licensed under the BSD-3 license.