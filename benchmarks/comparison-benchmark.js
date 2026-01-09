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
	MnemonistLRU = mnemonistModule.LRUCacheWithDelete;
} catch (error) {
	console.error("mnemonist not found. Run: npm install --no-save mnemonist");
	console.error("Error:", error.message);
	process.exit(1);
}

// Configuration
const CACHE_SIZE = 1000;
const TTL_MS = 60000; // 1 minute for libraries that support it
const ITERATIONS = 10000;
const OPS_PER_INVOCATION = 50; // Do multiple ops per call to reduce harness overhead

/**
 * Generates deterministic test data to avoid random/Date overhead in hot paths.
 *
 * @param {number} count - Number of items to generate
 * @returns {{keys: string[], values: Array<{id:number,data:string,nested:{foo:string,baz:number}}>} }
 */
function generateTestData (count) {
	const keys = new Array(count);
	const values = new Array(count);

	for (let i = 0; i < count; i++) {
		keys[i] = `key_${i}`;
		values[i] = {
			id: i,
			data: `value_${i}`,
			nested: { foo: "bar", baz: i }
		};
	}

	return { keys, values };
}

/**
 * Precomputes access patterns to remove Math.random from critical sections.
 *
 * @param {number} length - Number of accesses to generate
 * @param {number} modulo - Upper bound for indices
 * @returns {Uint32Array}
 */
