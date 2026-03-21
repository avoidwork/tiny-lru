# Tiny LRU

A fast, lightweight LRU (Least Recently Used) cache for JavaScript with O(1) operations and optional TTL support.

## What is an LRU Cache?

Think of an LRU cache like a limited-size bookshelf. When you add a new book and the shelf is full, you remove the **least recently used** book to make room. Every time you read a book, it moves to the front. This pattern is perfect for caching where you want to keep the most frequently accessed items.

## Installation

```bash
npm install tiny-lru
```

Requires Node.js ≥12.

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
cache.has("a");        // true
cache.size;            // 3
cache.keys();          // ['a', 'b', 'c'] (LRU order)
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
- Any scenario where you want to limit memory usage

**Not ideal for:**
- Non-string keys (works best with strings)
- Very large caches (consider a database)

## API Reference

### Factory Function: `lru(max?, ttl?, resetTtl?)`

```javascript
import { lru } from "tiny-lru";

const cache = lru();                    // 1000 items, no TTL
const cache = lru(500);                // 500 items, no TTL
const cache = lru(100, 30000);         // 100 items, 30s TTL
const cache = lru(100, 60000, true);  // with resetTtl enabled
```

### Class: `new LRU(max?, ttl?, resetTtl?)`

```javascript
import { LRU } from "tiny-lru";

const cache = new LRU(100, 5000);
```

### Methods

| Method | Description |
|--------|-------------|
| `set(key, value)` | Store a value. Returns `this` for chaining. |
| `get(key)` | Retrieve a value. Moves item to most recent. |
| `has(key)` | Check if key exists and is not expired. |
| `delete(key)` | Remove an item. Returns `this` for chaining. |
| `clear()` | Remove all items. Returns `this` for chaining. |
| `evict()` | Remove the least recently used item. |
| `keys()` | Get all keys in LRU order (oldest first). |
| `values(keys?)` | Get all values, or values for specific keys. |
| `entries(keys?)` | Get `[key, value]` pairs in LRU order. |
| `expiresAt(key)` | Get expiration timestamp for a key. |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `size` | number | Current number of items |
| `max` | number | Maximum items allowed |
| `ttl` | number | Time-to-live in milliseconds |
| `first` | object | Least recently used item |
| `last` | object | Most recently used item |

## Common Patterns

### Memoization

```javascript
function memoize(fn, maxSize = 100) {
  const cache = lru(maxSize);
  
  return function(...args) {
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
const fib = memoize(n => n <= 1 ? n : fib(n - 1) + fib(n - 2), 50);
fib(100); // fast - cached
fib(100); // even faster - from cache
```

### Cache-Aside Pattern

```javascript
async function getUser(userId) {
  const cache = lru(1000, 60000); // 1 minute cache
  
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

// Get values for specific keys
const values = cache.values(["users:3", "users:1"]);
// ['Carol', 'Alice'] - maintains LRU order
```

### Interop with Lodash

```javascript
import _ from "lodash";
import { lru } from "tiny-lru";

_.memoize.Cache = lru().constructor;

const slowFunc = _.memoize(expensiveOperation);
slowFunc.cache.max = 100; // Configure cache size
```

## Performance

All core operations are O(1):
- **Set**: Add or update items
- **Get**: Retrieve and promote to most recent
- **Delete**: Remove items
- **Has**: Quick existence check

## Development

```bash
npm install           # Install dependencies
npm test             # Run lint and tests
npm run lint         # Lint code
npm run fmt          # Format code
npm run build        # Build distribution files
```

## License

BSD-3-Clause
