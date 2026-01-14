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

async function runPerformanceObserverBenchmarks () {
	console.log("🔬 Performance Observer Benchmarks");
	console.log("===================================");
	console.log("(Using CustomTimer for function-level timing)");

	const timer = new CustomTimer();
	const cacheSize = 1000;
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
	}, 10000);

	// Phase 2: Mixed read/write operations
	console.log("Phase 2: Mixed operations (realistic workload)");
	const phase2Cache = lru(cacheSize);
	// Pre-populate for realistic workload
	for (let i = 0; i < cacheSize; i++) {
		phase2Cache.set(testData[i].key, testData[i].value);
	}

	// Deterministic mixed workload without Math.random in the loop
	const choice = new Uint8Array(5000);
	const indices = new Uint32Array(5000);
	let a = 1103515245, c = 12345, m = 2 ** 31;
	let seed = 42;
	for (let i = 0; i < 5000; i++) {
		seed = (a * seed + c) % m;
		const r = seed >>> 0;
		choice[i] = r % 100; // 0..99
		indices[i] = r % testData.length;
	}

	let mixedGetIndex = 0;
	await timer.timeFunction("lru.get (mixed workload)", () => {
		const i = mixedGetIndex % choice.length;
		const pick = choice[i];
		if (pick < 60) {
			const idx = indices[i];
			phase2Cache.get(testData[idx].key);
		}
		mixedGetIndex++;
	}, 10000);

	let mixedSetIndex = 0;
	await timer.timeFunction("lru.set (mixed workload)", () => {
		const i = mixedSetIndex % choice.length;
		const pick = choice[i];
		if (pick >= 60 && pick < 80) {
			const idx = indices[i];
			phase2Cache.set(testData[idx].key, testData[idx].value);
		}
		mixedSetIndex++;
	}, 10000);

	let mixedHasIndex = 0;
	await timer.timeFunction("lru.has (mixed workload)", () => {
		const i = mixedHasIndex % choice.length;
		const pick = choice[i];
		if (pick >= 80 && pick < 95) {
			const idx = indices[i];
			phase2Cache.has(testData[idx].key);
		}
		mixedHasIndex++;
	}, 10000);

	let mixedDeleteIndex = 0;
	await timer.timeFunction("lru.delete (mixed workload)", () => {
		const i = mixedDeleteIndex % choice.length;
		const pick = choice[i];
		if (pick >= 95) {
			const idx = indices[i];
			phase2Cache.delete(testData[idx].key);
		}
		mixedDeleteIndex++;
	}, 10000);

	// Phase 3: Cache eviction stress test
	console.log("Phase 3: Cache eviction stress test");
	const phase3Cache = lru(cacheSize);
	let phase3Index = 0;
	await timer.timeFunction("lru.set (eviction stress)", () => {
		const i = phase3Index;
		phase3Cache.set(`evict_key_${i}`, `evict_value_${i}`);
		phase3Index++;
	}, 10000);

	// Phase 4: Some clear operations
	console.log("Phase 4: Clear operations");
	await timer.timeFunction("lru.clear", () => {
		const cache = lru(cacheSize);
		for (let j = 0; j < 100; j++) {
			cache.set(`temp_${j}`, `temp_value_${j}`);
		}
		cache.clear();
	}, 10000);

	// Print results with Performance Observer header
	console.log("\n📊 Performance Observer Results");
	console.log("================================");

	const results = Array.from(timer.results.values());
	console.table(results.map(r => ({
		"Function": r.name,
		"Iterations": r.iterations,
		"Avg (ms)": r.avgTime.toFixed(4),
		"Min (ms)": r.minTime.toFixed(4),
		"Max (ms)": r.maxTime.toFixed(4),
		"Median (ms)": r.median.toFixed(4),
		"Std Dev": r.stdDev.toFixed(4),
		"Ops/sec": Math.round(r.opsPerSec)
	})));
}

async function runCustomTimerBenchmarks () {
	console.log("\n⚡ Custom Timer Benchmarks");
	console.log("==========================");

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
	console.log("Phase 2: Mixed operations (realistic workload)");
	const phase2Cache = lru(cacheSize);
	// Pre-populate for realistic workload
	for (let i = 0; i < cacheSize; i++) {
		phase2Cache.set(testData[i].key, testData[i].value);
	}

	// Deterministic mixed workload without Math.random in the loop
	const choice = new Uint8Array(5000);
	const indices = new Uint32Array(5000);
	let a = 1103515245, c = 12345, m = 2 ** 31;
	let seed = 42;
	for (let i = 0; i < 5000; i++) {
		seed = (a * seed + c) % m;
		const r = seed >>> 0;
		choice[i] = r % 100; // 0..99
		indices[i] = r % testData.length;
	}

	let mixedGetIndex = 0;
	await timer.timeFunction("lru.get (mixed workload)", () => {
		const i = mixedGetIndex % choice.length;
		const pick = choice[i];
		if (pick < 60) {
			const idx = indices[i];
			phase2Cache.get(testData[idx].key);
		}
		mixedGetIndex++;
	}, iterations);

	let mixedSetIndex = 0;
	await timer.timeFunction("lru.set (mixed workload)", () => {
		const i = mixedSetIndex % choice.length;
		const pick = choice[i];
		if (pick >= 60 && pick < 80) {
			const idx = indices[i];
			phase2Cache.set(testData[idx].key, testData[idx].value);
		}
		mixedSetIndex++;
	}, iterations);

	let mixedHasIndex = 0;
	await timer.timeFunction("lru.has (mixed workload)", () => {
		const i = mixedHasIndex % choice.length;
		const pick = choice[i];
		if (pick >= 80 && pick < 95) {
			const idx = indices[i];
			phase2Cache.has(testData[idx].key);
		}
		mixedHasIndex++;
	}, iterations);

	let mixedDeleteIndex = 0;
	await timer.timeFunction("lru.delete (mixed workload)", () => {
		const i = mixedDeleteIndex % choice.length;
		const pick = choice[i];
		if (pick >= 95) {
			const idx = indices[i];
			phase2Cache.delete(testData[idx].key);
		}
		mixedDeleteIndex++;
	}, iterations);

	// Phase 3: Cache eviction stress test
	console.log("Phase 3: Cache eviction stress test");
	const phase3Cache = lru(cacheSize);
	let phase3Index = 0;
	await timer.timeFunction("lru.set (eviction stress)", () => {
		const i = phase3Index;
		phase3Cache.set(`evict_key_${i}`, `evict_value_${i}`);
		phase3Index++;
	}, iterations);

	// Phase 4: Some clear operations
	console.log("Phase 4: Clear operations");
	await timer.timeFunction("lru.clear", () => {
		const cache = lru(cacheSize);
		for (let j = 0; j < 100; j++) {
			cache.set(`temp_${j}`, `temp_value_${j}`);
		}
		cache.clear();
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
		await runPerformanceObserverBenchmarks();
		await runCustomTimerBenchmarks();
		await runScalabilityTest();

		console.log("\n✅ Performance tests completed!");
		console.log("\n📋 Notes:");
		console.log("- Performance Observer: Uses CustomTimer for function-level timing (PerformanceObserver function entries not supported in this Node.js version)");
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
	CustomTimer
};
