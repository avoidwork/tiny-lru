#!/usr/bin/env node

/**
 * Comprehensive LRU cache library comparison benchmark
 * Compares tiny-lru against other popular LRU implementations
 */

import { Bench } from "tinybench";
import { lru as tinyLru } from "../src/lru.js";

// Import comparison libraries (installed with --no-save)
let LRUCache, QuickLRU, MnemonistLRU;

try {
	const lruCacheModule = await import("lru-cache");
	LRUCache = lruCacheModule.LRUCache || lruCacheModule.default;
} catch {
	console.error("lru-cache not found. Run: npm install --no-save lru-cache");
	process.exit(1);
}

try {
	const quickLruModule = await import("quick-lru");
	QuickLRU = quickLruModule.default;
} catch {
	console.error("quick-lru not found. Run: npm install --no-save quick-lru");
	process.exit(1);
}

try {
	// Import from mnemonist using the correct export pattern
	const mnemonistModule = await import("mnemonist");
	MnemonistLRU = mnemonistModule.LRUCache;
} catch (error) {
	console.error("mnemonist not found. Run: npm install --no-save mnemonist");
	console.error("Error:", error.message);
	process.exit(1);
}

// Configuration
const CACHE_SIZE = 1000;
const TTL_MS = 60000; // 1 minute for libraries that support it
const ITERATIONS = 10000;

// Test data generation
function generateTestData (count) {
	const keys = [];
	const values = [];

	for (let i = 0; i < count; i++) {
		keys.push(`key_${i}_${Math.random().toString(36).substring(2)}`);
		values.push({
			id: i,
			data: `value_${i}`,
			timestamp: Date.now(),
			nested: { foo: "bar", baz: i }
		});
	}

	return { keys, values };
}

// Initialize caches
function createCaches () {
	return {
		"tiny-lru": tinyLru(CACHE_SIZE),
		"tiny-lru-ttl": tinyLru(CACHE_SIZE, TTL_MS),
		"lru-cache": new LRUCache({ max: CACHE_SIZE }),
		"lru-cache-ttl": new LRUCache({ max: CACHE_SIZE, ttl: TTL_MS }),
		"quick-lru": new QuickLRU({ maxSize: CACHE_SIZE }),
		"mnemonist": new MnemonistLRU(CACHE_SIZE)
	};
}

// Memory usage helper
function getMemoryUsage () {
	if (global.gc) {
		global.gc();
	}

	return process.memoryUsage();
}

// Calculate memory per item
function calculateMemoryPerItem (beforeMem, afterMem, itemCount) {
	const heapDiff = afterMem.heapUsed - beforeMem.heapUsed;

	return Math.round(heapDiff / itemCount);
}

// Bundle size estimation (approximate)
const bundleSizes = {
	"tiny-lru": "2.1KB",
	"lru-cache": "~15KB",
	"quick-lru": "~1.8KB",
	"mnemonist": "~45KB"
};

