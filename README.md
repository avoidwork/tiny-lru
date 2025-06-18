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

// Create a cache with 1000 items, 1 minute TTL, reset on access
const cache = new LRU(1000, 60000, true);

// Create a cache with TTL
const cache2 = new LRU(100, 5000); // 100 items, 5 second TTL
cache2.set('key1', 'value1');
// After 5 seconds, key1 will be expired
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

- **max** `{Number}` - Maximum number of items to store. 0 means unlimited (default: 1000)
- **ttl** `{Number}` - Time-to-live in milliseconds, 0 disables expiration (default: 0)
- **resetTtl** `{Boolean}` - Reset TTL on each `set()` operation (default: false)

### Parameter Validation

The factory function validates parameters and throws `TypeError` for invalid values:

```javascript
// Invalid parameters will throw TypeError
try {
  const cache = lru(-1);        // Invalid max value
} catch (error) {
  console.error(error.message); // "Invalid max value"
}

try {
  const cache = lru(100, -1);   // Invalid ttl value  
} catch (error) {
  console.error(error.message); // "Invalid ttl value"
}

try {
  const cache = lru(100, 0, "true"); // Invalid resetTtl value
} catch (error) {
  console.error(error.message); // "Invalid resetTtl value"
}
```

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

## Benchmarks

Tiny-LRU includes a comprehensive benchmark suite for performance analysis and comparison. The benchmark suite uses modern Node.js best practices and popular benchmarking tools.

### Benchmark Files

