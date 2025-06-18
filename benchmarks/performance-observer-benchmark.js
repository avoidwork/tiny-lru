import { performance, PerformanceObserver } from "node:perf_hooks";
import { lru } from "../dist/tiny-lru.js";

// Performance observer for function timing
class LRUPerformanceProfiler {
	constructor () {
		this.entries = [];
		this.observer = new PerformanceObserver(items => {
			items.getEntries().forEach(entry => {
				this.entries.push(entry);
			});
		});
		this.observer.observe({ entryTypes: ["function"] });
	}

	timerify (fn, name) {
		const wrappedFn = performance.timerify(fn);
		// Override the name for better reporting
		Object.defineProperty(wrappedFn, "name", { value: name });

		return wrappedFn;
	}

	getResults () {
		const results = new Map();

		this.entries.forEach(entry => {
			if (!results.has(entry.name)) {
				results.set(entry.name, {
					name: entry.name,
					calls: 0,
					totalTime: 0,
					minTime: Infinity,
					maxTime: 0,
					times: []
				});
			}

			const result = results.get(entry.name);
			result.calls++;
			result.totalTime += entry.duration;
			result.minTime = Math.min(result.minTime, entry.duration);
			result.maxTime = Math.max(result.maxTime, entry.duration);
			result.times.push(entry.duration);
		});

		// Calculate statistics
		results.forEach(result => {
			result.avgTime = result.totalTime / result.calls;

			// Calculate standard deviation
			const variance = result.times.reduce((acc, time) => {
				return acc + Math.pow(time - result.avgTime, 2);
			}, 0) / result.calls;
			result.stdDev = Math.sqrt(variance);

			// Calculate median
			const sorted = [...result.times].sort((a, b) => a - b);
			const mid = Math.floor(sorted.length / 2);
			result.median = sorted.length % 2 === 0 ?
				(sorted[mid - 1] + sorted[mid]) / 2 :
				sorted[mid];

			// Operations per second (rough estimate)
			result.opsPerSec = result.calls / (result.totalTime / 1000); // duration is in ms
		});

		return Array.from(results.values());
	}

	printResults () {
		const results = this.getResults();
		console.log("\n📊 Performance Observer Results");
		console.log("================================");

		console.table(results.map(r => ({
			"Function": r.name,
			"Calls": r.calls,
			"Avg (ms)": r.avgTime.toFixed(4),
			"Min (ms)": r.minTime.toFixed(4),
			"Max (ms)": r.maxTime.toFixed(4),
			"Median (ms)": r.median.toFixed(4),
			"Std Dev": r.stdDev.toFixed(4),
			"Ops/sec": Math.round(r.opsPerSec)
		})));
	}

	disconnect () {
		this.observer.disconnect();
	}

	reset () {
		this.entries = [];
	}
}

// Test data generation
function generateTestData (size) {
	return Array.from({ length: size }, (_, i) => ({
		key: `key_${i}`,
		value: `value_${i}_${"x".repeat(50)}` // Some realistic data size
	}));
}

