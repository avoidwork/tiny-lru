import {LRU, lru} from "../dist/tiny-lru.cjs";
import {strict as assert} from "assert";

describe("LRU Cache", function () {
	describe("Constructor", function () {
		it("should create an LRU instance with default parameters", function () {
			const cache = new LRU();
			assert.equal(cache.max, 0);
			assert.equal(cache.ttl, 0);
			assert.equal(cache.resetTtl, false);
			assert.equal(cache.size, 0);
			assert.equal(cache.first, null);
			assert.equal(cache.last, null);
			assert.notEqual(cache.items, null);
			assert.equal(typeof cache.items, "object");
		});

		it("should create an LRU instance with custom parameters", function () {
			const cache = new LRU(10, 5000, true);
			assert.equal(cache.max, 10);
			assert.equal(cache.ttl, 5000);
			assert.equal(cache.resetTtl, true);
			assert.equal(cache.size, 0);
		});
	});

	describe("lru factory function", function () {
		it("should create an LRU instance with default parameters", function () {
			const cache = lru();
			assert.equal(cache.max, 1000);
			assert.equal(cache.ttl, 0);
			assert.equal(cache.resetTtl, false);
		});

		it("should create an LRU instance with custom parameters", function () {
			const cache = lru(50, 1000, true);
			assert.equal(cache.max, 50);
			assert.equal(cache.ttl, 1000);
			assert.equal(cache.resetTtl, true);
		});

		it("should throw TypeError for invalid max value", function () {
			assert.throws(() => lru("invalid"), TypeError, "Invalid max value");
			assert.throws(() => lru(-1), TypeError, "Invalid max value");
			assert.throws(() => lru(NaN), TypeError, "Invalid max value");
		});

		it("should throw TypeError for invalid ttl value", function () {
			assert.throws(() => lru(10, "invalid"), TypeError, "Invalid ttl value");
			assert.throws(() => lru(10, -1), TypeError, "Invalid ttl value");
			assert.throws(() => lru(10, NaN), TypeError, "Invalid ttl value");
		});

		it("should throw TypeError for invalid resetTtl value", function () {
			assert.throws(() => lru(10, 0, "invalid"), TypeError, "Invalid resetTtl value");
			assert.throws(() => lru(10, 0, 1), TypeError, "Invalid resetTtl value");
		});
	});

	describe("Basic operations", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(3);
		});

		it("should set and get values", function () {
			cache.set("key1", "value1");
			assert.equal(cache.get("key1"), "value1");
			assert.equal(cache.size, 1);
		});

		it("should return undefined for non-existent keys", function () {
			assert.equal(cache.get("nonexistent"), undefined);
		});

		it("should check if key exists with has()", function () {
			cache.set("key1", "value1");
			assert.equal(cache.has("key1"), true);
			assert.equal(cache.has("nonexistent"), false);
		});

		it("should delete items", function () {
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			assert.equal(cache.size, 2);

			cache.delete("key1");
			assert.equal(cache.size, 1);
			assert.equal(cache.has("key1"), false);
			assert.equal(cache.get("key1"), undefined);
			assert.equal(cache.get("key2"), "value2");
		});

		it("should delete non-existent key gracefully", function () {
			cache.set("key1", "value1");
			cache.delete("nonexistent");
			assert.equal(cache.size, 1);
			assert.equal(cache.get("key1"), "value1");
		});

		it("should clear all items", function () {
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			assert.equal(cache.size, 2);

			cache.clear();
			assert.equal(cache.size, 0);
			assert.equal(cache.first, null);
			assert.equal(cache.last, null);
			assert.notEqual(cache.items, null);
			assert.equal(typeof cache.items, "object");
		});

		it("should support method chaining", function () {
			const result = cache.set("key1", "value1").set("key2", "value2").clear();
			assert.equal(result, cache);
		});
	});

	describe("LRU eviction", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(3);
		});

		it("should evict least recently used item when max is reached", function () {
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key3", "value3");
			cache.set("key4", "value4"); // Should evict key1

			assert.equal(cache.size, 3);
			assert.equal(cache.has("key1"), false);
			assert.equal(cache.has("key2"), true);
			assert.equal(cache.has("key3"), true);
			assert.equal(cache.has("key4"), true);
		});

		it("should update position when accessing existing item", function () {
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key3", "value3");

			// Access key1 to make it most recently used
			cache.get("key1");

			cache.set("key4", "value4"); // Should evict key2, not key1

			assert.equal(cache.has("key1"), true);
			assert.equal(cache.has("key2"), false);
			assert.equal(cache.has("key3"), true);
			assert.equal(cache.has("key4"), true);
		});

		it("should maintain correct order in keys()", function () {
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key3", "value3");

			let keys = cache.keys();
			assert.deepEqual(keys, ["key1", "key2", "key3"]);

			// Access key1 to move it to end
			cache.get("key1");
			keys = cache.keys();
			assert.deepEqual(keys, ["key2", "key3", "key1"]);
		});

		it("should handle unlimited cache size (max = 0)", function () {
			const unlimitedCache = new LRU(0);
			for (let i = 0; i < 1000; i++) {
				unlimitedCache.set(`key${i}`, `value${i}`);
			}
			assert.equal(unlimitedCache.size, 1000);
		});
	});

	describe("Eviction methods", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(3);
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key3", "value3");
		});

		it("should evict first item with evict()", function () {
			cache.evict();
			assert.equal(cache.size, 2);
			assert.equal(cache.has("key1"), false);
			assert.equal(cache.has("key2"), true);
			assert.equal(cache.has("key3"), true);
		});

		it("should evict with bypass flag", function () {
			cache.evict(true);
			assert.equal(cache.size, 2);
		});

		it("should handle evict on empty cache", function () {
			cache.clear();
			cache.evict();
			assert.equal(cache.size, 0);
		});

		it("should handle evict on single item cache", function () {
			cache.clear();
			cache.set("only", "value");
			cache.evict();
			assert.equal(cache.size, 0);
			assert.equal(cache.first, null);
			assert.equal(cache.last, null);
		});
	});

	describe("setWithEvicted method", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(2);
		});

		it("should return null when no eviction occurs", function () {
			const evicted = cache.setWithEvicted("key1", "value1");
			assert.equal(evicted, null);
		});

		it("should return evicted item when max is reached", function () {
			cache.set("key1", "value1");
			cache.set("key2", "value2");

			const evicted = cache.setWithEvicted("key3", "value3");
			assert.notEqual(evicted, null);
			assert.equal(evicted.key, "key1");
			assert.equal(evicted.value, "value1");
		});

		it("should update existing key without eviction", function () {
			cache.set("key1", "value1");
			const evicted = cache.setWithEvicted("key1", "newvalue1");
			assert.equal(evicted, null);
			assert.equal(cache.get("key1"), "newvalue1");
		});
	});

	describe("Array methods", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(5);
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key3", "value3");
		});

		it("should return all keys in LRU order", function () {
			const keys = cache.keys();
			assert.deepEqual(keys, ["key1", "key2", "key3"]);
		});

		it("should return all values in LRU order", function () {
			const values = cache.values();
			assert.deepEqual(values, ["value1", "value2", "value3"]);
		});

		it("should return values for specific keys", function () {
			const values = cache.values(["key3", "key1"]);
			assert.deepEqual(values, ["value3", "value1"]);
		});

		it("should return entries as [key, value] pairs", function () {
			const entries = cache.entries();
			assert.deepEqual(entries, [
				["key1", "value1"],
				["key2", "value2"],
				["key3", "value3"]
			]);
		});

		it("should return entries for specific keys", function () {
			const entries = cache.entries(["key3", "key1"]);
			assert.deepEqual(entries, [
				["key3", "value3"],
				["key1", "value1"]
			]);
		});

		it("should handle empty cache", function () {
			cache.clear();
			assert.deepEqual(cache.keys(), []);
			assert.deepEqual(cache.values(), []);
			assert.deepEqual(cache.entries(), []);
		});
	});

	describe("TTL (Time To Live)", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(5, 100); // 100ms TTL
		});

		it("should set expiration time", function () {
			const beforeTime = Date.now();
			cache.set("key1", "value1");
			const expiresAt = cache.expiresAt("key1");

			assert.ok(expiresAt >= beforeTime + 100);
			assert.ok(expiresAt <= beforeTime + 200); // Allow some margin
		});

		it("should return undefined for non-existent key expiration", function () {
			assert.equal(cache.expiresAt("nonexistent"), undefined);
		});

		it("should expire items after TTL", function (done) {
			cache.set("key1", "value1");
			assert.equal(cache.get("key1"), "value1");

			setTimeout(() => {
				assert.equal(cache.get("key1"), undefined);
				assert.equal(cache.has("key1"), false);
				assert.equal(cache.size, 0);
				done();
			}, 150);
		});

		it("should handle TTL = 0 (no expiration)", function () {
			const neverExpireCache = new LRU(5, 0);
			neverExpireCache.set("key1", "value1");
			assert.equal(neverExpireCache.expiresAt("key1"), 0);
		});

		it("should reset TTL when accessing with resetTtl=true", function (done) {
			const resetCache = new LRU(5, 1000, true);
			resetCache.set("key1", "value1");

			// Check that expiration timestamp changes when updating with resetTtl=true
			const firstExpiry = resetCache.expiresAt("key1");

			// Small delay to ensure timestamp difference
			setTimeout(() => {
				resetCache.set("key1", "value1", false, true); // This should reset TTL
				const secondExpiry = resetCache.expiresAt("key1");

				assert.ok(secondExpiry > firstExpiry, "TTL should be reset");
				done();
			}, 10);
		});

		it("should not reset TTL when resetTtl=false", function (done) {
			const noResetCache = new LRU(5, 100, false);
			noResetCache.set("key1", "value1");

			setTimeout(() => {
				// Access the key but don't reset TTL
				assert.equal(noResetCache.get("key1"), "value1");

				// Check that it expires at original time
				setTimeout(() => {
					assert.equal(noResetCache.get("key1"), undefined);
					done();
				}, 75);
			}, 50);
		});
	});

	describe("Edge cases and complex scenarios", function () {
		it("should handle updating existing key with set()", function () {
			const cache = new LRU(3);
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key1", "newvalue1"); // Update existing key

			assert.equal(cache.get("key1"), "newvalue1");
			assert.equal(cache.size, 2);
		});

		it("should maintain correct first/last pointers during deletion", function () {
			const cache = new LRU(3);
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key3", "value3");

			// Delete middle item
			cache.delete("key2");
			assert.deepEqual(cache.keys(), ["key1", "key3"]);

			// Delete first item
			cache.delete("key1");
			assert.deepEqual(cache.keys(), ["key3"]);

			// Delete last item
			cache.delete("key3");
			assert.deepEqual(cache.keys(), []);
			assert.equal(cache.first, null);
			assert.equal(cache.last, null);
		});

		it("should handle complex LRU repositioning", function () {
			const cache = new LRU(4);
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);
			cache.set("d", 4);

			// Access items in different order
			cache.set("b", 22); // Move b to end
			cache.get("a"); // Move a to end
			cache.set("c", 33); // Move c to end

			assert.deepEqual(cache.keys(), ["d", "b", "a", "c"]);
		});

		it("should handle set with bypass parameter", function () {
			const cache = new LRU(3);
			cache.set("key1", "value1");
			cache.set("key2", "value2");

			// Set with bypass=true should not reposition but still updates to last
			cache.set("key1", "newvalue1", true);
			assert.deepEqual(cache.keys(), ["key2", "key1"]);
		});

		it("should handle resetTtl parameter in set method", function () {
			const cache = new LRU(3, 1000, false);
			const beforeTime = Date.now();
			cache.set("key1", "value1");

			// Set with resetTtl=true should update expiry
			cache.set("key1", "newvalue1", false, true);
			const expiresAt = cache.expiresAt("key1");
			assert.ok(expiresAt > beforeTime + 900); // Should be close to current time + TTL
		});

		it("should handle single item cache operations", function () {
			const cache = new LRU(1);

			// Set first item
			cache.set("key1", "value1");
			assert.equal(cache.first, cache.last);
			assert.equal(cache.size, 1);

			// Replace with second item
			cache.set("key2", "value2");
			assert.equal(cache.first, cache.last);
			assert.equal(cache.size, 1);
			assert.equal(cache.has("key1"), false);
			assert.equal(cache.has("key2"), true);
		});

		it("should handle empty cache operations", function () {
			const cache = new LRU(3);

			// Operations on empty cache
			assert.equal(cache.get("key1"), undefined);
			assert.equal(cache.has("key1"), false);
			cache.delete("key1"); // Should not throw
			assert.equal(cache.expiresAt("key1"), undefined);

			// Evict on empty cache
			cache.evict();
			assert.equal(cache.size, 0);
		});

		it("should handle accessing items that become last", function () {
			const cache = new LRU(3);
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key3", "value3");

			// Access the last item (should not change position)
			cache.get("key3");
			assert.deepEqual(cache.keys(), ["key1", "key2", "key3"]);
		});
	});

	describe("Memory and performance", function () {
		it("should handle large number of operations", function () {
			const cache = new LRU(1000);

			// Add 1000 items
			for (let i = 0; i < 1000; i++) {
				cache.set(`key${i}`, `value${i}`);
			}
			assert.equal(cache.size, 1000);

			// Access random items
			for (let i = 0; i < 100; i++) {
				const key = `key${Math.floor(Math.random() * 1000)}`;
				cache.get(key);
			}

			// Add more items to trigger eviction
			for (let i = 1000; i < 1100; i++) {
				cache.set(`key${i}`, `value${i}`);
			}
			assert.equal(cache.size, 1000);
		});

		it("should handle alternating set/get operations", function () {
			const cache = new LRU(10);

			for (let i = 0; i < 100; i++) {
				cache.set(`key${i % 10}`, `value${i}`);
				cache.get(`key${(i + 5) % 10}`);
			}

			assert.equal(cache.size, 10);
		});
	});

	describe("Additional coverage tests", function () {
		it("should handle setWithEvicted with unlimited cache size", function () {
			const cache = new LRU(0); // Unlimited size
			const evicted = cache.setWithEvicted("key1", "value1");
			assert.equal(evicted, null);
			assert.equal(cache.size, 1);
		});

		it("should handle setWithEvicted with first item insertion", function () {
			const cache = new LRU(2);
			cache.setWithEvicted("key1", "value1");
			assert.equal(cache.size, 1);
			assert.equal(cache.first, cache.last);
		});

		it("should handle bypass parameter with resetTtl false", function () {
			const cache = new LRU(3, 1000, false);
			cache.set("key1", "value1");
			const originalExpiry = cache.expiresAt("key1");

			// Call set with bypass=true, resetTtl=false
			cache.set("key1", "newvalue1", true, false);
			const newExpiry = cache.expiresAt("key1");

			// TTL should not be reset
			assert.equal(originalExpiry, newExpiry);
		});
	});
});