#### Modern Benchmarks (`modern-benchmark.js`) ⭐
**Comprehensive benchmark suite using [Tinybench](https://github.com/tinylibs/tinybench)**

Features:
- Statistically analyzed latency and throughput values
- Standard deviation, margin of error, variance calculations
- Proper warmup phases and statistical significance
- Realistic workload scenarios

Test categories:
- **SET operations**: Empty cache, full cache, eviction scenarios
- **GET operations**: Hit/miss patterns, access patterns  
- **Mixed operations**: Real-world 80/20 read-write scenarios
- **Special operations**: Delete, clear, different data types
- **Memory usage analysis**

#### Performance Observer Benchmarks (`performance-observer-benchmark.js`)
**Native Node.js performance measurement using Performance Observer**

Features:
- Function-level timing using `performance.timerify()`
- PerformanceObserver for automatic measurement collection
- Custom high-resolution timer implementations
- Scalability testing across different cache sizes

### Running Benchmarks

```bash
# Run all modern benchmarks
npm run benchmark:all

# Run individual benchmark suites
npm run benchmark:modern    # Tinybench suite
npm run benchmark:perf      # Performance Observer suite

# Or run directly
node benchmarks/modern-benchmark.js
node benchmarks/performance-observer-benchmark.js

# Run with garbage collection exposed (for memory analysis)
node --expose-gc benchmarks/modern-benchmark.js
```

### Understanding Results

#### Tinybench Output
```
┌─────────┬─────────────────────────────┬─────────────────┬────────────────────┬──────────┬─────────┐
│ (index) │          Task Name          │     ops/sec     │ Average Time (ns)  │  Margin  │ Samples │
├─────────┼─────────────────────────────┼─────────────────┼────────────────────┼──────────┼─────────┤
│    0    │ 'set-random-empty-cache-100'│   '2,486,234'   │ 402.21854775934    │ '±0.45%' │ 1243117 │
```

- **ops/sec**: Operations per second (higher is better)
- **Average Time**: Average execution time in nanoseconds
- **Margin**: Statistical margin of error
- **Samples**: Number of samples collected for statistical significance

#### Performance Observer Output
```
┌─────────────┬─────────┬────────────┬────────────┬────────────┬───────────────┬─────────┬────────┐
│   Function  │  Calls  │  Avg (ms)  │  Min (ms)  │  Max (ms)  │  Median (ms)  │ Std Dev │Ops/sec │
├─────────────┼─────────┼────────────┼────────────┼────────────┼───────────────┼─────────┼────────┤
│   lru.set   │  1000   │   0.0024   │   0.0010   │   0.0156   │    0.0020     │  0.0012 │ 417292 │
```

### Performance Tips

For accurate benchmark results:
1. **Close other applications** to reduce system noise
2. **Run multiple times** and compare results  
3. **Use consistent hardware** for comparisons
4. **Enable garbage collection** with `--expose-gc` for memory tests
5. **Consider CPU frequency scaling** on laptops

### Good Performance Indicators
- ✅ **Consistent ops/sec** across runs
- ✅ **Low margin of error** (< 5%)
- ✅ **GET operations faster than SET**
- ✅ **Cache hits faster than misses**

See `benchmarks/README.md` for complete documentation and advanced usage.

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
cache.set('key1', 'value1');
cache.delete('key1');
console.log(cache.has('key1')); // false
```

**See also:** [has()](#has), [clear()](#clear)

#### entries([keys])
Returns array of cache items as `[key, value]` pairs.

**Parameters:**
- `keys` `{Array}` - Optional array of specific keys to retrieve (defaults to all keys)

**Returns:** `{Array}` Array of `[key, value]` pairs

```javascript
cache.set('a', 1).set('b', 2);
console.log(cache.entries()); // [['a', 1], ['b', 2]]
console.log(cache.entries(['a'])); // [['a', 1]]
```

**See also:** [keys()](#keys), [values()](#values)

#### evict()
Removes the least recently used item from cache.

**Returns:** `{Object}` LRU instance

```javascript
cache.set('old', 'value').set('new', 'value');
cache.evict(); // Removes 'old' item
```

**See also:** [setWithEvicted()](#setwithevicted)

#### expiresAt(key)
Gets expiration timestamp for cached item.

**Parameters:**
- `key` `{String}` - Item key

**Returns:** `{Number|undefined}` Expiration time (epoch milliseconds) or undefined if key doesn't exist

```javascript
const cache = new LRU(100, 5000); // 5 second TTL
cache.set('key1', 'value1');
console.log(cache.expiresAt('key1')); // timestamp 5 seconds from now
```

**See also:** [get()](#get), [has()](#has)

#### get(key)
Retrieves cached item and promotes it to most recently used position.

**Parameters:**
- `key` `{String}` - Item key

**Returns:** `{*}` Item value or undefined if not found/expired

```javascript
cache.set('key1', 'value1');
console.log(cache.get('key1')); // 'value1'
console.log(cache.get('nonexistent')); // undefined
```

**See also:** [set()](#set), [has()](#has)

#### has(key)
Checks if key exists in cache (without promoting it).

**Parameters:**
- `key` `{String}` - Item key

**Returns:** `{Boolean}` True if key exists and is not expired

```javascript
cache.set('key1', 'value1');
console.log(cache.has('key1')); // true
console.log(cache.has('nonexistent')); // false
```

**See also:** [get()](#get), [delete()](#delete)

#### keys()
Returns array of all cache keys in LRU order (first = least recent).

**Returns:** `{Array}` Array of keys

```javascript
cache.set('a', 1).set('b', 2);
cache.get('a'); // Move 'a' to most recent
console.log(cache.keys()); // ['b', 'a']
```

**See also:** [values()](#values), [entries()](#entries)

#### set(key, value)
Stores item in cache as most recently used.

**Parameters:**
- `key` `{String}` - Item key
- `value` `{*}` - Item value

**Returns:** `{Object}` LRU instance

```javascript
cache.set('key1', 'value1')
     .set('key2', 'value2')
     .set('key3', 'value3');
```

**See also:** [get()](#get), [setWithEvicted()](#setwithevicted)

#### setWithEvicted(key, value)
Stores item and returns evicted item if cache was full.

**Parameters:**
- `key` `{String}` - Item key
- `value` `{*}` - Item value

**Returns:** `{Object|null}` Evicted item `{key, value, expiry, prev, next}` or null

```javascript
const cache = new LRU(2);
cache.set('a', 1).set('b', 2);
const evicted = cache.setWithEvicted('c', 3); // evicted = {key: 'a', value: 1, ...}
if (evicted) {
  console.log(`Evicted: ${evicted.key}`, evicted.value);
}
```

**See also:** [set()](#set), [evict()](#evict)

#### values([keys])
Returns array of cache values.

**Parameters:**
- `keys` `{Array}` - Optional array of specific keys to retrieve (defaults to all keys)

**Returns:** `{Array}` Array of values

```javascript
cache.set('a', 1).set('b', 2);
console.log(cache.values()); // [1, 2]
console.log(cache.values(['a'])); // [1]
```

**See also:** [keys()](#keys), [entries()](#entries)

## Examples

### Basic Usage
```javascript
import {lru} from "tiny-lru";

// Create a cache with max 100 items
const cache = lru(100);
cache.set('key1', 'value1');
console.log(cache.get('key1')); // 'value1'

// Method chaining
cache.set("user:123", {name: "John", age: 30})
     .set("session:abc", {token: "xyz", expires: Date.now()});

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
