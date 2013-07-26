[![build status](https://secure.travis-ci.org/avoidwork/tiny-lru.png)](http://travis-ci.org/avoidwork/tiny-lru)
# Tiny LRU
Least Recently Used cache for Client or Server.

```javascript
var cache = lru(500);
```

## evict
### Method

Evicts the least recently used item from cache

	@return {Object} LRU instance

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

	@param  {String} key Item key
	@return {Mixed}      Undefined or Item value

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

	@param  {String} key Item key
	@return {Object}     Item

**Example**

```javascript
var staleItem = cache.remove("myKey");
```

## set
### Method

Sets item in cache as `first`

	@param  {String} key   Item key
	@param  {Mixed}  value Item value
	@return {Object}       LRU instance

**Example**

```javascript
cache.set("myKey", {prop: true});
```

## License

abaaso is licensed under BSD-3 https://raw.github.com/avoidwork/tiny-lru/master/LICENSE

### Copyright

Copyright (c) 2013, Jason Mulligan <jason.mulligan@avoidwork.com>