# Tiny LRU

Least Recently Used cache for Client or Server.

[![build status](https://secure.travis-ci.org/avoidwork/tiny-lru.svg)](http://travis-ci.org/avoidwork/tiny-lru)

```javascript
var cache = lru(500);
```

## clone
### Method

Clones a value; called when setting cache value

	return {Mixed} Clone of input

**Example**

```javascript
cache.clone({abc: true});
```

## dump
### Method

Produces a dump of the cache as JSON or a clone

	param  {String} string Defaults to `true`
	return {Mixed}  String or Object

**Example**

```javascript
cache.dump();      // JSON
cache.dump(false); // Object
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
var cache = lru();

cache.first; // null - it's a new cache!
```

## get
### Method

Gets cached item and moves it to the front

	param  {String} key Item key
	return {Mixed}      Undefined or Item value

**Example**

```javascript
var item = cache.get("myKey");
```

## items
### Property

Hash of cache items

**Example**

```javascript
var cache = lru();

cache.items; // {}
```

## max
### Property

Max items to hold in cache (1000)

**Example**

```javascript
var cache = lru(500);

cache.max; // 500
```

## last
### Property

Item in "last" or "bottom" position

**Example**

```javascript
var cache = lru();

cache.last; // null - it's a new cache!
```

## length
### Property

Number of items in cache

**Example**

```javascript
var cache = lru();

cache.length; // 0 - it's a new cache!
```

## remove
### Method

Removes item from cache

	param  {String} key Item key
	return {Object}     Item

**Example**

```javascript
var staleItem = cache.remove("myKey");
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
var memoized = _.memoize(myFunc);
memoized.cache.max = 10;
```
See the [lodash docs](https://lodash.com/docs#memoize) for more on `memoize`.

## License
Copyright (c) 2016 Jason Mulligan
Licensed under the BSD-3 license.
