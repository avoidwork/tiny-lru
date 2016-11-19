# Tiny LRU

Least Recently Used cache for Client or Server.

[![build status](https://secure.travis-ci.org/avoidwork/tiny-lru.svg)](http://travis-ci.org/avoidwork/tiny-lru)

```javascript
const cache = lru(500);
```

## evict
### Method

Evicts the least recently used item from cache

	return {Object} LRU instance

**Example**

```javascript
cache.evict();
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

Lodash provides a `memoize` function with a cache that can be swapped out as long as it implements the right interface. Sample usage with lodash:
```javascript
_.memoize.Cache = lru().constructor;
const memoized = _.memoize(myFunc);
memoized.cache.max = 10;
```
See the [lodash docs](https://lodash.com/docs#memoize) for more on `memoize`.

## License
Copyright (c) 2016 Jason Mulligan
Licensed under the BSD-3 license.