function generateAccessPattern (length, modulo) {
	const pattern = new Uint32Array(length);
	let x = 123456789;
	let y = 362436069;
	// Xorshift-based fast PRNG to avoid using Math.random()
	for (let i = 0; i < length; i++) {
		x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
		y = y + 1 >>> 0;
		const n = x + y >>> 0;
		pattern[i] = n % modulo;
	}

	return pattern;
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
/**
 * Retrieves memory usage; optionally forces a GC cycle if available.
 *
 * @param {boolean} force - Whether to call global.gc() if available
 * @returns {NodeJS.MemoryUsage}
 */
function getMemoryUsage (force = false) {
	if (force && global.gc) {
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
	const setPattern = generateAccessPattern(ITERATIONS, testData.keys.length);
	const getPattern = generateAccessPattern(ITERATIONS, Math.min(CACHE_SIZE, 500));
	const updatePattern = generateAccessPattern(ITERATIONS, 100);
	const deletePattern = generateAccessPattern(ITERATIONS, 50);

	// SET operations benchmark
	console.log("📊 SET Operations Benchmark");
	console.log("=" .repeat(50));

	const setBench = new Bench({ time: 2000 });

	// Dedicated caches and state for SET to avoid measuring setup per-iteration
	const setCaches = createCaches();
	const setState = {
		"tiny-lru": 0,
		"tiny-lru-ttl": 0,
		"lru-cache": 0,
		"lru-cache-ttl": 0,
		"quick-lru": 0,
		"mnemonist": 0
	};

	setBench
		.add("tiny-lru set", () => {
			const cache = setCaches["tiny-lru"];
			let i = setState["tiny-lru"]; // cursor
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = setPattern[i++ % setPattern.length];
				cache.set(testData.keys[idx], testData.values[idx]);
			}
			setState["tiny-lru"] = i;
		})
		.add("tiny-lru-ttl set", () => {
			const cache = setCaches["tiny-lru-ttl"];
			let i = setState["tiny-lru-ttl"];
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = setPattern[i++ % setPattern.length];
				cache.set(testData.keys[idx], testData.values[idx]);
			}
			setState["tiny-lru-ttl"] = i;
		})
		.add("lru-cache set", () => {
			const cache = setCaches["lru-cache"];
			let i = setState["lru-cache"];
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = setPattern[i++ % setPattern.length];
				cache.set(testData.keys[idx], testData.values[idx]);
			}
			setState["lru-cache"] = i;
		})
		.add("lru-cache-ttl set", () => {
			const cache = setCaches["lru-cache-ttl"];
			let i = setState["lru-cache-ttl"];
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = setPattern[i++ % setPattern.length];
				cache.set(testData.keys[idx], testData.values[idx]);
			}
			setState["lru-cache-ttl"] = i;
		})
		.add("quick-lru set", () => {
			const cache = setCaches["quick-lru"];
			let i = setState["quick-lru"];
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = setPattern[i++ % setPattern.length];
				cache.set(testData.keys[idx], testData.values[idx]);
			}
			setState["quick-lru"] = i;
		})
		.add("mnemonist set", () => {
			const cache = setCaches.mnemonist;
			let i = setState.mnemonist;
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = setPattern[i++ % setPattern.length];
				cache.set(testData.keys[idx], testData.values[idx]);
			}
			setState.mnemonist = i;
		});

	await setBench.run();
	console.table(setBench.table());

	// GET operations benchmark (with pre-populated caches)
	console.log("\n📊 GET Operations Benchmark");
	console.log("=" .repeat(50));

	const caches = createCaches();

	// Pre-populate all caches deterministically
	const prepopulated = Math.min(CACHE_SIZE, 500);
	Object.values(caches).forEach(cache => {
		for (let i = 0; i < prepopulated; i++) {
			cache.set(testData.keys[i], testData.values[i]);
		}
	});

	const getBench = new Bench({ time: 2000 });
	const getState = { idx: 0 };

	getBench
		.add("tiny-lru get", () => {
			let i = getState.idx;
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = getPattern[i++ % getPattern.length];
				caches["tiny-lru"].get(testData.keys[idx]);
			}
			getState.idx = i;
		})
		.add("tiny-lru-ttl get", () => {
			let i = getState.idx;
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = getPattern[i++ % getPattern.length];
				caches["tiny-lru-ttl"].get(testData.keys[idx]);
			}
			getState.idx = i;
		})
		.add("lru-cache get", () => {
			let i = getState.idx;
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = getPattern[i++ % getPattern.length];
				caches["lru-cache"].get(testData.keys[idx]);
			}
			getState.idx = i;
		})
		.add("lru-cache-ttl get", () => {
			let i = getState.idx;
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = getPattern[i++ % getPattern.length];
				caches["lru-cache-ttl"].get(testData.keys[idx]);
			}
			getState.idx = i;
		})
		.add("quick-lru get", () => {
			let i = getState.idx;
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = getPattern[i++ % getPattern.length];
				caches["quick-lru"].get(testData.keys[idx]);
			}
			getState.idx = i;
		})
		.add("mnemonist get", () => {
			let i = getState.idx;
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = getPattern[i++ % getPattern.length];
				caches.mnemonist.get(testData.keys[idx]);
			}
			getState.idx = i;
		});

	await getBench.run();
	console.table(getBench.table());

	// DELETE operations benchmark
	console.log("\n📊 DELETE Operations Benchmark");
	console.log("=" .repeat(50));

	const deleteBench = new Bench({ time: 2000 });

	// Dedicated caches and state for DELETE
	const deleteCaches = {
		"tiny-lru": tinyLru(CACHE_SIZE),
		"lru-cache": new LRUCache({ max: CACHE_SIZE }),
		"quick-lru": new QuickLRU({ maxSize: CACHE_SIZE }),
		"mnemonist": new MnemonistLRU(CACHE_SIZE)
	};
	const deleteState = { idx: 0 };

	// Pre-populate
	Object.values(deleteCaches).forEach(cache => {
		for (let i = 0; i < 100; i++) {
			cache.set(testData.keys[i], testData.values[i]);
		}
	});

	deleteBench
		.add("tiny-lru delete", () => {
			let i = deleteState.idx;
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = deletePattern[i++ % deletePattern.length];
				deleteCaches["tiny-lru"].delete(testData.keys[idx]);
				// Re-add to keep steady state for future deletes
				deleteCaches["tiny-lru"].set(testData.keys[idx], testData.values[idx]);
			}
			deleteState.idx = i;
		})
		.add("lru-cache delete", () => {
			let i = deleteState.idx;
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = deletePattern[i++ % deletePattern.length];
				deleteCaches["lru-cache"].delete(testData.keys[idx]);
				deleteCaches["lru-cache"].set(testData.keys[idx], testData.values[idx]);
			}
			deleteState.idx = i;
		})
		.add("quick-lru delete", () => {
			let i = deleteState.idx;
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = deletePattern[i++ % deletePattern.length];
				deleteCaches["quick-lru"].delete(testData.keys[idx]);
				deleteCaches["quick-lru"].set(testData.keys[idx], testData.values[idx]);
			}
			deleteState.idx = i;
		})
		.add("mnemonist delete", () => {
			let i = deleteState.idx;
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = deletePattern[i++ % deletePattern.length];
				deleteCaches.mnemonist.remove(testData.keys[idx]);
				deleteCaches.mnemonist.set(testData.keys[idx], testData.values[idx]);
			}
			deleteState.idx = i;
		});

	await deleteBench.run();
	console.table(deleteBench.table());

	// UPDATE operations benchmark
	console.log("\n📊 UPDATE Operations Benchmark");
	console.log("=" .repeat(50));

	const updateBench = new Bench({ time: 2000 });

	// Dedicated caches for UPDATE
	const updateCaches = createCaches();
	// Pre-populate with initial values
	Object.values(updateCaches).forEach(cache => {
		for (let i = 0; i < 100; i++) {
			cache.set(testData.keys[i], testData.values[i]);
		}
	});

	const updateState = { idx: 0 };

	updateBench
		.add("tiny-lru update", () => {
			let i = updateState.idx;
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = updatePattern[i++ % updatePattern.length];
				updateCaches["tiny-lru"].set(testData.keys[idx], testData.values[(idx + 50) % testData.values.length]);
			}
			updateState.idx = i;
		})
		.add("tiny-lru-ttl update", () => {
			let i = updateState.idx;
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = updatePattern[i++ % updatePattern.length];
				updateCaches["tiny-lru-ttl"].set(testData.keys[idx], testData.values[(idx + 50) % testData.values.length]);
			}
			updateState.idx = i;
		})
		.add("lru-cache update", () => {
			let i = updateState.idx;
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = updatePattern[i++ % updatePattern.length];
				updateCaches["lru-cache"].set(testData.keys[idx], testData.values[(idx + 50) % testData.values.length]);
			}
			updateState.idx = i;
		})
		.add("lru-cache-ttl update", () => {
			let i = updateState.idx;
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = updatePattern[i++ % updatePattern.length];
				updateCaches["lru-cache-ttl"].set(testData.keys[idx], testData.values[(idx + 50) % testData.values.length]);
			}
			updateState.idx = i;
		})
		.add("quick-lru update", () => {
			let i = updateState.idx;
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = updatePattern[i++ % updatePattern.length];
				updateCaches["quick-lru"].set(testData.keys[idx], testData.values[(idx + 50) % testData.values.length]);
			}
			updateState.idx = i;
		})
		.add("mnemonist update", () => {
			let i = updateState.idx;
			for (let j = 0; j < OPS_PER_INVOCATION; j++) {
				const idx = updatePattern[i++ % updatePattern.length];
				updateCaches.mnemonist.set(testData.keys[idx], testData.values[(idx + 50) % testData.values.length]);
			}
			updateState.idx = i;
		});

	await updateBench.run();
	console.table(updateBench.table());

	// Memory usage analysis
	console.log("\n📊 Memory Usage Analysis");
	console.log("=" .repeat(50));

	const memoryResults = {};
	const testSize = 1000;

	for (const [name, cache] of Object.entries(createCaches())) {
		const beforeMem = getMemoryUsage(true);

		// Fill cache
		for (let i = 0; i < testSize; i++) {
			cache.set(testData.keys[i], testData.values[i]);
		}

		const afterMem = getMemoryUsage(true);
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

	const updateResults = updateBench.tasks.map(task => ({
		name: task.name,
		opsPerSec: task.result?.hz ? Math.round(task.result.hz) : 0
	}));

	const deleteResults = deleteBench.tasks.map(task => ({
		name: task.name,
		opsPerSec: task.result?.hz ? Math.round(task.result.hz) : 0
	}));

	console.log("\nOperations per second (higher is better):");
	console.log("┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐");
	console.log("│ Library         │ SET ops/sec     │ GET ops/sec     │ UPDATE ops/sec  │ DELETE ops/sec  │");
	console.log("├─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤");

	// Group results by library
	const libraries = ["tiny-lru", "lru-cache", "quick-lru", "mnemonist"];

	libraries.forEach(lib => {
		const setResult = setResults.find(r => r.name.includes(lib));
		const getResult = getResults.find(r => r.name.includes(lib));
		const updateResult = updateResults.find(r => r.name.includes(lib));
		const deleteResult = deleteResults.find(r => r.name.includes(lib));

		if (setResult && getResult && updateResult && deleteResult) {
			const nameCol = lib.padEnd(15);
			const setCol = setResult.opsPerSec.toLocaleString().padEnd(15);
			const getCol = getResult.opsPerSec.toLocaleString().padEnd(15);
			const updateCol = updateResult.opsPerSec.toLocaleString().padEnd(15);
			const deleteCol = deleteResult.opsPerSec.toLocaleString().padEnd(15);
			console.log(`│ ${nameCol} │ ${setCol} │ ${getCol} │ ${updateCol} │ ${deleteCol} │`);
		}
	});

	console.log("└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘");

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