async function runPerformanceObserverBenchmarks () {
	console.log("🔬 Performance Observer Benchmarks");
	console.log("===================================");

	const profiler = new LRUPerformanceProfiler();
	const cacheSize = 1000;
	const testData = generateTestData(cacheSize * 2);

	// Create wrapped functions for different operations
	const cache = lru(cacheSize);

	const setOperation = profiler.timerify((key, value) => {
		cache.set(key, value);
	}, "lru.set");

	const getOperation = profiler.timerify(key => {
		return cache.get(key);
	}, "lru.get");

	const hasOperation = profiler.timerify(key => {
		return cache.has(key);
	}, "lru.has");

	const deleteOperation = profiler.timerify(key => {
		return cache.delete(key);
	}, "lru.delete");

	const clearOperation = profiler.timerify(() => {
		cache.clear();
	}, "lru.clear");

	console.log("Running operations...");

	// Phase 1: Fill cache with initial data
	console.log("Phase 1: Initial cache population");
	for (let i = 0; i < cacheSize; i++) {
		setOperation(testData[i].key, testData[i].value);
	}

	// Phase 2: Mixed read/write operations
	console.log("Phase 2: Mixed operations (realistic workload)");
	for (let i = 0; i < 5000; i++) {
		const operation = Math.random();
		const dataIndex = Math.floor(Math.random() * testData.length);

		if (operation < 0.6) {
			// 60% reads
			getOperation(testData[dataIndex].key);
		} else if (operation < 0.8) {
			// 20% writes
			setOperation(testData[dataIndex].key, testData[dataIndex].value);
		} else if (operation < 0.95) {
			// 15% has operations
			hasOperation(testData[dataIndex].key);
		} else {
			// 5% delete operations
			deleteOperation(testData[dataIndex].key);
		}
	}

	// Phase 3: Cache eviction stress test
	console.log("Phase 3: Cache eviction stress test");
	for (let i = 0; i < cacheSize; i++) {
		setOperation(`evict_key_${i}`, `evict_value_${i}`);
	}

	// Phase 4: Some clear operations
	console.log("Phase 4: Clear operations");
	for (let i = 0; i < 10; i++) {
		// Repopulate and clear
		for (let j = 0; j < 100; j++) {
			setOperation(`temp_${j}`, `temp_value_${j}`);
		}
		clearOperation();
	}

	profiler.printResults();
	profiler.disconnect();
}

// Custom high-resolution timer benchmark (alternative approach)
class CustomTimer {
	constructor () {
		this.results = new Map();
	}

	async timeFunction (name, fn, iterations = 1000) {
		const times = [];

		// Warmup
		for (let i = 0; i < Math.min(100, iterations / 10); i++) {
			await fn();
		}

		// Actual measurement
		for (let i = 0; i < iterations; i++) {
			const start = performance.now();
			await fn();
			const end = performance.now();
			times.push(end - start);
		}

		// Calculate statistics
		const totalTime = times.reduce((a, b) => a + b, 0);
		const avgTime = totalTime / iterations;
		const minTime = Math.min(...times);
		const maxTime = Math.max(...times);

		const sorted = [...times].sort((a, b) => a - b);
		const median = sorted[Math.floor(sorted.length / 2)];

		const variance = times.reduce((acc, time) => acc + Math.pow(time - avgTime, 2), 0) / iterations;
		const stdDev = Math.sqrt(variance);

		this.results.set(name, {
			name,
			iterations,
			avgTime,
			minTime,
			maxTime,
			median,
			stdDev,
			opsPerSec: 1000 / avgTime // Convert ms to ops/sec
		});
	}

	printResults () {
		console.log("\n⏱️  Custom Timer Results");
		console.log("========================");

		const results = Array.from(this.results.values());
		console.table(results.map(r => ({
			"Operation": r.name,
			"Iterations": r.iterations,
			"Avg (ms)": r.avgTime.toFixed(6),
			"Min (ms)": r.minTime.toFixed(6),
			"Max (ms)": r.maxTime.toFixed(6),
			"Median (ms)": r.median.toFixed(6),
			"Std Dev": r.stdDev.toFixed(6),
			"Ops/sec": Math.round(r.opsPerSec)
		})));
	}
}

