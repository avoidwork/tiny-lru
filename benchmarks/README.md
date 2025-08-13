# Tiny-LRU Benchmark Suite

This directory contains modern benchmark implementations for the tiny-lru library, following Node.js best practices and using popular benchmarking tools.

## Benchmark Files

### 1. `modern-benchmark.js` - Tinybench-based Benchmarks ⭐

**Modern, comprehensive benchmark suite using Tinybench**

- **Library**: [Tinybench](https://github.com/tinylibs/tinybench) - A simple, tiny and lightweight benchmarking library
- **Features**:
  - Statistically analyzed latency and throughput values
  - Standard deviation, margin of error, variance calculations
  - Deterministic access patterns (no `Math.random()` in hot paths)
  - Realistic workload scenarios without measuring setup/teardown

**Test Categories**:
- SET operations (empty cache, full cache, eviction scenarios)
- GET operations (hit/miss patterns, access patterns)
- Mixed operations (real-world 80/20 read-write scenarios)
- Special operations (delete, clear, different data types)
- Memory usage analysis

### 2. `comparison-benchmark.js` - Library Comparison Benchmarks

**Comprehensive comparison against other popular LRU cache libraries**

- **Libraries Tested**: 
  - `tiny-lru` (this library)
  - `lru-cache` (most popular npm LRU implementation)
  - `quick-lru` (fast, lightweight alternative)
  - `mnemonist` (advanced data structures library)
- **Features**:
  - Side-by-side performance comparison
  - Bundle size analysis and memory usage per item
  - TTL (Time-To-Live) support testing where available
  - Deterministic, precomputed access patterns to eliminate randomness overhead
  - Multiple operations per measured callback to reduce harness overhead

**Test Categories**:
- SET operations across all libraries
- GET operations with pre-populated caches
- DELETE operations comparison
- UPDATE operations (overwriting existing keys)
- Memory footprint analysis
- Bundle size comparison

### 3. `performance-observer-benchmark.js` - Node.js Performance API

**Native Node.js performance measurement using Performance Observer**

- **API**: Node.js `perf_hooks` module
- **Features**:
  - Function-level timing using `performance.timerify()`
  - PerformanceObserver for automatic measurement collection
  - Custom high-resolution timer implementations
  - Scalability testing across different cache sizes
  - Deterministic mixed workloads (no `Math.random()` in measured loops)

**Test Categories**:
- Performance Observer based function timing
- Custom timer with statistical analysis
- Scalability tests (100 to 10,000 cache sizes)
- Real-world usage pattern simulation

## Running Benchmarks

### Quick Start

```bash
# Run all modern benchmarks
npm run benchmark:all

# Run individual benchmark suites
npm run benchmark:modern      # Tinybench suite
npm run benchmark:comparison  # Library comparison suite
npm run benchmark:perf        # Performance Observer suite
```

### Detailed Commands

```bash
# Modern comprehensive benchmark
node benchmarks/modern-benchmark.js

# Library comparison benchmark
node benchmarks/comparison-benchmark.js

# Node.js Performance API benchmark
node benchmarks/performance-observer-benchmark.js

# Run with garbage collection exposed (for memory analysis)
node --expose-gc benchmarks/modern-benchmark.js
node --expose-gc benchmarks/comparison-benchmark.js
node --expose-gc benchmarks/performance-observer-benchmark.js
```

### Prerequisites for Comparison Benchmark

The comparison benchmark requires additional LRU libraries to be installed temporarily:

```bash
# Install comparison libraries (not saved to package.json)
npm install --no-save lru-cache quick-lru mnemonist

# Then run the comparison
node benchmarks/comparison-benchmark.js
```

## Understanding the Results

### Tinybench Output
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

### Performance Observer Output
```
┌─────────────┬─────────┬────────────┬────────────┬────────────┬───────────────┬─────────┬────────┐
│   Function  │  Calls  │  Avg (ms)  │  Min (ms)  │  Max (ms)  │  Median (ms)  │ Std Dev │Ops/sec │
├─────────────┼─────────┼────────────┼────────────┼────────────┼───────────────┼─────────┼────────┤
│   lru.set   │  1000   │   0.0024   │   0.0010   │   0.0156   │    0.0020     │  0.0012 │ 417292 │
```

### Comparison Benchmark Output
```
📊 SET Operations Benchmark
┌─────────┬─────────────────────────────┬─────────────────┬────────────────────┬──────────┬─────────┐
│ (index) │          Task Name          │     ops/sec     │ Average Time (ns)  │  Margin  │ Samples │
├─────────┼─────────────────────────────┼─────────────────┼────────────────────┼──────────┼─────────┤
│    0    │ 'tiny-lru set'              │   '2,486,234'   │ 402.21854775934    │ '±0.45%' │ 1243117 │
│    1    │ 'lru-cache set'             │   '1,234,567'   │ 810.42375648291    │ '±1.23%' │  617284 │
└─────────┴─────────────────────────────┴─────────────────┴────────────────────┴──────────┴─────────┘

Memory Usage Results:
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Library         │ Bundle Size     │ Memory/Item     │ Total Memory    │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ tiny-lru        │ 2.1KB           │ 128 bytes       │ 125 KB          │
│ lru-cache       │ ~15KB           │ 256 bytes       │ 250 KB          │
│ quick-lru       │ ~1.8KB          │ 144 bytes       │ 140 KB          │
│ mnemonist       │ ~45KB           │ 312 bytes       │ 305 KB          │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

## Benchmark Categories Explained

### SET Operations
Tests cache write performance under various conditions:
- **Empty cache**: Setting items in a fresh cache
- **Full cache**: Setting items when cache is at capacity (triggers eviction)
- **Random vs Sequential**: Different access patterns
  
Implementation details:
- Deterministic keys/values are pre-generated once per run
- Access indices are precomputed via a fast PRNG (xorshift) to avoid runtime randomness
- Multiple operations are executed per benchmark callback to minimize harness overhead

### GET Operations  
Tests cache read performance:
- **Cache hits**: Reading existing items
- **Cache misses**: Reading non-existent items
- **Mixed patterns**: Realistic 80% hit / 20% miss scenarios
  
Implementation details:
- Caches are pre-populated outside the measured section
- Access indices are precomputed; no `Math.random()` inside measured loops

### Mixed Operations
Real-world usage simulation:
- **80/20 read-write**: Typical web application pattern
- **Cache warming**: Sequential population scenarios
- **High churn**: Frequent eviction scenarios
- **LRU access patterns**: Testing LRU algorithm efficiency
  
Implementation details:
- Choice and index streams are precomputed
- No wall-clock calls (`Date.now`) inside hot paths

### Special Operations
Edge cases and additional functionality:
- **Delete operations**: Individual item removal
- **Clear operations**: Complete cache clearing
- **Different data types**: Numbers, objects, strings
- **Memory usage**: Heap consumption analysis
  
Implementation details:
- Delete benchmarks maintain a steady state by re-adding deleted keys to keep cardinality stable

## Best Practices Implemented

### 1. Statistical Significance
- Minimum execution time (1 second) for reliable results
- Multiple iterations for statistical validity
- Standard deviation and margin of error reporting

### 2. Realistic Test Data
- Variable key/value sizes mimicking real applications
- Deterministic pseudo-random and sequential access patterns (precomputed)
- Pre-population scenarios for realistic cache states

### 3. Multiple Measurement Approaches
- **Tinybench**: Modern, accurate micro-benchmarking
- **Performance Observer**: Native Node.js function timing
- **Custom timers**: High-resolution manual timing

### 4. Comprehensive Coverage
- Different cache sizes (100, 1K, 5K, 10K)
- Various workload patterns
- Memory consumption analysis
- Edge case testing

### 5. Methodology Improvements (Current)
- Setup/teardown moved outside measured sections to avoid skewing results
- Deterministic data and access patterns (no randomness in hot paths)
- Batched operations per invocation reduce harness overhead reliably across tasks
- Optional forced GC before/after memory measurements when `--expose-gc` is enabled

## Performance Tips

### For accurate results:
1. **Close other applications** to reduce system noise
2. **Run multiple times** and compare results
3. **Use consistent hardware** for comparisons
4. **Enable garbage collection** with `--expose-gc` for memory tests
5. **Consider CPU frequency scaling** on laptops

### Environment information included:
- Node.js version
- Platform and architecture  
- Timestamp for result tracking

## Interpreting Results

### Good Performance Indicators:
- ✅ **Consistent ops/sec** across runs
- ✅ **Low margin of error** (< 5%)
- ✅ **Reasonable standard deviation**
- ✅ **GET operations faster than SET**
- ✅ **Cache hits faster than misses**

### Warning Signs:
- ⚠️ **High margin of error** (> 10%)
- ⚠️ **Widely varying results** between runs
- ⚠️ **Memory usage growing unexpectedly**
- ⚠️ **Performance degrading with cache size**

## Extending the Benchmarks

To add new benchmark scenarios:

```javascript
// In modern-benchmark.js
bench.add('your-test-name', () => {
  // Your test code here
  const cache = lru(1000);
  cache.set('key', 'value');
});
```

## Contributing

When adding new benchmarks:
1. Follow the existing naming conventions
2. Include proper setup/teardown
3. Add statistical significance checks
4. Document the test purpose
5. Update this README

## Benchmark Results Archive

Consider saving benchmark results with:
```bash
# Save all benchmark results
npm run benchmark:all > results/benchmark-$(date +%Y%m%d-%H%M%S).txt

# Save specific benchmark results
node benchmarks/modern-benchmark.js > results/modern-$(date +%Y%m%d-%H%M%S).txt
node benchmarks/comparison-benchmark.js > results/comparison-$(date +%Y%m%d-%H%M%S).txt
node benchmarks/performance-observer-benchmark.js > results/perf-$(date +%Y%m%d-%H%M%S).txt
```

This helps track performance improvements/regressions over time.

## Benchmark Selection Guide

Choose the right benchmark for your needs:

### Use `modern-benchmark.js` when:
- ✅ You want comprehensive analysis of tiny-lru performance
- ✅ You need statistical significance and margin of error data
- ✅ You're testing different cache sizes and workload patterns
- ✅ You want realistic scenario testing

### Use `comparison-benchmark.js` when:
- ✅ You're evaluating tiny-lru against other LRU libraries
- ✅ You need bundle size and memory usage comparisons
- ✅ You want to see competitive performance analysis
- ✅ You're making library selection decisions

### Use `performance-observer-benchmark.js` when:
- ✅ You need native Node.js performance measurement
- ✅ You want function-level timing analysis
- ✅ You're testing scalability across different cache sizes
- ✅ You prefer Performance API over external libraries 