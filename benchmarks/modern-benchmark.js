import { Bench } from "tinybench";
import { lru } from "../dist/tiny-lru.js";

// Configuration constants following best practices
const CACHE_SIZES = [100, 1000, 5000];
const WORKLOAD_SIZES = [50, 500, 2500]; // Half of cache size for realistic workloads
const ITERATIONS = {
	time: 1000, // Run for 1 second minimum
	iterations: 100 // Minimum iterations for statistical significance
};

// Utility functions for generating test data
function generateRandomData (size) {
	const data = [];
	for (let i = 0; i < size; i++) {
		data.push({
			key: `key_${i}_${Math.random().toString(36).substr(2, 9)}`,
			value: `value_${i}_${Math.random().toString(36).substr(2, 20)}`
		});
	}

	return data;
}

function generateSequentialData (size) {
	const data = [];
	for (let i = 0; i < size; i++) {
		data.push({
			key: `seq_key_${i}`,
			value: `seq_value_${i}`
		});
	}

	return data;
}

// Pre-populate cache with data
function prepopulateCache (cache, data, fillRatio = 0.8) {
	const fillCount = Math.floor(data.length * fillRatio);
	for (let i = 0; i < fillCount; i++) {
		cache.set(data[i].key, data[i].value);
	}
}

// Benchmark suites
async function runSetOperationsBenchmarks () {
	console.log("\n📝 SET Operations Benchmarks");
	console.log("=" .repeat(50));

	for (const cacheSize of CACHE_SIZES) {
		const workloadSize = WORKLOAD_SIZES[CACHE_SIZES.indexOf(cacheSize)];
		const bench = new Bench(ITERATIONS);

		console.log(`\nCache Size: ${cacheSize}, Workload: ${workloadSize}`);

		// Prepare test data
		const randomData = generateRandomData(workloadSize);
		const sequentialData = generateSequentialData(workloadSize);

		// Test scenarios
		bench
			.add(`set-random-empty-cache-${cacheSize}`, () => {
				const cache = lru(cacheSize);
				const item = randomData[Math.floor(Math.random() * randomData.length)];
				cache.set(item.key, item.value);
			})
			.add(`set-sequential-empty-cache-${cacheSize}`, () => {
				const cache = lru(cacheSize);
				const item = sequentialData[Math.floor(Math.random() * sequentialData.length)];
				cache.set(item.key, item.value);
			})
			.add(`set-random-full-cache-${cacheSize}`, () => {
				const cache = lru(cacheSize);
				prepopulateCache(cache, randomData);
				const item = randomData[Math.floor(Math.random() * randomData.length)];
				cache.set(item.key, item.value);
			})
			.add(`set-new-items-full-cache-${cacheSize}`, () => {
				const cache = lru(cacheSize);
				prepopulateCache(cache, randomData);
				// Force eviction by adding new items
				cache.set(`new_key_${Date.now()}_${Math.random()}`, `new_value_${Date.now()}`);
			});

		await bench.run();
		console.table(bench.table());
	}
}