async function runCustomTimerBenchmarks () {
	console.log("\n⚡ Custom Timer Benchmarks");
	console.log("==========================");

	const timer = new CustomTimer();
	const cacheSize = 1000;
	const testData = generateTestData(cacheSize);

	// Pre-populate cache for read tests
	const readCache = lru(cacheSize);
	testData.forEach(item => readCache.set(item.key, item.value));

	// Benchmark different operations
	await timer.timeFunction("Empty Cache Set", () => {
		const cache = lru(cacheSize);
		const item = testData[Math.floor(Math.random() * testData.length)];
		cache.set(item.key, item.value);
	}, 10000);

	await timer.timeFunction("Full Cache Set (eviction)", () => {
		const cache = lru(100); // Smaller cache for guaranteed eviction
		testData.slice(0, 100).forEach(item => cache.set(item.key, item.value));
		// This will cause eviction
		cache.set("new_key", "new_value");
	}, 1000);

	await timer.timeFunction("Cache Hit Get", () => {
		const item = testData[Math.floor(Math.random() * testData.length)];
		readCache.get(item.key);
	}, 10000);

	await timer.timeFunction("Cache Miss Get", () => {
		readCache.get(`nonexistent_${Math.random()}`);
	}, 10000);

	await timer.timeFunction("Has Operation (hit)", () => {
		const item = testData[Math.floor(Math.random() * testData.length)];
		readCache.has(item.key);
	}, 10000);

	await timer.timeFunction("Has Operation (miss)", () => {
		readCache.has(`nonexistent_${Math.random()}`);
	}, 10000);

	await timer.timeFunction("Delete Operation", () => {
		const cache = lru(cacheSize);
		testData.slice(0, 500).forEach(item => cache.set(item.key, item.value));
		const item = testData[Math.floor(Math.random() * 500)];
		cache.delete(item.key);
	}, 1000);

	await timer.timeFunction("Clear Operation", () => {
		const cache = lru(cacheSize);
		testData.slice(0, 500).forEach(item => cache.set(item.key, item.value));
		cache.clear();
	}, 1000);

	timer.printResults();
}

// Comparison with different cache sizes
async function runScalabilityTest () {
	console.log("\n📈 Scalability Test");
	console.log("===================");

	const sizes = [100, 500, 1000, 5000, 10000];
	const results = [];

	for (const size of sizes) {
		console.log(`Testing cache size: ${size}`);
		const testData = generateTestData(size);

		// Test set performance
		const setStart = performance.now();
		const cache = lru(size);
		testData.forEach(item => cache.set(item.key, item.value));
		const setEnd = performance.now();
		const setTime = setEnd - setStart;

		// Test get performance
		const getStart = performance.now();
		for (let i = 0; i < 1000; i++) {
			const item = testData[Math.floor(Math.random() * testData.length)];
			cache.get(item.key);
		}
		const getEnd = performance.now();
		const getTime = getEnd - getStart;

		results.push({
			"Size": size,
			"Set Total (ms)": setTime.toFixed(2),
			"Set Per Item (ms)": (setTime / size).toFixed(4),
			"Get 1K Items (ms)": getTime.toFixed(2),
			"Get Per Item (ms)": (getTime / 1000).toFixed(4)
		});
	}

	console.table(results);
}

// Main execution
async function runAllPerformanceTests () {
	console.log("🔬 Node.js Performance API Benchmarks");
	console.log("======================================");
	console.log(`Node.js version: ${process.version}`);
	console.log(`Platform: ${process.platform} ${process.arch}`);
	console.log(`Date: ${new Date().toISOString()}`);

	try {
		await runPerformanceObserverBenchmarks();
		await runCustomTimerBenchmarks();
		await runScalabilityTest();

		console.log("\n✅ Performance tests completed!");
		console.log("\n📋 Notes:");
		console.log("- Performance Observer: Uses Node.js built-in function timing");
		console.log("- Custom Timer: High-resolution timing with statistical analysis");
		console.log("- Scalability Test: Shows how performance scales with cache size");

	} catch (error) {
		console.error("❌ Performance test failed:", error);
		process.exit(1);
	}
}

// Allow running this file directly
if (import.meta.url === `file://${process.argv[1]}`) {
	runAllPerformanceTests();
}

export {
	runAllPerformanceTests,
	runPerformanceObserverBenchmarks,
	runCustomTimerBenchmarks,
	runScalabilityTest,
	LRUPerformanceProfiler,
	CustomTimer
};
