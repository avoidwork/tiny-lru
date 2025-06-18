# Tiny LRU

A lightweight, high-performance Least Recently Used (LRU) cache implementation for JavaScript with optional TTL (time-to-live) support. Works in both Node.js and browser environments.

## Installation

```bash
npm install tiny-lru
```

## Usage

### Factory Function
```javascript
import {lru} from "tiny-lru";
const cache = lru(max, ttl = 0, resetTtl = false);
```

### Class Constructor
```javascript
import {LRU} from "tiny-lru";
const cache = new LRU(max, ttl = 0, resetTtl = false);
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

- **max** `{Number}` - Maximum number of items to store (default: 1000)
- **ttl** `{Number}` - Time-to-live in milliseconds, 0 disables expiration (default: 0)
- **resetTtl** `{Boolean}` - Reset TTL on each `set()` operation (default: false)

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

Tiny-LRU maintains 100% code coverage:

```console
--------------|---------|----------|---------|---------|-------------------
File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------|---------|----------|---------|---------|-------------------
All files     |     100 |    96.34 |     100 |     100 |                   
 tiny-lru.cjs |     100 |    96.34 |     100 |     100 | 190,225,245       
--------------|---------|----------|---------|---------|-------------------
```

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
cache.delete("myKey");
```

#### entries([keys])
Returns array of cache items as `[key, value]` pairs.

**Parameters:**
- `keys` `{Array}` - Optional array of specific keys to retrieve

**Returns:** `{Array}` Array of `[key, value]` pairs

```javascript
cache.entries(); // All entries
cache.entries(['key1', 'key2']); // Specific entries
```

#### evict()
Removes the least recently used item from cache.

**Returns:** `{Object}` LRU instance

```javascript
cache.evict();
```

#### expiresAt(key)
Gets expiration timestamp for cached item.

**Parameters:**
- `key` `{String}` - Item key

**Returns:** `{Number|undefined}` Expiration time (epoch milliseconds) or undefined

```javascript
const expiry = cache.expiresAt("myKey");
```

#### get(key)
Retrieves cached item and promotes it to most recently used position.

**Parameters:**
- `key` `{String}` - Item key

**Returns:** `{*}` Item value or undefined if not found/expired

```javascript
const value = cache.get("myKey");
```

#### has(key)
Checks if key exists in cache (without promoting it).

**Parameters:**
- `key` `{String}` - Item key

**Returns:** `{Boolean}` True if key exists and is not expired

```javascript
if (cache.has('myKey')) {
  // Key exists
}
```

#### keys()
Returns array of all cache keys in LRU order (first = least recent).

**Returns:** `{Array}` Array of keys

```javascript
const keys = cache.keys();
```

#### set(key, value)
Stores item in cache as most recently used.

**Parameters:**
- `key` `{String}` - Item key
- `value` `{*}` - Item value

**Returns:** `{Object}` LRU instance

```javascript
cache.set("myKey", {prop: true});
cache.set("user:123", userData);
```

#### setWithEvicted(key, value)
Stores item and returns evicted item if cache was full.

**Parameters:**
- `key` `{String}` - Item key
- `value` `{*}` - Item value

**Returns:** `{Object|null}` Evicted item `{key, value}` or null

```javascript
const evicted = cache.setWithEvicted("myKey", {prop: true});
if (evicted) {
  console.log(`Evicted: ${evicted.key}`, evicted.value);
}
```

#### values([keys])
Returns array of cache values.

**Parameters:**
- `keys` `{Array}` - Optional array of specific keys to retrieve

**Returns:** `{Array}` Array of values

```javascript
const allValues = cache.values();
const specificValues = cache.values(['key1', 'key2']);
```

## Examples

### Basic Usage
```javascript
import {lru} from "tiny-lru";

const cache = lru(100); // Max 100 items
cache.set("user:123", {name: "John", age: 30});
cache.set("session:abc", {token: "xyz", expires: Date.now()});

const user = cache.get("user:123"); // Promotes to most recent
console.log(cache.size); // 2
```

### TTL with Auto-Expiration
```javascript
import {LRU} from "tiny-lru";

const cache = new LRU(50, 5000); // 50 items, 5s TTL
cache.set("temp-data", {result: "computed"});

setTimeout(() => {
  console.log(cache.get("temp-data")); // undefined - expired
}, 6000);
```

### Reset TTL on Access
```javascript
const cache = lru(100, 10000, true); // Reset TTL on each set()
cache.set("session", {user: "admin"});
// Each subsequent set() resets the 10s TTL
```

## License
Copyright (c) 2025 Jason Mulligan  
Licensed under the BSD-3 license.
