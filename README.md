# Tiny LRU

Least Recently Used cache for Client or Server.

[![build status](https://secure.travis-ci.org/avoidwork/tiny-lru.svg)](http://travis-ci.org/avoidwork/tiny-lru)

```javascript
const cache = lru(max [, notify = false, ttl = 0, expire = 0]);
```

Lodash provides a `memoize` function with a cache that can be swapped out as long as it implements the right interface.
See the [lodash docs](https://lodash.com/docs#memoize) for more on `memoize`.

#### Example
```javascript
_.memoize.Cache = lru().constructor;
const memoized = _.memoize(myFunc);
memoized.cache.max = 10;
```

## clear
### Method

Clears the contents of the cache

	return {Object} LRU instance

**Example**

```javascript
cache.clear();
```

## evict
### Method

Evicts the least recently used item from cache

	return {Object} LRU instance

**Example**

```javascript
cache.evict();
```

## expire
### Property

Milliseconds an item will remain in cache, does not reset when accessed

**Example**

```javascript
const cache = lru();

cache.expire = 6e4;
```

## first
### Property

Item in "first" or "top" position

**Example**

```javascript
const cache = lru();

cache.first; // null - it's a new cache!
```

## get
### Method

Gets cached item and moves it to the front

	param  {String} key Item key
	return {Mixed}      Undefined or Item value

**Example**

```javascript
const item = cache.get("myKey");
```

## items
### Property

Hash of cache items

**Example**

```javascript
const cache = lru();

cache.items; // {}
```

## max
### Property

Max items to hold in cache (1000)

**Example**

```javascript
const cache = lru(500);

cache.max; // 500
```

## notify
### Property

Executes `onchange(eventName, serializedCache)` on the next tick when the cache changes

**Example**

```javascript
const cache = lru();

cache.notify = true;
cache.onchange = (event, serializedCache) => {
	console.log(event, serializedCache);
};
```

## onchange
### Method

Accepts `eventName` & `serializedCache` arguments

**Example**

```javascript
const cache = lru();

cache.notify = true;
cache.onchange = (event, serializedCache) => {
	console.log(event, serializedCache);
};
````

## last
### Property

Item in "last" or "bottom" position

**Example**

```javascript
const cache = lru();

cache.last; // null - it's a new cache!
```

## length
### Property

Number of items in cache

**Example**

```javascript
const cache = lru();

cache.length; // 0 - it's a new cache!
```

## remove
### Method

Removes item from cache

	param  {String} key Item key
	return {Object}     Item

**Example**

```javascript
const staleItem = cache.remove("myKey");
```

## reset
### Method

Resets the cache to it's original state

	return {Object} LRU instance

**Example**

```javascript
cache.reset();
```

## set
### Method

Sets item in cache as `first`

	param  {String} key   Item key
	param  {Mixed}  value Item value
	return {Object}       LRU instance

**Example**

```javascript
cache.set("myKey", {prop: true});
```

## ttl
### Property

Milliseconds an item will remain in cache, resets when accessed

**Example**

```javascript
const cache = lru();

cache.ttl = 3e4;
```

## License
Copyright (c) 2018 Jason Mulligan
Licensed under the BSD-3 license.