async function runGetOperationsBenchmarks () {
	console.log("\n🔍 GET Operations Benchmarks");
	console.log("=" .repeat(50));

	for (const cacheSize of CACHE_SIZES) {
		const workloadSize = WORKLOAD_SIZES[CACHE_SIZES.indexOf(cacheSize)];
		const bench = new Bench(ITERATIONS);

		console.log(`\nCache Size: ${cacheSize}, Workload: ${workloadSize}`);

		// Prepare test data and caches
		const randomData = generateRandomData(workloadSize);
		const sequentialData = generateSequentialData(workloadSize);

		const randomCache = lru(cacheSize);
		const sequentialCache = lru(cacheSize);
		const mixedCache = lru(cacheSize);

		prepopulateCache(randomCache, randomData);
		prepopulateCache(sequentialCache, sequentialData);
		prepopulateCache(mixedCache, [...randomData.slice(0, Math.floor(workloadSize / 2)),
			...sequentialData.slice(0, Math.floor(workloadSize / 2))]);

		bench
			.add(`get-hit-random-${cacheSize}`, () => {
				const item = randomData[Math.floor(Math.random() * Math.floor(workloadSize * 0.8))];
				randomCache.get(item.key);
			})
			.add(`get-hit-sequential-${cacheSize}`, () => {
				const item = sequentialData[Math.floor(Math.random() * Math.floor(workloadSize * 0.8))];
				sequentialCache.get(item.key);
			})
			.add(`get-miss-${cacheSize}`, () => {
				randomCache.get(`nonexistent_key_${Math.random()}`);
			})
			.add(`get-mixed-pattern-${cacheSize}`, () => {
				if (Math.random() > 0.2) {
					// 80% hit rate
					const item = randomData[Math.floor(Math.random() * Math.floor(workloadSize * 0.8))];
					mixedCache.get(item.key);
				} else {
					// 20% miss rate
					mixedCache.get(`miss_key_${Math.random()}`);
				}
			});

		await bench.run();
		console.table(bench.table());
	}
}

async function runMixedOperationsBenchmarks () {
	console.log("\n🔄 Mixed Operations Benchmarks (Real-world scenarios)");
	console.log("=" .repeat(60));

	for (const cacheSize of CACHE_SIZES) {
		const workloadSize = WORKLOAD_SIZES[CACHE_SIZES.indexOf(cacheSize)];
		const bench = new Bench(ITERATIONS);

		console.log(`\nCache Size: ${cacheSize}, Workload: ${workloadSize}`);

		const testData = generateRandomData(workloadSize * 2); // More data than cache

		bench
			.add(`real-world-80-20-read-write-${cacheSize}`, () => {
				const cache = lru(cacheSize);
				prepopulateCache(cache, testData, 0.5);

				// Simulate 80% reads, 20% writes
				for (let i = 0; i < 10; i++) {
					if (Math.random() > 0.2) {
						// Read operation
						const item = testData[Math.floor(Math.random() * workloadSize)];
						cache.get(item.key);
					} else {
						// Write operation
						const item = testData[Math.floor(Math.random() * testData.length)];
						cache.set(item.key, item.value);
					}
				}
			})
			.add(`cache-warming-${cacheSize}`, () => {
				const cache = lru(cacheSize);

				// Simulate cache warming - sequential fills
				for (let i = 0; i < Math.min(cacheSize, workloadSize); i++) {
					cache.set(testData[i].key, testData[i].value);
				}
			})
			.add(`high-churn-${cacheSize}`, () => {
				const cache = lru(cacheSize);
				prepopulateCache(cache, testData, 1.0); // Fill cache completely

				// High churn - constantly adding new items
				for (let i = 0; i < 5; i++) {
					cache.set(`churn_${Date.now()}_${i}_${Math.random()}`, `value_${i}`);
				}
			})
			.add(`lru-access-pattern-${cacheSize}`, () => {
				const cache = lru(cacheSize);
				prepopulateCache(cache, testData, 1.0);

				// Access patterns that test LRU behavior
				// Access same keys multiple times (should be fast)
				const hotKeys = testData.slice(0, 3);
				hotKeys.forEach(item => cache.get(item.key));
				hotKeys.forEach(item => cache.get(item.key)); // Second access
			});

		await bench.run();
		console.table(bench.table());
	}
}

