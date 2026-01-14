import { performance } from "node:perf_hooks";
import { lru } from "../dist/tiny-lru.js";

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
		console.log("\n⏱️  Performance Results");
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

// Test data generation
function generateTestData (size) {
	const out = new Array(size);
	for (let i = 0; i < size; i++) {
		out[i] = {
			key: `key_${i}`,
			value: `value_${i}_${"x".repeat(50)}`
		};
	}

	return out;
}

async function runPerformanceBenchmarks () {
	console.log("🔬 LRU Performance Benchmarks");
	console.log("==============================");
	console.log("(Using CustomTimer for high-resolution function timing)");

	const timer = new CustomTimer();
	const cacheSize = 1000;
	const iterations = 10000;
	const testData = generateTestData(cacheSize * 2);

	console.log("Running operations...");

	// Phase 1: Fill cache with initial data
	console.log("Phase 1: Initial cache population");
	const phase1Cache = lru(cacheSize);
	let phase1Index = 0;
	await timer.timeFunction("lru.set (initial population)", () => {
		const i = phase1Index % cacheSize;
		phase1Cache.set(testData[i].key, testData[i].value);
		phase1Index++;
	}, iterations);

	// Phase 2: Mixed read/write operations
	console.log("Phase 2: Mixed operations");
	const phase2Cache = lru(cacheSize);
	// Pre-populate for realistic workload
	for (let i = 0; i < cacheSize; i++) {
		phase2Cache.set(testData[i].key, testData[i].value);
	}

	// Deterministic mixed workload that exercises the entire cache without conditionals
	const getIndices = new Uint32Array(iterations);
	const setIndices = new Uint32Array(iterations);
	const hasIndices = new Uint32Array(iterations);
	const deleteIndices = new Uint32Array(iterations);

	for (let i = 0; i < iterations; i++) {
		const idx = i % cacheSize;
		getIndices[i] = idx;
		setIndices[i] = idx;
		hasIndices[i] = idx;
		deleteIndices[i] = idx;
	}

	let mixedGetIndex = 0;
	await timer.timeFunction("lru.get", () => {
		const idx = getIndices[mixedGetIndex % iterations];
		phase2Cache.get(testData[idx].key);
		mixedGetIndex++;
	}, iterations);

	let mixedSetIndex = 0;
	await timer.timeFunction("lru.set", () => {
		const idx = setIndices[mixedSetIndex % iterations];
		phase2Cache.set(testData[idx].key, testData[idx].value);
		mixedSetIndex++;
	}, iterations);

	let mixedHasIndex = 0;
	await timer.timeFunction("lru.has", () => {
		const idx = hasIndices[mixedHasIndex % iterations];
		phase2Cache.has(testData[idx].key);
		mixedHasIndex++;
	}, iterations);

	// keys()
	await timer.timeFunction("lru.keys", () => {
		phase2Cache.keys();
	}, iterations);

	// values()
	await timer.timeFunction("lru.values", () => {
		phase2Cache.values();
	}, iterations);

	// entries()
	await timer.timeFunction("lru.entries", () => {
		phase2Cache.entries();
	}, iterations);

	let mixedDeleteIndex = 0;
	await timer.timeFunction("lru.delete", () => {
		const idx = deleteIndices[mixedDeleteIndex % iterations];
		phase2Cache.delete(testData[idx].key);
		mixedDeleteIndex++;
	}, iterations);

	// Phase 3: Cache eviction stress test
	console.log("Phase 3: Cache eviction stress test");
	const phase3Cache = lru(2);
	let phase3Index = 1;
	phase3Cache.set(`evict_key_${phase3Index}`, `evict__value_${phase3Index++}`);
	await timer.timeFunction("lru.set (eviction stress)", () => {
		phase3Cache.set(`evict_key_${phase3Index}`, `evict_value_${phase3Index++}`);
	}, iterations);

	// Phase 4: Some clear operations
	console.log("Phase 4: Clear operations");
	const phase4Cache = lru(1);
	await timer.timeFunction("lru.clear", () => {
		phase4Cache.set("temp_1", "temp_value_1");
		phase4Cache.clear();
	}, iterations);

	// Phase 5: Additional API method benchmarks
	console.log("Phase 5: Additional API method benchmarks");

	// setWithEvicted()
	const setWithEvictedCache = lru(2);
	setWithEvictedCache.set("a", "value_a");
	setWithEvictedCache.set("b", "value_b");
	let setWithEvictedIndex = 0;
	await timer.timeFunction("lru.setWithEvicted", () => {
		const key = `extra_key_${setWithEvictedIndex}`;
		const value = `extra_value_${setWithEvictedIndex}`;
		setWithEvictedCache.setWithEvicted(key, value);
		setWithEvictedIndex++;
	}, iterations);

	// expiresAt()
	const expiresCache = lru(cacheSize, 6e4);
	const expiresKey = "expires_key";
	expiresCache.set(expiresKey, "expires_value");
	await timer.timeFunction("lru.expiresAt", () => {
		expiresCache.expiresAt(expiresKey);
	}, iterations);

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
		const cache = lru(size);
		const setStart = performance.now();
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
		await runPerformanceBenchmarks();
		await runScalabilityTest();

		console.log("\n✅ Performance tests completed!");
		console.log("\n📋 Notes:");
		console.log("- Benchmarks: High-resolution timing with statistical analysis using CustomTimer (based on performance.now())");
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
	runPerformanceBenchmarks,
	runScalabilityTest,
	CustomTimer
};
