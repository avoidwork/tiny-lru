# Tiny LRU

## What is Tiny LRU?

**Tiny LRU** is a tool that helps programs remember things for a short time, so they can work faster and use less memory. It's useful for both websites and apps.

### What is a "Cache"?
A cache is like a small, quick-access box where a program stores things it might need again soon. Instead of looking up information from scratch every time (which can be slow), it checks the cache first.

### What does "Least Recently Used" (LRU) mean?
Imagine your cache is a box that can only fit a certain number of items. When the box is full and you want to add something new, you remove the item you haven't used in the longest time. This keeps the most recently used things handy, and clears out the old things you don't need anymore.

### Why use Tiny LRU?
- **Speeds things up**: By remembering recent information, programs can respond faster.
- **Saves resources**: Limits how much memory is used by only keeping the most important items.
- **Works anywhere**: Can be used in many kinds of apps, big or small.

### When is it helpful?
- Websites that show the same info to many people
- Apps that look up data from the internet
- Any program that wants to avoid repeating slow or expensive work


## How Does Tiny LRU Work?
1. You set a limit for how many things the cache can remember.
2. When the program needs to remember something, it puts it in the cache.
3. If the cache is full, it removes the oldest unused item to make space.
4. If the program needs something, it checks the cache first before doing extra work.


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
All files     |     100 |    91.46 |     100 |     100 |                   
 tiny-lru.cjs |     100 |    91.46 |     100 |     100 | 11-31,134,181,215 
--------------|---------|----------|---------|---------|-------------------
```


## API Reference

### Properties

#### first

Item in "first" or "bottom" position; default is `null`

```javascript
const cache = lru();

cache.first; // null - it's a new cache!
```

#### last

Item in "last" or "top" position; default is `null`

```javascript
const cache = lru();

cache.last; // null - it's a new cache!
```

#### max

Max items to hold in cache; default is `1000`

```javascript
const cache = lru(500);

cache.max; // 500
```

#### resetTtl

Resets `item.expiry` with each `set()` if `true`; default is `false`

```javascript
const cache = lru(500, 5*6e4, true);

cache.resetTtl; // true
```

#### size

Number of items in cache

```javascript
const cache = lru();

cache.size; // 0 - it's a new cache!
```

#### ttl

Milliseconds an item will remain in cache; lazy expiration upon next `get()` of an item

```javascript
const cache = lru(100, 3e4);

cache.ttl; // 30000;
```

### Methods

#### clear

Clears the contents of the cache

	return {Object} LRU instance

```javascript
cache.clear();
```

#### delete

Removes item from cache

	param  {String} key Item key
	return {Object}     LRU instance

```javascript
cache.delete("myKey");
```

#### entries(*["key1", "key2"]*)

Returns an `Array` cache items

    param  {Array} keys (Optional) Cache item keys to get, defaults to `this.keys()` if not provided
	return {Object} LRU instance

```javascript
cache.entries(['myKey1', 'myKey2']);
```

#### evict

Evicts the least recently used item from cache

	return {Object} LRU instance

```javascript
cache.evict();
```

#### expiresAt

Gets expiration time for cached item

	param  {String} key Item key
	return {Mixed}      Undefined or number (epoch time)

```javascript
const item = cache.expiresAt("myKey");
```

#### get

Gets cached item and moves it to the front

	param  {String} key Item key
	return {Mixed}      Undefined or Item value

```javascript
const item = cache.get("myKey");
```

#### has

Returns a `Boolean` indicating if `key` is in cache

	return {Object} LRU instance

```javascript
cache.has('myKey');
```

#### keys

Returns an `Array` of cache item keys (`first` to `last`)

	return {Array} Array of keys

```javascript
console.log(cache.keys());
```

#### set

Sets item in cache as `first`

	param  {String} key   Item key
	param  {Mixed}  value Item value
	return {Object}       LRU instance

```javascript
cache.set("myKey", {prop: true});
```

#### setWithEvicted

Sets an item in the cache and returns the evicted item if the cache was full and an eviction occurred. If no eviction occurs, returns `null`.

	param  {String} key   Item key
	param  {Mixed}  value Item value
	param  {Boolean} [resetTtl] Optionally reset the TTL for the item
	return {Object|null}  The evicted item (shallow clone) or null

```javascript
const evicted = cache.setWithEvicted("myKey", {prop: true});
if (evicted) {
  console.log("Evicted item:", evicted.key, evicted.value);
}
```

#### values(*["key1", "key2"]*)

Returns an `Array` cache items

	param  {Array} keys (Optional) Cache item keys to get
	return {Array} Cache items

```javascript
cache.values(['abc', 'def']);
```


## License
Copyright (c) 2025 Jason Mulligan
Licensed under the BSD-3 license.