async function runSpecialOperationsBenchmarks () {
	console.log("\n⚙️  Special Operations Benchmarks");
	console.log("=" .repeat(50));

	const cacheSize = 1000;
	const workloadSize = 500;
	const bench = new Bench(ITERATIONS);

	const testData = generateRandomData(workloadSize);

	// Test cache with different data types
	const numberData = Array.from({length: workloadSize}, (_, i) => ({key: i, value: i * 2}));
	const objectData = Array.from({length: workloadSize}, (_, i) => ({
		key: `obj_${i}`,
		value: {id: i, data: `object_data_${i}`, nested: {prop: i}}
	}));

	bench
		.add("cache-clear", () => {
			const cache = lru(cacheSize);
			prepopulateCache(cache, testData);
			cache.clear();
		})
		.add("cache-delete", () => {
			const cache = lru(cacheSize);
			prepopulateCache(cache, testData);
			const item = testData[Math.floor(Math.random() * Math.floor(workloadSize * 0.8))];
			cache.delete(item.key);
		})
		.add("number-keys-values", () => {
			const cache = lru(cacheSize);
			const item = numberData[Math.floor(Math.random() * numberData.length)];
			cache.set(item.key, item.value);
			cache.get(item.key);
		})
		.add("object-values", () => {
			const cache = lru(cacheSize);
			const item = objectData[Math.floor(Math.random() * objectData.length)];
			cache.set(item.key, item.value);
			cache.get(item.key);
		})
		.add("has-operation", () => {
			const cache = lru(cacheSize);
			prepopulateCache(cache, testData);
			const item = testData[Math.floor(Math.random() * testData.length)];
			cache.has(item.key);
		})
		.add("size-property", () => {
			const cache = lru(cacheSize);
			prepopulateCache(cache, testData);
			// Access size property

			return cache.size;
		});

	await bench.run();
	console.table(bench.table());
}

// Memory usage benchmarks
async function runMemoryBenchmarks () {
	console.log("\n🧠 Memory Usage Analysis");
	console.log("=" .repeat(40));

	const testSizes = [100, 1000, 10000];

	for (const size of testSizes) {
		console.log(`\nAnalyzing memory usage for cache size: ${size}`);

		const cache = lru(size);
		const testData = generateRandomData(size);

		// Memory before
		if (global.gc) {
			global.gc();
		}
		const memBefore = process.memoryUsage();

		// Fill cache
		testData.forEach(item => cache.set(item.key, item.value));

		// Memory after
		if (global.gc) {
			global.gc();
		}
		const memAfter = process.memoryUsage();

		const heapUsed = memAfter.heapUsed - memBefore.heapUsed;
		const perItem = heapUsed / size;

		console.log(`Heap used: ${(heapUsed / 1024 / 1024).toFixed(2)} MB`);
		console.log(`Per item: ${perItem.toFixed(2)} bytes`);
		console.log(`Cache size: ${cache.size}`);
	}
}

// Main execution
async function runAllBenchmarks () {
	console.log("🚀 Tiny-LRU Modern Benchmark Suite");
	console.log("==================================");
	console.log(`Node.js version: ${process.version}`);
	console.log(`Platform: ${process.platform} ${process.arch}`);
	console.log(`Date: ${new Date().toISOString()}`);

	try {
		await runSetOperationsBenchmarks();
		await runGetOperationsBenchmarks();
		await runMixedOperationsBenchmarks();
		await runSpecialOperationsBenchmarks();
		await runMemoryBenchmarks();

		console.log("\n✅ All benchmarks completed successfully!");
		console.log("\n📊 Summary:");
		console.log("- SET operations: Tests cache population under various conditions");
		console.log("- GET operations: Tests cache retrieval with different hit/miss patterns");
		console.log("- Mixed operations: Simulates real-world usage scenarios");
		console.log("- Special operations: Tests additional cache methods and edge cases");
		console.log("- Memory analysis: Shows memory consumption patterns");

	} catch (error) {
		console.error("❌ Benchmark failed:", error);
		process.exit(1);
	}
}

// Allow running this file directly
if (import.meta.url === `file://${process.argv[1]}`) {
	runAllBenchmarks();
}

export {
	runAllBenchmarks,
	runSetOperationsBenchmarks,
	runGetOperationsBenchmarks,
	runMixedOperationsBenchmarks,
	runSpecialOperationsBenchmarks,
	runMemoryBenchmarks
};