async function runBenchmarks () {
	console.log("🚀 LRU Cache Library Comparison Benchmark\n");
	console.log(`Cache Size: ${CACHE_SIZE} items`);
	console.log(`Iterations: ${ITERATIONS.toLocaleString()}`);
	console.log(`Node.js: ${process.version}`);
	console.log(`Platform: ${process.platform} ${process.arch}\n`);

	const testData = generateTestData(ITERATIONS);

	// SET operations benchmark
	console.log("📊 SET Operations Benchmark");
	console.log("=" .repeat(50));

	const setBench = new Bench({ time: 2000 });

	setBench
		.add("tiny-lru set", () => {
			const cache = tinyLru(CACHE_SIZE);
			for (let i = 0; i < 1000; i++) {
				cache.set(testData.keys[i % testData.keys.length], testData.values[i % testData.values.length]);
			}
		})
		.add("tiny-lru-ttl set", () => {
			const cache = tinyLru(CACHE_SIZE, TTL_MS);
			for (let i = 0; i < 1000; i++) {
				cache.set(testData.keys[i % testData.keys.length], testData.values[i % testData.values.length]);
			}
		})
		.add("lru-cache set", () => {
			const cache = new LRUCache({ max: CACHE_SIZE });
			for (let i = 0; i < 1000; i++) {
				cache.set(testData.keys[i % testData.keys.length], testData.values[i % testData.values.length]);
			}
		})
		.add("lru-cache-ttl set", () => {
			const cache = new LRUCache({ max: CACHE_SIZE, ttl: TTL_MS });
			for (let i = 0; i < 1000; i++) {
				cache.set(testData.keys[i % testData.keys.length], testData.values[i % testData.values.length]);
			}
		})
		.add("quick-lru set", () => {
			const cache = new QuickLRU({ maxSize: CACHE_SIZE });
			for (let i = 0; i < 1000; i++) {
				cache.set(testData.keys[i % testData.keys.length], testData.values[i % testData.values.length]);
			}
		})
		.add("mnemonist set", () => {
			const cache = new MnemonistLRU(CACHE_SIZE);
			for (let i = 0; i < 1000; i++) {
				cache.set(testData.keys[i % testData.keys.length], testData.values[i % testData.values.length]);
			}
		});

	await setBench.run();
	setBench.table();

	// GET operations benchmark (with pre-populated caches)
	console.log("\n📊 GET Operations Benchmark");
	console.log("=" .repeat(50));

	const caches = createCaches();

	// Pre-populate all caches
	Object.values(caches).forEach(cache => {
		for (let i = 0; i < Math.min(CACHE_SIZE, 500); i++) {
			cache.set(testData.keys[i], testData.values[i]);
		}
	});

	const getBench = new Bench({ time: 2000 });

	getBench
		.add("tiny-lru get", () => {
			for (let i = 0; i < 1000; i++) {
				caches["tiny-lru"].get(testData.keys[i % 500]);
			}
		})
		.add("tiny-lru-ttl get", () => {
			for (let i = 0; i < 1000; i++) {
				caches["tiny-lru-ttl"].get(testData.keys[i % 500]);
			}
		})
		.add("lru-cache get", () => {
			for (let i = 0; i < 1000; i++) {
				caches["lru-cache"].get(testData.keys[i % 500]);
			}
		})
		.add("lru-cache-ttl get", () => {
			for (let i = 0; i < 1000; i++) {
				caches["lru-cache-ttl"].get(testData.keys[i % 500]);
			}
		})
		.add("quick-lru get", () => {
			for (let i = 0; i < 1000; i++) {
				caches["quick-lru"].get(testData.keys[i % 500]);
			}
		})
		.add("mnemonist get", () => {
			for (let i = 0; i < 1000; i++) {
				caches.mnemonist.get(testData.keys[i % 500]);
			}
		});

	await getBench.run();
	getBench.table();

	// DELETE operations benchmark
	console.log("\n📊 DELETE Operations Benchmark");
	console.log("=" .repeat(50));

	const deleteBench = new Bench({ time: 2000 });

	deleteBench
		.add("tiny-lru delete", () => {
			const cache = tinyLru(CACHE_SIZE);
			// Pre-populate
			for (let i = 0; i < 100; i++) {
				cache.set(testData.keys[i], testData.values[i]);
			}
			// Delete
			for (let i = 0; i < 50; i++) {
				cache.delete(testData.keys[i]);
			}
		})
		.add("lru-cache delete", () => {
			const cache = new LRUCache({ max: CACHE_SIZE });
			// Pre-populate
			for (let i = 0; i < 100; i++) {
				cache.set(testData.keys[i], testData.values[i]);
			}
			// Delete
			for (let i = 0; i < 50; i++) {
				cache.delete(testData.keys[i]);
			}
		})
		.add("quick-lru delete", () => {
			const cache = new QuickLRU({ maxSize: CACHE_SIZE });
			// Pre-populate
			for (let i = 0; i < 100; i++) {
				cache.set(testData.keys[i], testData.values[i]);
			}
			// Delete
			for (let i = 0; i < 50; i++) {
				cache.delete(testData.keys[i]);
			}
		})
		.add("mnemonist delete", () => {
			const cache = new MnemonistLRU(CACHE_SIZE);
			// Pre-populate
			for (let i = 0; i < 100; i++) {
				cache.set(testData.keys[i], testData.values[i]);
			}
			// Delete (using remove method)
			for (let i = 0; i < 50; i++) {
				cache.remove(testData.keys[i]);
			}
		});

	await deleteBench.run();
	deleteBench.table();

	// Memory usage analysis
	console.log("\n📊 Memory Usage Analysis");
	console.log("=" .repeat(50));

	const memoryResults = {};
	const testSize = 1000;

	for (const [name, cache] of Object.entries(createCaches())) {
		const beforeMem = getMemoryUsage();

		// Fill cache
		for (let i = 0; i < testSize; i++) {
			cache.set(testData.keys[i], testData.values[i]);
		}

		const afterMem = getMemoryUsage();
		const memoryPerItem = calculateMemoryPerItem(beforeMem, afterMem, testSize);

		memoryResults[name] = {
			totalMemory: afterMem.heapUsed - beforeMem.heapUsed,
			memoryPerItem: memoryPerItem,
			bundleSize: bundleSizes[name.split("-")[0]] || "N/A"
		};
	}

	console.log("\nMemory Usage Results:");
	console.log("┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐");
	console.log("│ Library         │ Bundle Size     │ Memory/Item     │ Total Memory    │");
	console.log("├─────────────────┼─────────────────┼─────────────────┼─────────────────┤");

	Object.entries(memoryResults).forEach(([name, data]) => {
		const nameCol = name.padEnd(15);
		const bundleCol = data.bundleSize.padEnd(15);
		const memoryCol = `${data.memoryPerItem} bytes`.padEnd(15);
		const totalCol = `${Math.round(data.totalMemory / 1024)} KB`.padEnd(15);
		console.log(`│ ${nameCol} │ ${bundleCol} │ ${memoryCol} │ ${totalCol} │`);
	});

	console.log("└─────────────────┴─────────────────┴─────────────────┴─────────────────┘");

	// Performance summary
	console.log("\n📊 Performance Summary");
	console.log("=" .repeat(50));

	const setResults = setBench.tasks.map(task => ({
		name: task.name,
		opsPerSec: task.result?.hz ? Math.round(task.result.hz) : 0
	}));

	const getResults = getBench.tasks.map(task => ({
		name: task.name,
		opsPerSec: task.result?.hz ? Math.round(task.result.hz) : 0
	}));

	console.log("\nOperations per second (higher is better):");
	console.log("┌─────────────────┬─────────────────┬─────────────────┐");
	console.log("│ Library         │ SET ops/sec     │ GET ops/sec     │");
	console.log("├─────────────────┼─────────────────┼─────────────────┤");

	// Group results by library
	const libraries = ["tiny-lru", "lru-cache", "quick-lru", "mnemonist"];

	libraries.forEach(lib => {
		const setResult = setResults.find(r => r.name.includes(lib));
		const getResult = getResults.find(r => r.name.includes(lib));

		if (setResult && getResult) {
			const nameCol = lib.padEnd(15);
			const setCol = setResult.opsPerSec.toLocaleString().padEnd(15);
			const getCol = getResult.opsPerSec.toLocaleString().padEnd(15);
			console.log(`│ ${nameCol} │ ${setCol} │ ${getCol} │`);
		}
	});

	console.log("└─────────────────┴─────────────────┴─────────────────┘");

	console.log("\n✅ Benchmark completed!");
	console.log("\nTo regenerate this data, run: npm run benchmark:comparison");
}

// Handle unhandled promise rejections
process.on("unhandledRejection", error => {
	console.error("Unhandled promise rejection:", error);
	process.exit(1);
});

// Run benchmarks
runBenchmarks().catch(console.error);
