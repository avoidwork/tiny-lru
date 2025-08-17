# 🚀 Tiny LRU

[![npm version](https://badge.fury.io/js/tiny-lru.svg)](https://badge.fury.io/js/tiny-lru)
[![Node.js Version](https://img.shields.io/node/v/tiny-lru.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![Build Status](https://github.com/avoidwork/tiny-lru/actions/workflows/ci.yml/badge.svg)](https://github.com/avoidwork/tiny-lru/actions)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/avoidwork/tiny-lru)

A **high-performance, lightweight** LRU cache for JavaScript with **strong UPDATE performance and competitive SET/GET/DELETE**, and a **compact bundle size**. Built for developers who need fast caching without compromising on features.

## 📦 Installation

```bash
npm install tiny-lru
# or
yarn add tiny-lru  
# or
pnpm add tiny-lru
```

**Requirements:** Node.js ≥12

## ⚡ Quick Start

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

## 📑 Table of Contents

- [✨ Features & Benefits](#-features--benefits)
- [📊 Performance Deep Dive](#-performance-deep-dive)
- [🔢 Mathematical Representation](#-mathematical-representation)
- [📖 API Reference](#-api-reference)
- [🚀 Getting Started](#-getting-started)
- [💡 Real-World Examples](#-real-world-examples)
- [🔗 Interoperability](#-interoperability)
- [🛠️ Development](#️-development)
- [📄 License](#-license)

## ✨ Features & Benefits

### Why Choose Tiny LRU?

- **🔄 Strong Cache Updates** - Excellent performance in update-heavy workloads
- **📦 Compact Bundle** - Just ~2.2 KiB minified for a full-featured LRU library
- **⚖️ Balanced Performance** - Competitive across all operations with O(1) complexity
- **⏱️ TTL Support** - Optional time-to-live with automatic expiration
- **🔄 Method Chaining** - Fluent API for better developer experience
- **🎯 TypeScript Ready** - Full TypeScript support with complete type definitions
- **🌐 Universal Compatibility** - Works seamlessly in Node.js and browsers
- **🛡️ Production Ready** - Battle-tested and reliable

### Benchmark Comparison (Mean of 5 runs)

| Library | SET ops/sec | GET ops/sec | UPDATE ops/sec | DELETE ops/sec |
|---------|-------------|-------------|----------------|----------------|
| **tiny-lru** | 404,753 | 1,768,449 | 1,703,716 | 298,770 |
| lru-cache | 326,221 | 1,069,061 | 878,858 | 277,734 |
| quick-lru | 591,683 | 1,298,487 | 935,481 | 359,600 |
| mnemonist | 412,467 | 2,478,778 | 2,156,690 | 0 |

Notes:
- Mean values computed from the Performance Summary across 5 consecutive runs of `npm run benchmark:comparison`.
- mnemonist lacks a compatible delete method in this harness, so DELETE ops/sec is 0.
- Performance varies by hardware, Node.js version, and workload patterns; run the provided benchmarks locally to assess your specific use case.
- Environment: Node.js v24.5.0, macOS arm64.

## 📊 Performance Deep Dive

### When to Choose Tiny LRU

**✅ Perfect for:**
- **Frequent cache updates** - Leading UPDATE performance 
- **Mixed read/write workloads** - Balanced across all operations
- **Bundle size constraints** - Compact library with full features
- **Production applications** - Battle-tested with comprehensive testing

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

const resetCache = lru(25, 10000, true);
resetCache.set('session', 'user123');
// Because resetTtl is true, TTL resets when you set() the same key again
```

### CDN Usage (Browser)

```html
<!-- ES Modules -->
<script type="module">
  import {lru, LRU} from 'https://cdn.skypack.dev/tiny-lru';
  const cache = lru(100);
</script>

<!-- UMD Bundle (global: window.lru) -->
<script src="https://unpkg.com/tiny-lru/dist/tiny-lru.umd.js"></script>
<script>
  const {lru, LRU} = window.lru;
  const cache = lru(100);
  // or: const cache = new LRU(100);
</script>
```

### TypeScript Usage

```typescript
import {lru, LRU} from "tiny-lru";

// Type-safe cache
const cache = lru<string>(100);
// or: const cache: LRU<string> = lru<string>(100);
cache.set('user:123', 'John Doe');
const user: string | undefined = cache.get('user:123');

// Class inheritance
class MyCache extends LRU<User> {
  constructor() {
    super(1000, 60000, true); // 1000 items, 1 min TTL, reset TTL on set
  }
}
```

### Configuration Options

#### Factory Function
```javascript
import {lru} from "tiny-lru";

const cache = lru(max, ttl = 0, resetTtl = false);
```

**Parameters:**
- `max` `{Number}` - Maximum number of items (0 = unlimited, default: 1000)
- `ttl` `{Number}` - Time-to-live in milliseconds (0 = no expiration, default: 0)
- `resetTtl` `{Boolean}` - Reset TTL when updating existing items via `set()` (default: false)

#### Class Constructor
```javascript
import {LRU} from "tiny-lru";

const cache = new LRU(1000, 60000, true); // 1000 items, 1 min TTL, reset TTL on set
```

#### Best Practices
```javascript
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

#### Optimization Tips
- **Cache Size**: Keep cache size reasonable (1000-10000 items for most use cases)
- **TTL Usage**: Only use TTL when necessary; it adds overhead
- **Key Types**: String keys perform better than object keys
- **Memory**: Call `clear()` when done to help garbage collection

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
    // 30 minute TTL, with resetTtl enabled for set()
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
    // get() does not extend TTL; to extend, set the session again when resetTtl is true
    return this.sessions.get(sessionId);
  }

  endSession(sessionId) {
    this.sessions.delete(sessionId);
  }
}
```



## 🔗 Interoperability

Compatible with Lodash's `memoize` function cache interface:

```javascript
import _ from "lodash";
import {lru} from "tiny-lru";

_.memoize.Cache = lru().constructor;
const memoized = _.memoize(myFunc);
memoized.cache.max = 10;
```

## 🛠️ Development

### Testing

Tiny LRU maintains 100% test coverage with comprehensive unit and integration tests.

```bash
# Run all tests with coverage
npm test

# Run tests with verbose output
npm run mocha

# Lint code
npm run lint

# Full build (lint + build)
npm run build
```

**Test Coverage:** 100% coverage across all modules

```console
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 lru.js   |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------
```

### Contributing

#### Quick Start for Contributors

```bash
# Clone and setup
git clone https://github.com/avoidwork/tiny-lru.git
cd tiny-lru
npm install

# Run tests
npm test

# Run linting
npm run lint

# Run benchmarks  
npm run benchmark:all

# Build distribution files
npm run build
```

#### Development Workflow

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Develop** your changes with tests
5. **Test** thoroughly: `npm test && npm run lint`
6. **Commit** using conventional commits: `git commit -m "feat: add amazing feature"`
7. **Push** to your fork: `git push origin feature/amazing-feature`
8. **Submit** a Pull Request

#### Contribution Guidelines

- **Code Quality**: Follow ESLint rules and existing code style
- **Testing**: Maintain 100% test coverage for all changes
- **Documentation**: Update README.md and JSDoc for API changes  
- **Performance**: Benchmark changes that could impact performance
- **Compatibility**: Ensure Node.js ≥12 compatibility
- **Commit Messages**: Use [Conventional Commits](https://conventionalcommits.org/) format

---

## 🔢 Mathematical Representation

### Core Operations

The LRU cache maintains a doubly-linked list $L$ and a hash table $H$ for O(1) operations:

**Data Structure:**
- $L = (first, last, size)$ - Doubly-linked list with head/tail pointers
- $H: K \rightarrow V$ - Hash table mapping keys to values
- $max \in \mathbb{N}_0$ - Maximum cache size (0 = unlimited)
- $ttl \in \mathbb{N}_0$ - Time-to-live in milliseconds

**Core Methods:**

#### Set Operation: $set(k, v) \rightarrow \text{LRU}$
$$\begin{align}
set(k, v) &= \begin{cases}
update(k, v) & \text{if } k \in H \\
insert(k, v) & \text{if } k \notin H
\end{cases} \\
update(k, v) &= H[k].value \leftarrow v \land moveToEnd(H[k]) \\
insert(k, v) &= \begin{cases}
evict() \land create(k, v) & \text{if } size = max > 0 \\
create(k, v) & \text{otherwise}
\end{cases} \\
create(k, v) &= H[k] \leftarrow \{key: k, value: v, prev: last, next: null, expiry: t_{now} + ttl\} \\
& \quad \land last \leftarrow H[k] \land size \leftarrow size + 1
\end{align}$$

**Time Complexity:** $O(1)$ amortized

#### Get Operation: $get(k) \rightarrow V \cup \{\bot\}$
$$\begin{align}
get(k) &= \begin{cases}
moveToEnd(H[k]) \land H[k].value & \text{if } k \in H \land (ttl = 0 \lor H[k].expiry > t_{now}) \\
\bot & \text{otherwise}
\end{cases}
\end{align}$$

**Time Complexity:** $O(1)$

#### Delete Operation: $delete(k) \rightarrow \text{LRU}$
$$\begin{align}
delete(k) &= \begin{cases}
removeFromList(H[k]) \land H \setminus \{k\} \land size \leftarrow size - 1 & \text{if } k \in H \\
\text{no-op} & \text{otherwise}
\end{cases}
\end{align}$$

**Time Complexity:** $O(1)$

#### Move to End: $moveToEnd(item)$
$$\begin{align}
moveToEnd(item) &= \begin{cases}
\text{no-op} & \text{if } item = last \\
removeFromList(item) \land appendToList(item) & \text{otherwise}
\end{cases}
\end{align}$$

**Time Complexity:** $O(1)$

### Eviction Policy

**LRU Eviction:** When $size = max > 0$ and inserting a new item:

$$evict() = \begin{cases}
first \leftarrow first.next \land H \setminus \{first.key\} \land size \leftarrow size - 1 & \text{if } size > 0 \\
\text{no-op} & \text{otherwise}
\end{cases}$$

### TTL Expiration

**Expiration Check:** For any operation accessing key $k$:

$$isExpired(k) = ttl > 0 \land H[k].expiry \leq t_{now}$$

**Automatic Cleanup:** Expired items are removed on access:

$$cleanup(k) = \begin{cases}
delete(k) & \text{if } isExpired(k) \\
\text{no-op} & \text{otherwise}
\end{cases}$$

### Space Complexity

- **Worst Case:** $O(n)$ where $n = \min(size, max)$
- **Hash Table:** $O(n)$ for key-value storage
- **Linked List:** $O(n)$ for LRU ordering
- **Per Item Overhead:** Constant space for prev/next pointers and metadata

### Invariants

1. **Size Constraint:** $0 \leq size \leq max$ (when $max > 0$)
2. **List Consistency:** $first \neq null \iff last \neq null \iff size > 0$
3. **Hash Consistency:** $|H| = size$
4. **LRU Order:** Items in list are ordered from least to most recently used
5. **TTL Validity:** $ttl = 0 \lor \forall k \in H: H[k].expiry > t_{now}$

## 📖 API Reference

### Factory Function

#### lru(max, ttl, resetTtl)

Creates a new LRU cache instance using the factory function.

**Parameters:**
- `max` `{Number}` - Maximum number of items to store (default: 1000; 0 = unlimited)
- `ttl` `{Number}` - Time-to-live in milliseconds (default: 0; 0 = no expiration)  
- `resetTtl` `{Boolean}` - Reset TTL when updating existing items via `set()` (default: false)

**Returns:** `{LRU}` New LRU cache instance

**Throws:** `{TypeError}` When parameters are invalid

```javascript
import {lru} from "tiny-lru";

// Basic cache
const cache = lru(100);

// With TTL
const cacheWithTtl = lru(50, 30000); // 30 second TTL

// With resetTtl enabled for set()
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
`{Boolean}` - Whether to reset TTL when updating existing items via `set()`

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

Note: `get()` does not reset or extend TTL. TTL is only reset on `set()` when `resetTtl` is `true`.

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