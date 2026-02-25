# 🚀 Tiny LRU

A high-performance, lightweight Least Recently Used (LRU) cache implementation for JavaScript. All core operations (get, set, delete) run in O(1) time with optional TTL support.

## 📦 Installation

```bash
npm install tiny-lru
```

**Requirements:** Node.js ≥12

## ⚡ Quick Start

```javascript
import {lru} from "tiny-lru";

// Basic cache with max 100 items
const cache = lru(100);
cache.set('key1', 'value1');
console.log(cache.get('key1')); // 'value1'

// With TTL (5 second expiration)
const cacheWithTtl = lru(50, 5000);
cacheWithTtl.set('session', 'abc123');
// Automatically expires after 5 seconds

// With TTL reset on get
const cacheResetTtl = lru(25, 10000, true);
cacheResetTtl.set('user:123', 'John');
console.log(cacheResetTtl.get('user:123')); // Updates TTL
```

## 📑 Table of Contents

- [Features](#-features)
- [API Reference](#-api-reference)
- [Installation](#-installation)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Development](#-development)
- [License](#-license)

## ✨ Features

- **O(1) Operations** - Fast get, set, and delete operations
- **TTL Support** - Optional time-to-live with automatic expiration
- **TTL Reset** - Configurable TTL reset behavior on access
- **TypeScript Ready** - Full TypeScript support
- **Universal** - Works in Node.js and browsers
- **Compact** - Small bundle size

## 📖 API Reference

### Factory Function

#### `lru(max, ttl, resetTtl)`

Creates a new LRU cache instance with parameter validation.

**Parameters:**
- `max` `{Number}` - Maximum number of items (default: 1000; 0 = unlimited)
- `ttl` `{Number}` - Time-to-live in milliseconds (default: 0; 0 = no expiration)
- `resetTtl` `{Boolean}` - Reset TTL when accessing existing items via `get()` (default: false)

**Returns:** `{LRU}` New LRU cache instance

**Throws:** `{TypeError}` When parameters are invalid

```javascript
import {lru} from "tiny-lru";

// Basic cache
const cache = lru(100);

// With TTL
const cacheWithTtl = lru(50, 30000); // 30 second TTL

// With resetTtl enabled
const resetCache = lru(25, 10000, true);

// Validation errors
lru(-1);          // TypeError: Invalid max value
lru(100, -1);     // TypeError: Invalid ttl value
lru(100, 0, "no"); // TypeError: Invalid resetTtl value
```

### Properties

#### `first`
`{Object|null}` - Item in first (least recently used) position

#### `last`
`{Object|null}` - Item in last (most recently used) position

#### `max`
`{Number}` - Maximum number of items to store

#### `resetTtl`
`{Boolean}` - Whether to reset TTL when accessing existing items via `get()`

#### `size`
`{Number}` - Current number of items in cache

#### `ttl`
`{Number}` - TTL in milliseconds (0 = no expiration)

### Methods

#### `clear()`
Removes all items from cache.

```javascript
cache.clear();
```

#### `delete(key)`
Removes specified item from cache.

```javascript
cache.delete('key1');
```

#### `entries([keys])`
Returns array of cache items as `[key, value]` pairs.

```javascript
cache.entries(); // [['a', 1], ['b', 2]]
cache.entries(['a']); // [['a', 1]]
```

#### `evict([bypass])`
Removes the least recently used item from cache.

```javascript
cache.evict(); // Removes first item
```

#### `expiresAt(key)`
Gets expiration timestamp for cached item.

```javascript
const cache = new LRU(100, 5000);
cache.set('key1', 'value1');
console.log(cache.expiresAt('key1')); // timestamp 5 seconds from now
```

#### `get(key)`
Retrieves cached item and promotes it to most recently used position.

```javascript
console.log(cache.get('key1')); // value1
console.log(cache.get('nonexistent')); // undefined
```

Note: `get()` does not reset or extend TTL. TTL is only reset on `set()` when `resetTtl` is `true`.

#### `has(key)`
Checks if key exists in cache (without promoting it).

```javascript
console.log(cache.has('key1')); // true
console.log(cache.has('nonexistent')); // false
```

#### `keys()`
Returns array of all cache keys in LRU order (first = least recent).

```javascript
cache.keys(); // ['a', 'b'] (least to most recent)
```

#### `set(key, value)`
Stores item in cache as most recently used.

```javascript
cache.set('key1', 'value1')
     .set('key2', 'value2');
```

#### `setWithEvicted(key, value)`
Stores item and returns evicted item if cache was full.

```javascript
const cache = new LRU(2);
cache.set('a', 1).set('b', 2);
const evicted = cache.setWithEvicted('c', 3); // evicted = {key: 'a', value: 1, ...}
```

#### `values([keys])`
Returns array of cache values.

```javascript
cache.values(); // [1, 2]
cache.values(['a']); // [1]
```

## 🚀 Getting Started

### Installation

```bash
npm install tiny-lru
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

// With resetTtl enabled for set()
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
</script>
```

### TypeScript Usage

```typescript
import {lru, LRU} from "tiny-lru";

// Type-safe cache
const cache = lru<string>(100);
cache.set('user:123', 'John Doe');
const user: string | undefined = cache.get('user:123');

// Class inheritance
class MyCache extends LRU<User> {
  constructor() {
    super(1000, 60000, true); // 1000 items, 1 min TTL, reset TTL on set
  }
}
```

## 💡 Usage

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
  return n * n * n;
}, 50);

console.log(expensiveCalculation(5)); // 125
console.log(expensiveCalculation(5)); // 125 (cached)
```

## 🛠️ Development

### Testing

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Build distribution files
npm run build
```

### Contributing

```bash
# Clone and setup
git clone https://github.com/avoidwork/tiny-lru.git
cd tiny-lru
npm install

# Run tests
npm test

# Run linting
npm run lint

# Build
npm run build
```

## 📄 License

Copyright (c) 2026 Jason Mulligan
Licensed under the BSD-3 license.