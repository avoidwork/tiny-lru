# Tiny LRU

[![npm version](https://img.shields.io/npm/v/tiny-lru.svg)](https://www.npmjs.com/package/tiny-lru)
[![npm downloads](https://img.shields.io/npm/dm/tiny-lru.svg)](https://www.npmjs.com/package/tiny-lru)
[![License](https://img.shields.io/npm/l/tiny-lru.svg)](https://github.com/avoidwork/tiny-lru/blob/master/LICENSE)
[![Node.js version](https://img.shields.io/node/v/tiny-lru.svg)](https://www.npmjs.com/package/tiny-lru)
[![Build Status](https://github.com/avoidwork/tiny-lru/actions/workflows/ci.yml/badge.svg)](https://github.com/avoidwork/tiny-lru/actions?query=workflow%3Aci)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://app.codecov.io/gh/avoidwork/tiny-lru)

A high-performance, lightweight LRU (Least Recently Used) cache for JavaScript with O(1) operations and optional TTL support.

## What is an LRU Cache?

Think of an LRU cache like a limited-size bookshelf. When you add a new book and the shelf is full, you remove the **least recently used** book to make room. Every time you read a book, it moves to the front. This pattern is perfect for caching where you want to keep the most frequently accessed items.

The tiny-lru library provides:
- **O(1)** operations for get, set, delete, and has
- Optional **TTL (Time-To-Live)** support for automatic expiration
- **Zero dependencies** - pure JavaScript
- **100% test coverage** - fully tested and reliable
- **TypeScript support** - full type definitions included
- **~2.2 KB** minified and gzipped (compared to ~12 KB for lru-cache)

## Installation

```bash
npm install tiny-lru
```

Requires Node.js ≥14 or modern browsers with ES Module support.

## Quick Start

```javascript
import { lru } from "tiny-lru";

// Create a cache that holds up to 100 items
const cache = lru(100);

// Store and retrieve data
cache.set("user:42", { name: "Alice", score: 1500 });
const user = cache.get("user:42"); // { name: "Alice", score: 1500 }

// Chain operations
cache.set("a", 1).set("b", 2).set("c", 3);

// Check what's in the cache
cache.has("a"); // true
cache.size; // 3
cache.keys(); // ['a', 'b', 'c'] (LRU order)
```

### TypeScript

```typescript
import { LRU } from "tiny-lru";

interface User {
  id: number;
  name: string;
}

const cache = new LRU<User>(100);
cache.set("user:1", { id: 1, name: "Alice" });
const user: User | undefined = cache.get("user:1");
```

## With TTL (Time-to-Live)

Items can automatically expire after a set time:

```javascript
// Cache that expires after 5 seconds
const sessionCache = lru(100, 5000);

sessionCache.set("session:id", { userId: 123 });
// After 5 seconds, this returns undefined
sessionCache.get("session:id");
```

Want TTL to reset when you update an item? Enable `resetTtl`:

```javascript
const cache = lru(100, 60000, true); // 1 minute TTL, resets on update
cache.set("key", "value");
cache.set("key", "new value"); // TTL resets
```

## When to Use Tiny LRU

**Great for:**

- API response caching
- Function memoization
- Session storage with expiration
- Rate limiting
- LLM response caching
- Database query result caching
- Any scenario where you want to limit memory usage

**Not ideal for:**

- Non-string keys (works best with strings)
- Very large caches (consider a database)

## API Reference

### Factory Function: `lru(max?, ttl?, resetTtl?)`

Creates a new LRU cache instance with parameter validation.

```javascript
import { lru } from "tiny-lru";

const cache1 = lru(); // 1000 items, no TTL
const cache2 = lru(500); // 500 items, no TTL
const cache3 = lru(100, 30000); // 100 items, 30s TTL
const cache4 = lru(100, 60000, true); // with resetTtl enabled
```

**Parameters:**

| Name       | Type      | Default | Description                                                      |
| ---------- | --------- | ------- | ---------------------------------------------------------------- |
| `max`      | `number`  | `1000`  | Maximum items. `0` = unlimited. Must be >= 0.                    |
| `ttl`      | `number`  | `0`     | Time-to-live in milliseconds. `0` = no expiration. Must be >= 0. |
| `resetTtl` | `boolean` | `false` | Reset TTL when updating existing items via `set()`               |

**Returns:** `LRU` - New cache instance

**Throws:** `TypeError` if parameters are invalid

### Class: `new LRU(max?, ttl?, resetTtl?)`

Creates an LRU cache instance without parameter validation.

```javascript
import { LRU } from "tiny-lru";

const cache = new LRU(100, 5000);
```

**Parameters:**

| Name       | Type      | Default | Description                                        |
| ---------- | --------- | ------- | -------------------------------------------------- |
| `max`      | `number`  | `0`     | Maximum items. `0` = unlimited.                    |
| `ttl`      | `number`  | `0`     | Time-to-live in milliseconds. `0` = no expiration. |
| `resetTtl` | `boolean` | `false` | Reset TTL when updating via `set()`                |

### Properties

| Property  | Type             | Description                                |
| --------- | ---------------- | ------------------------------------------ |
| `first`   | `object` \| `null`  | Least recently used item (node with `key`, `value`, `prev`, `next`, `expiry`) |
| `last`    | `object` \| `null`  | Most recently used item (node with `key`, `value`, `prev`, `next`, `expiry`) |
| `max`     | `number`         | Maximum items allowed                      |
| `resetTtl`| `boolean`        | Whether TTL resets on `set()` updates      |
| `size`    | `number`         | Current number of items                    |
| `ttl`     | `number`         | Time-to-live in milliseconds               |

### Methods

| Method                      | Description                                    |
| --------------------------- | ---------------------------------------------- |
| `cleanup()`                 | Remove expired items without LRU update. Returns count of removed items. |
| `clear()`                   | Remove all items. Returns `this` for chaining. |
| `delete(key)`               | Remove an item by key. Returns `this` for chaining. |
| `entries(keys?)`            | Get `[key, value]` pairs. Without keys: LRU order. With keys: input array order. |
| `evict()`                   | Remove the least recently used item. Returns `this` for chaining. |
| `expiresAt(key)`            | Get expiration timestamp for a key. Returns `number | undefined`. |
| `forEach(callback, thisArg?)` | Iterate over items in LRU order. Returns `this` for chaining. |
| `get(key)`                  | Retrieve a value. Moves item to most recent. Returns value or `undefined`. |
| `getMany(keys)`             | Batch retrieve multiple items. Returns object mapping keys to values. |
| `has(key)`                  | Check if key exists and is not expired. Returns `boolean`. |
| `hasAll(keys)`              | Check if ALL keys exist. Returns `boolean`.    |
| `hasAny(keys)`              | Check if ANY key exists. Returns `boolean`.    |
| `keys()`                    | Get all keys in LRU order (oldest first). Returns `string[]`. |
| `keysByTTL()`               | Get keys by TTL status. Returns `{valid, expired, noTTL}`. |
| `onEvict(callback)`         | Register eviction callback (triggers on `evict()` or when `set()`/`setWithEvicted()` evicts). Returns `this` for chaining. |
| `peek(key)`                 | Retrieve a value without LRU update. Returns value or `undefined`. |
| `set(key, value)`           | Store a value. Returns `this` for chaining.    |
| `setWithEvicted(key, value)` | Store value, return evicted item if full. Returns `{key, value, expiry} | null`. |
| `sizeByTTL()`               | Get counts by TTL status. Returns `{valid, expired, noTTL}`. |
| `stats()`                   | Get cache statistics. Returns `{hits, misses, sets, deletes, evictions}`. |
| `toJSON()`                  | Serialize cache to JSON format. Returns array of items. |
| `values(keys?)`             | Get all values, or values for specific keys. Returns array of values. |
| `valuesByTTL()`             | Get values by TTL status. Returns `{valid, expired, noTTL}`. |

## Common Patterns

### Memoization

```javascript
function memoize(fn, maxSize = 100) {
  const cache = lru(maxSize);

  return function (...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Cache expensive computations
const fib = memoize((n) => (n <= 1 ? n : fib(n - 1) + fib(n - 2)), 50);
fib(100); // fast - cached
fib(100); // even faster - from cache
```

### Cache-Aside Pattern

```javascript
// Cache instance shared across calls (outside the function)
const cache = lru(1000, 60000); // 1 minute cache

async function getUser(userId) {
  // Check cache first
  const cached = cache.get(`user:${userId}`);
  if (cached) {
    return cached;
  }

  // Fetch from database
  const user = await db.users.findById(userId);

  // Store in cache
  cache.set(`user:${userId}`, user);

  return user;
}
```

### Finding What Was Evicted

```javascript
const cache = lru(3);
cache.set("a", 1).set("b", 2).set("c", 3);

const evicted = cache.setWithEvicted("d", 4);
console.log(evicted); // { key: 'a', value: 1, expiry: 0 }

cache.keys(); // ['b', 'c', 'd']
```

## Advanced Usage

### Batch Operations with Keys

```javascript
const cache = lru(100);
cache.set("users:1", { name: "Alice" });
cache.set("users:2", { name: "Bob" });
cache.set("users:3", { name: "Carol" });

// Get values for specific keys (order matches input array)
const values = cache.values(["users:3", "users:1"]);
// ['Carol', 'Alice'] - matches input key order
```

### Interop with Lodash

```javascript
import _ from "lodash";
import { lru } from "tiny-lru";

_.memoize.Cache = lru().constructor;

const slowFunc = _.memoize(expensiveOperation);
slowFunc.cache.max = 100; // Configure cache size
```

### Session and Authentication Caching

```javascript
import { LRU } from "tiny-lru";

class AuthCache {
  constructor() {
    // Session cache: 30 minutes with TTL reset on update
    this.sessions = new LRU(10000, 1800000, true);
    // Token validation cache: 5 minutes, no reset
    this.tokens = new LRU(5000, 300000, false);
    // Permission cache: 15 minutes
    this.permissions = new LRU(5000, 900000);
  }

  cacheSession(sessionId, userData, domain = "app") {
    const key = `${domain}:session:${sessionId}`;
    this.sessions.set(key, {
      userId: userData.userId,
      permissions: userData.permissions,
      loginTime: Date.now(),
      lastActivity: Date.now(),
    });
  }

  getSession(sessionId, domain = "app") {
    const key = `${domain}:session:${sessionId}`;
    return this.sessions.get(key);
  }
}
```

### LLM Response Caching

```javascript
import { LRU } from "tiny-lru";

class LLMCache {
  constructor() {
    // Cache up to 1000 responses for 1 hour
    this.cache = new LRU(1000, 3600000); // 1 hour TTL
  }

  async getResponse(model, prompt, params = {}) {
    const key = this.generateKey(model, prompt, params);

    // Check cache first
    const cached = this.cache.get(key);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    // Make expensive API call
    const response = await this.callLLMAPI(model, prompt, params);

    // Cache the response
    this.cache.set(key, {
      response: response.text,
      tokens: response.tokens,
      timestamp: Date.now(),
    });

    return { ...response, fromCache: false };
  }

  generateKey(model, prompt, params = {}) {
    const paramsHash = this.hashObject(params);
    const promptHash = this.hashString(prompt);
    return `llm:${model}:${promptHash}:${paramsHash}`;
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  hashObject(obj) {
    return this.hashString(JSON.stringify(obj, Object.keys(obj).sort()));
  }
}
```

## Why Tiny LRU?

| Feature          | tiny-lru     | lru-cache   | quick-lru   |
| ---------------- | ------------ | ----------- | ----------- |
| Bundle size      | ~2.2 KB      | ~12 KB      | ~1.5 KB     |
| O(1) operations  | ✅           | ✅          | ✅          |
| TTL support      | ✅           | ✅          | ✅          |
| TypeScript       | ✅           | ✅          | ✅          |
| Zero dependencies| ✅           | ❌          | ✅          |
| Pure LRU         | ✅           | ❌*         | ✅          |

\* lru-cache uses a hybrid design that can hold 2× the specified size for performance

## Performance

All core operations are O(1):

- **Set**: Add or update items
- **Get**: Retrieve and promote to most recent
- **Delete**: Remove items
- **Has**: Quick existence check

### Benchmarks

Run our comprehensive benchmark suite to see performance characteristics:

```bash
npm run benchmark:all
```

See [benchmarks/README.md](https://github.com/avoidwork/tiny-lru/blob/master/benchmarks/README.md) for more details.

## Development

```bash
npm install           # Install dependencies
npm test             # Run lint and tests
npm run lint         # Lint and check formatting
npm run fix          # Fix lint and formatting issues
npm run build        # Build distribution files
npm run coverage     # Generate test coverage report
```

### Build Output

Build produces multiple module formats:
- `dist/tiny-lru.js` - ES Modules
- `dist/tiny-lru.cjs` - CommonJS
- `dist/tiny-lru.min.js` - Minified ESM
- `types/lru.d.ts` - TypeScript definitions

## Tests

| Metric    | Count |
| --------- | ----- |
| Tests     | 149   |
| Suites    | 26    |

## Test Coverage

| Metric    | Coverage |
| --------- | -------- |
| Lines     | 100%     |
| Branches  | 99.28%   |
| Functions | 100%     |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run `npm test` to ensure all tests pass
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Security

### Multi-Domain Key Convention

Implement a hierarchical key naming convention to prevent cross-domain data leakage:

```
{domain}:{service}:{resource}:{identifier}[:{version}]
```

Example domains:
- User-related: `usr:profile:data:12345`
- Authentication: `auth:login:session:abc123`
- External API: `api:response:endpoint:hash`
- Database: `db:query:sqlhash:paramshash`
- Application: `app:cache:feature:value`
- System: `sys:config:feature:version`
- Analytics: `analytics:event:user:session`
- ML/AI: `ml:llm:response:gpt4-hash`

## Documentation

- [API Reference](https://github.com/avoidwork/tiny-lru/blob/master/docs/API.md) - Complete API documentation
- [Technical Documentation](https://github.com/avoidwork/tiny-lru/blob/master/docs/TECHNICAL_DOCUMENTATION.md) - Architecture, performance, and security
- [Code Style Guide](https://github.com/avoidwork/tiny-lru/blob/master/docs/CODE_STYLE_GUIDE.md) - Contributing guidelines

## License

Copyright (c) 2026, Jason Mulligan

BSD-3-Clause
