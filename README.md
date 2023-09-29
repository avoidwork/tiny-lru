# Tiny LRU

Least Recently Used cache for Client or Server.

## Using the factory

```javascript
import {lru} from "tiny-lru";
const cache = lru(max, ttl = 0, resetTtl = false);
```

## Using the Class

```javascript
import {LRU} from "tiny-lru";
const cache = new LRU(max, ttl = 0, resetTtl = false);
```

```javascript
import {LRU} from "tiny-lru";
class MyCache extends LRU {}
```

## Interoperability

Lodash provides a `memoize` function with a cache that can be swapped out as long as it implements the right interface.
See the [lodash docs](https://lodash.com/docs#memoize) for more on `memoize`.

### Example
```javascript
_.memoize.Cache = lru().constructor;
const memoized = _.memoize(myFunc);
memoized.cache.max = 10;
```

## Testing

Tiny-LRU has 100% code coverage with its tests.

```console
--------------|---------|----------|---------|---------|-------------------
File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------|---------|----------|---------|---------|-------------------
All files     |     100 |    89.85 |     100 |     100 |                  
 tiny-lru.cjs |     100 |    89.85 |     100 |     100 | 11-31,130-138,172
--------------|---------|----------|---------|---------|-------------------
```

## API

## Properties

### first

Item in "first" or "bottom" position; default is `null`

**Example**

```javascript
const cache = lru();

cache.first; // null - it's a new cache!
```

### last

Item in "last" or "top" position; default is `null`

**Example**

```javascript
const cache = lru();

cache.last; // null - it's a new cache!
```

### max

Max items to hold in cache; default is `1000`

**Example**

```javascript
const cache = lru(500);

cache.max; // 500
```

### resetTtl

Resets `item.expiry` with each `set()` if `true`; default is `false`

**Example**

```javascript
const cache = lru(500, 5*6e4, true);

cache.resetTtl; // true
```

### size

Number of items in cache

**Example**

```javascript
const cache = lru();

cache.size; // 0 - it's a new cache!
```

### ttl

Milliseconds an item will remain in cache; lazy expiration upon next `get()` of an item

**Example**

```javascript
const cache = lru(100, 3e4);

cache.ttl; // 30000;
```

## Methods

### clear

Clears the contents of the cache

	return {Object} LRU instance

**Example**

```javascript
cache.clear();
```

### delete

Removes item from cache

	param  {String} key Item key
	return {Object}     LRU instance

**Example**

```javascript
cache.delete("myKey");
```

### entries(*["key1", "key2"]*)

Returns an `Array` cache items

    param  {Array} keys (Optional) Cache item keys to get
	return {Object} LRU instance

**Example**

```javascript
cache.entries(['myKey1', 'myKey2']);
```

### evict

Evicts the least recently used item from cache

	return {Object} LRU instance

**Example**

```javascript
cache.evict();
```

### expiresAt

Gets expiration time for cached item

	param  {String} key Item key
	return {Mixed}      Undefined or number (epoch time)

**Example**

```javascript
const item = cache.expiresAt("myKey");
```

### get

Gets cached item and moves it to the front

	param  {String} key Item key
	return {Mixed}      Undefined or Item value

**Example**

```javascript
const item = cache.get("myKey");
```

### has

Returns a `Boolean` indicating if `key` is in cache

	return {Object} LRU instance

**Example**

```javascript
cache.has('myKey');
```

### keys

Returns an `Array` of cache item keys.

	return {Array} Array of keys

**Example**

```javascript
console.log(cache.keys());
```

### set

Sets item in cache as `first`

	param  {String} key   Item key
	param  {Mixed}  value Item value
	return {Object}       LRU instance

**Example**

```javascript
cache.set("myKey", {prop: true});
```

### values(*["key1", "key2"]*)

Returns an `Array` cache items

	param  {Array} keys (Optional) Cache item keys to get
	return {Array} Cache items

**Example**

```javascript
cache.values(['abc', 'def']);
```

## License
Copyright (c) 2023 Jason Mulligan
Licensed under the BSD-3 license.
