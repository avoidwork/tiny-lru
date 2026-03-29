# API Reference

Complete API documentation for tiny-lru.

## Table of Contents

- [Factory Function](#factory-function)
- [LRU Class](#lru-class)
- [Properties](#properties)
- [Methods](#methods)

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
| `resetTtl` | `boolean` | `false` | Reset TTL when updating existing items via `set()`               |

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
| `resetTtl` | `boolean` | `false` | Reset TTL when updating via `set()`                |

---

## Properties

### `size`

`number` - Current number of items in cache.

```javascript
const cache = lru(10);
cache.set("a", 1).set("b", 2);
console.log(cache.size); // 2
```

### `max`

`number` - Maximum number of items allowed.

```javascript
const cache = lru(100);
console.log(cache.max); // 100
```

### `ttl`

`number` - Time-to-live in milliseconds. `0` = no expiration.

```javascript
const cache = lru(100, 60000);
console.log(cache.ttl); // 60000
```

### `resetTtl`

`boolean` - Whether TTL resets on `set()` updates.

```javascript
const cache = lru(100, 5000, true);
console.log(cache.resetTtl); // true
```

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

---

## Methods

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

Returns `[key, value]` pairs in LRU order.

```javascript
cache.set("a", 1).set("b", 2).set("c", 3);
console.log(cache.entries());
// [['a', 1], ['b', 2], ['c', 3]]

console.log(cache.entries(["c", "a"]));
// [['c', 3], ['a', 1]] - respects LRU order
```

**Parameters:**

| Name   | Type       | Description                        |
| ------ | ---------- | ---------------------------------- |
| `keys` | `string[]` | Optional specific keys to retrieve |

**Returns:** `Array<[string, *]>` - Array of key-value pairs

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

### `keys()`

Returns all keys in LRU order (oldest first).

```javascript
cache.set("a", 1).set("b", 2).set("c", 3);
cache.get("a"); // Promote 'a'
console.log(cache.keys()); // ['b', 'c', 'a']
```

**Returns:** `string[]`

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

**Returns:** `{ key, value, expiry } | null` - Evicted item or null

---

### `values(keys?)`

Returns values in LRU order.

```javascript
cache.set("a", 1).set("b", 2).set("c", 3);
console.log(cache.values());
// [1, 2, 3]

console.log(cache.values(["c", "a"]));
// [3, 1] - respects LRU order
```

**Parameters:**

| Name   | Type       | Description                        |
| ------ | ---------- | ---------------------------------- |
| `keys` | `string[]` | Optional specific keys to retrieve |

**Returns:** `*[]` - Array of values

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

All mutation methods return `this` for chaining:

```javascript
cache.set("a", 1).set("b", 2).set("c", 3).delete("a").evict();

console.log(cache.keys()); // ['c']
```
