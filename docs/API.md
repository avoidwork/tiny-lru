# API Reference

Complete API documentation for tiny-lru.

## Table of Contents

- [Factory Function](#factory-function)
- [LRU Class](#lru-class)
- [Properties](#properties)
  - [first](#first)
  - [last](#last)
  - [max](#max)
  - [resetTTL](#resetttl)
  - [size](#size)
  - [ttl](#ttl)
- [Methods](#methods)
  - [cleanup()](#cleanup)
  - [clear()](#clear)
  - [delete(key)](#deletekey)
  - [entries(keys?)](#entrieskeys)
  - [evict()](#evict)
  - [expiresAt(key)](#expiresatkey)
  - [forEach(callback, thisArg?)](#foreachcallback-thisarg)
  - [get(key)](#getkey)
  - [getMany(keys)](#getmanykeys)
  - [has(key)](#haskey)
  - [hasAll(keys)](#hasallkeys)
  - [hasAny(keys)](#hasanykeys)
  - [keys()](#keys)
  - [keysByTTL()](#keysbyttl)
  - [onEvict(callback)](#onevictcallback)
  - [peek(key)](#peekkey)
  - [set(key, value)](#setkey-value)
  - [setWithEvicted(key, value)](#setwithevictedkey-value)
  - [sizeByTTL()](#sizebyttl)
  - [stats()](#stats)
  - [toJSON()](#tojson)
  - [values(keys?)](#valueskeys)
  - [valuesByTTL()](#valuesbyttl)

---

## Factory Function

### `lru(max?, ttl?, resetTtl?)`

Creates a new LRU cache instance with parameter validation.

```javascript
import { lru } from "tiny-lru";

const cache = lru();
const cache = lru(100);
const cache = lru(100, 5000);
const cache = lru(100, 5000, true);
```

**Parameters:**

| Name       | Type      | Default | Description                                                      |
| ---------- | --------- | ------- | ---------------------------------------------------------------- |
| `max`      | `number`  | `1000`  | Maximum items. `0` = unlimited. Must be >= 0.                    |
| `ttl`      | `number`  | `0`     | Time-to-live in milliseconds. `0` = no expiration. Must be >= 0. |
| `resetTTL` | `boolean` | `false` | Reset TTL when updating existing items via `set()`               |

**Returns:** `LRU` - New cache instance

**Throws:** `TypeError` if parameters are invalid

```javascript
lru(-1); // TypeError: Invalid max value
lru(100, -1); // TypeError: Invalid ttl value
lru(100, 0, "yes"); // TypeError: Invalid resetTtl value
```

---

## LRU Class

### `new LRU(max?, ttl?, resetTtl?)`

Creates an LRU cache instance. Does not validate parameters.

```javascript
import { LRU } from "tiny-lru";

const cache = new LRU(100, 5000, true);
```

**Parameters:**

| Name       | Type      | Default | Description                                        |
| ---------- | --------- | ------- | -------------------------------------------------- |
| `max`      | `number`  | `0`     | Maximum items. `0` = unlimited.                    |
| `ttl`      | `number`  | `0`     | Time-to-live in milliseconds. `0` = no expiration. |
| `resetTTL` | `boolean` | `false` | Reset TTL when updating via `set()`                |

---

## Properties

### `first`

`Object | null` - Least recently used item (node with `key`, `value`, `prev`, `next`, `expiry`).

```javascript
const cache = lru(2);
cache.set("a", 1).set("b", 2);
console.log(cache.first.key); // "a"
console.log(cache.first.value); // 1
```

### `last`

`Object | null` - Most recently used item.

```javascript
const cache = lru(2);
cache.set("a", 1).set("b", 2);
console.log(cache.last.key); // "b"
```

### `max`

`number` - Maximum number of items allowed.

```javascript
const cache = lru(100);
console.log(cache.max); // 100
```

### `resetTTL`

`boolean` - Whether TTL resets on `set()` updates.

```javascript
const cache = lru(100, 5000, true);
console.log(cache.resetTtl); // true
```

### `size`

`number` - Current number of items in cache.

```javascript
const cache = lru(10);
cache.set("a", 1).set("b", 2);
console.log(cache.size); // 2
```

### `ttl`

`number` - Time-to-live in milliseconds. `0` = no expiration.

```javascript
const cache = lru(100, 60000);
console.log(cache.ttl); // 60000
```

---

## Methods

### `cleanup()`

Removes expired items without affecting LRU order. Silently removes expired items without triggering the `onEvict()` callback.

```javascript
cache.set("a", 1).set("b", 2);
// ... wait for items to expire
const removed = cache.cleanup();
console.log(removed); // 2 (number of items removed)
```

**Returns:** `number` - Number of expired items removed

**Note:** Only removes items when TTL is enabled (`ttl > 0`). Does not support method chaining (returns `number`).

---

### `clear()`

Removes all items from cache.

```javascript
cache.set("a", 1).set("b", 2);
cache.clear();
console.log(cache.size); // 0
```

**Returns:** `LRU` - this instance (for chaining)

---

### `delete(key)`

Removes item by key.

```javascript
cache.set("a", 1).set("b", 2);
cache.delete("a");
console.log(cache.has("a")); // false
console.log(cache.size); // 1
```

**Parameters:**

| Name  | Type     | Description   |
| ----- | -------- | ------------- |
| `key` | `string` | Key to delete |

**Returns:** `LRU` - this instance (for chaining)

---

### `entries(keys?)`

Returns `[key, value]` pairs. Without `keys`: returns all entries in LRU order. With `keys`: order matches the input array.

```javascript
cache.set("a", 1).set("b", 2).set("c", 3);
console.log(cache.entries());
// [['a', 1], ['b', 2], ['c', 3]]

console.log(cache.entries(["c", "a"]));
// [['c', 3], ['a', 1]] - order matches input array
```

**Parameters:**

| Name   | Type       | Description                        |
| ------ | ---------- | ---------------------------------- |
| `keys` | `string[]` | Optional specific keys to retrieve |

**Returns:** `Array<(string|*)[]>` - Array of key-value pairs

---

### `evict()`

Removes the least recently used item.

```javascript
cache.set("a", 1).set("b", 2).set("c", 3);
cache.evict();
console.log(cache.has("a")); // false
console.log(cache.keys()); // ['b', 'c']
```

**Returns:** `LRU` - this instance (for chaining)

---

### `expiresAt(key)`

Gets expiration timestamp for a key.

```javascript
const cache = lru(100, 5000);
cache.set("key", "value");
console.log(cache.expiresAt("key")); // timestamp ~5 seconds from now
console.log(cache.expiresAt("nonexistent")); // undefined
```

**Parameters:**

| Name  | Type     | Description  |
| ----- | -------- | ------------ |
| `key` | `string` | Key to check |

**Returns:** `number | undefined` - Expiration timestamp or undefined

---

### `forEach(callback, thisArg?)`

Iterates over cache items in LRU order (least to most recent).

```javascript
cache.set("a", 1).set("b", 2).set("c", 3);
cache.forEach((value, key, cache) => {
  console.log(key, value);
});
// Output:
// a 1
// b 2
// c 3
```

**Parameters:**

| Name      | Type       | Description                             |
| --------- | ---------- | --------------------------------------- |
| `callback` | `function` | Function to call for each item. Signature: `callback(value, key, cache)` |
| `thisArg`  | `*`        | Value to use as `this` when executing callback |

**Returns:** `LRU` - this instance (for chaining)

**Note:** This method traverses the linked list directly and does not update LRU order or check TTL expiration during iteration. Cache modifications during iteration may cause unexpected behavior.

---

### `get(key)`

Retrieves value and promotes to most recently used.

```javascript
cache.set("a", 1).set("b", 2);
cache.get("a"); // 1
console.log(cache.keys()); // ['b', 'a'] - 'a' moved to end
```

Expired items are deleted and return `undefined`.

**Parameters:**

| Name  | Type     | Description     |
| ----- | -------- | --------------- |
| `key` | `string` | Key to retrieve |

**Returns:** `* | undefined` - Value or undefined if not found/expired

---

### `getMany(keys)`

Batch retrieves multiple items. Calls `get()` for each key, so it updates LRU order and may remove expired items.

```javascript
cache.set("a", 1).set("b", 2).set("c", 3);
const result = cache.getMany(["a", "c"]);
console.log(result); // { a: 1, c: 3 }
```

**Parameters:**

| Name   | Type       | Description          |
| ------ | ---------- | -------------------- |
| `keys` | `string[]` | Array of keys to get |

**Returns:** `Object` - Object mapping keys to values (undefined for missing/expired keys)

**Note:** Returns `undefined` for non-existent or expired keys. This method is NOT read-only - it updates LRU order (items move to most recently used) and may delete expired items, affecting `hits`, `misses`, and `deletes` stats.

---

### `has(key)`

Checks if key exists and is not expired.

```javascript
cache.set("a", 1);
cache.has("a"); // true
cache.has("nonexistent"); // false
```

**Parameters:**

| Name  | Type     | Description  |
| ----- | -------- | ------------ |
| `key` | `string` | Key to check |

**Returns:** `boolean`

---

### `hasAll(keys)`

Batch existence check - returns true if ALL keys exist and are not expired.

```javascript
cache.set("a", 1).set("b", 2);
const result = cache.hasAll(["a", "b"]);
console.log(result); // true

cache.hasAll(["a", "nonexistent"]); // false
```

**Parameters:**

| Name   | Type       | Description          |
| ------ | ---------- | -------------------- |
| `keys` | `string[]` | Array of keys to check |

**Returns:** `boolean` - True if all keys exist and are not expired. Returns `true` for empty arrays (vacuous truth).

---

### `hasAny(keys)`

Batch existence check - returns true if ANY key exists and is not expired.

```javascript
cache.set("a", 1).set("b", 2);
cache.hasAny(["nonexistent", "a"]); // true
cache.hasAny(["nonexistent1", "nonexistent2"]); // false
```

**Parameters:**

| Name   | Type       | Description          |
| ------ | ---------- | -------------------- |
| `keys` | `string[]` | Array of keys to check |

**Returns:** `boolean` - True if any key exists and is not expired. Returns `false` for empty arrays.

---

### `keys()`

Returns all keys in LRU order (oldest first).

```javascript
cache.set("a", 1).set("b", 2).set("c", 3);
cache.get("a"); // Promote 'a'
console.log(cache.keys()); // ['b', 'c', 'a']
```

**Returns:** `string[]`

---

### `keysByTTL()`

Returns keys grouped by TTL status.

```javascript
cache.set("a", 1).set("b", 2);
console.log(cache.keysByTTL());
// { valid: ["a", "b"], expired: [], noTTL: ["a", "b"] }
```

**Returns:** `Object` - Object with three properties:
- `valid` - Array of valid (non-expired) keys
- `expired` - Array of expired keys
- `noTTL` - Array of keys without TTL (`expiry === 0`)

---

### `onEvict(callback)`

Registers a callback function to be called when items are evicted.

```javascript
cache.onEvict((item) => {
  console.log("Evicted:", item.key, item.value);
});

cache.set("a", 1).set("b", 2).set("c", 3).set("d", 4);
// Evicted: a 1
```

**Parameters:**

| Name      | Type       | Description                                           |
| --------- | ---------- | ----------------------------------------------------- |
| `callback` | `function` | Function called with evicted item. Receives `{key, value, expiry}` |

**Returns:** `LRU` - this instance (for chaining)

**Throws:** `TypeError` if callback is not a function

**Note:** Only the last registered callback will be used. Triggers on:
- Explicit eviction via `evict()`
- Implicit eviction via `set()`/`setWithEvicted()` when cache is at max capacity
Does NOT trigger on TTL expiry (items are silently removed).

---

### `peek(key)`

Retrieves value without updating LRU order.

```javascript
cache.set("a", 1).set("b", 2);
cache.peek("a"); // 1
console.log(cache.keys()); // ['b', 'a'] - order unchanged
```

**Parameters:**

| Name  | Type     | Description     |
| ----- | -------- | --------------- |
| `key` | `string` | Key to retrieve |

**Returns:** `* | undefined` - Value or undefined if not found

**Note:** Does not perform TTL expiration checks or update LRU order.

---

### `set(key, value)`

Stores value and moves to most recently used.

```javascript
cache.set("a", 1).set("b", 2).set("c", 3);
console.log(cache.keys()); // ['a', 'b', 'c']
```

**Parameters:**

| Name  | Type  | Description |
| ----- | ----- | ----------- |
| `key` | `string` | Item key |
| `value` | `*` | Item value |

**Returns:** `LRU` - this instance (for chaining)

---

### `setWithEvicted(key, value)`

Stores value and returns evicted item if cache was full.

```javascript
const cache = lru(2);
cache.set("a", 1).set("b", 2);

const evicted = cache.setWithEvicted("c", 3);
console.log(evicted); // { key: 'a', value: 1, expiry: 0 }
console.log(cache.keys()); // ['b', 'c']
```

**Parameters:**

| Name  | Type  | Description |
| ----- | ----- | ----------- |
| `key` | `string` | Item key |
| `value` | `*` | Item value |

**Returns:** `{ key, value, expiry } | null` - Evicted item (if any) or `null` when no eviction occurs

**Note:** When updating an existing key with `resetTtl=true`, the TTL is reset but no eviction occurs (returns `null`).

---

### `sizeByTTL()`

Returns counts of items by TTL status.

```javascript
cache.set("a", 1).set("b", 2);
console.log(cache.sizeByTTL());
// { valid: 2, expired: 0, noTTL: 0 }
```

**Returns:** `Object` - Object with three properties:
- `valid` - Number of items that haven't expired
- `expired` - Number of expired items
- `noTTL` - Number of items without TTL (`expiry === 0`)

**Note:** Items without TTL (expiry === 0) count as both valid and noTTL.

---

### `stats()`

Returns cache statistics.

```javascript
cache.set("a", 1).set("b", 2);
cache.get("a");
cache.get("nonexistent");

console.log(cache.stats());
// {
//   hits: 1,
//   misses: 1,
//   sets: 2,
//   deletes: 0,
//   evictions: 0
// }
```

**Returns:** `Object` - Statistics object with the following properties:
- `hits` - Number of successful get() calls
- `misses` - Number of failed get() calls
- `sets` - Number of set() and setWithEvicted() calls
- `deletes` - Number of delete() calls plus internal removal of expired items by get()
- `evictions` - Number of evicted items

---

### `toJSON()`

Serializes cache to JSON-compatible format.

```javascript
cache.set("a", 1).set("b", 2);
const json = cache.toJSON();
console.log(json);
// [
//   { key: "a", value: 1, expiry: 0 },
//   { key: "b", value: 2, expiry: 0 }
// ]

// Works with JSON.stringify:
const jsonString = JSON.stringify(cache);
```

**Returns:** `Array<{key, value, expiry}>` - Array of cache items

---

### `values(keys?)`

Returns values in LRU order.

```javascript
cache.set("a", 1).set("b", 2).set("c", 3);
console.log(cache.values());
// [1, 2, 3]

console.log(cache.values(["c", "a"]));
// [3, 1] - order matches input array
```

**Parameters:**

| Name   | Type       | Description                        |
| ------ | ---------- | ---------------------------------- |
| `keys` | `string[]` | Optional specific keys to retrieve |

**Returns:** `*[]` - Array of values

---

### `valuesByTTL()`

Returns values grouped by TTL status.

```javascript
cache.set("a", 1).set("b", 2);
console.log(cache.valuesByTTL());
// { valid: [1, 2], expired: [], noTTL: [1, 2] }
```

**Returns:** `Object` - Object with three properties:
- `valid` - Array of valid (non-expired) values
- `expired` - Array of expired values
- `noTTL` - Array of values without TTL (when `ttl=0`)

---

## Evicted Item Shape

When `setWithEvicted` returns an evicted item:

```javascript
{
  key: string,      // The evicted key
  value: *,         // The evicted value
  expiry: number    // Expiration timestamp (0 if no TTL)
}
```

---

## Method Chaining

All mutation methods return `this` for chaining (except `cleanup()` which returns `number`):

```javascript
cache.set("a", 1).set("b", 2).set("c", 3).delete("a").evict();

console.log(cache.keys()); // ['c']
```
