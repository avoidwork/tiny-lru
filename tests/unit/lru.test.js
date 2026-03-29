import { LRU, lru } from "../../src/lru.js";
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";

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
			cache.set("key4", "value4");

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

			cache.get("key1");

			cache.set("key4", "value4");

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
				["key3", "value3"],
			]);
		});

		it("should return entries for specific keys", function () {
			const entries = cache.entries(["key3", "key1"]);
			assert.deepEqual(entries, [
				["key3", "value3"],
				["key1", "value1"],
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
			cache = new LRU(5, 100);
		});

		it("should set expiration time", function () {
			const beforeTime = Date.now();
			cache.set("key1", "value1");
			const expiresAt = cache.expiresAt("key1");

			assert.ok(expiresAt >= beforeTime + 100);
			assert.ok(expiresAt <= beforeTime + 200);
		});

		it("should return undefined for non-existent key expiration", function () {
			assert.equal(cache.expiresAt("nonexistent"), undefined);
		});

		it("should expire items after TTL", async function () {
			cache.set("key1", "value1");
			assert.equal(cache.get("key1"), "value1");

			await new Promise((resolve) => setTimeout(resolve, 150));
			assert.equal(cache.get("key1"), undefined);
			assert.equal(cache.has("key1"), false);
			assert.equal(cache.size, 0);
		});

		it("should handle TTL = 0 (no expiration)", function () {
			const neverExpireCache = new LRU(5, 0);
			neverExpireCache.set("key1", "value1");
			assert.equal(neverExpireCache.expiresAt("key1"), 0);
		});

		it("should reset TTL when updating with resetTtl=true", async function () {
			const resetCache = new LRU(5, 1000, true);
			resetCache.set("key1", "value1");

			const firstExpiry = resetCache.expiresAt("key1");

			await new Promise((resolve) => setTimeout(resolve, 10));
			resetCache.set("key1", "value1");
			const secondExpiry = resetCache.expiresAt("key1");

			assert.ok(secondExpiry > firstExpiry, "TTL should be reset");
		});

		it("should not reset TTL when resetTtl=false", async function () {
			const noResetCache = new LRU(5, 100, false);
			noResetCache.set("key1", "value1");

			await new Promise((resolve) => setTimeout(resolve, 50));
			assert.equal(noResetCache.get("key1"), "value1");

			await new Promise((resolve) => setTimeout(resolve, 75));
			assert.equal(noResetCache.get("key1"), undefined);
		});

		it("should not reset TTL on get() even with resetTtl=true", async function () {
			const resetCache = new LRU(5, 100, true);
			resetCache.set("key1", "value1");

			const firstExpiry = resetCache.expiresAt("key1");

			await new Promise((resolve) => setTimeout(resolve, 10));
			resetCache.get("key1");
			const secondExpiry = resetCache.expiresAt("key1");

			// TTL should NOT be reset by get()
			assert.ok(secondExpiry <= firstExpiry + 15, "TTL should not be reset by get()");
		});
	});

	describe("Edge cases and complex scenarios", function () {
		it("should handle updating existing key with set()", function () {
			const cache = new LRU(3);
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key1", "newvalue1");

			assert.equal(cache.get("key1"), "newvalue1");
			assert.equal(cache.size, 2);
		});

		it("should maintain correct first/last pointers during deletion", function () {
			const cache = new LRU(3);
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key3", "value3");

			cache.delete("key2");
			assert.deepEqual(cache.keys(), ["key1", "key3"]);

			cache.delete("key1");
			assert.deepEqual(cache.keys(), ["key3"]);

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

			cache.set("b", 22);
			cache.get("a");
			cache.set("c", 33);

			assert.deepEqual(cache.keys(), ["d", "b", "a", "c"]);
		});

		it("should handle single item cache operations", function () {
			const cache = new LRU(1);

			cache.set("key1", "value1");
			assert.equal(cache.first, cache.last);
			assert.equal(cache.size, 1);

			cache.set("key2", "value2");
			assert.equal(cache.first, cache.last);
			assert.equal(cache.size, 1);
			assert.equal(cache.has("key1"), false);
			assert.equal(cache.has("key2"), true);
		});

		it("should handle empty cache operations", function () {
			const cache = new LRU(3);

			assert.equal(cache.get("key1"), undefined);
			assert.equal(cache.has("key1"), false);
			cache.delete("key1");
			assert.equal(cache.expiresAt("key1"), undefined);

			cache.evict();
			assert.equal(cache.size, 0);
		});

		it("should handle accessing items that become last", function () {
			const cache = new LRU(3);
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key3", "value3");

			cache.get("key3");
			assert.deepEqual(cache.keys(), ["key1", "key2", "key3"]);
		});

		it("should clear prev/next pointers on eviction for garbage collection", function () {
			const cache = new LRU(2);
			cache.set("key1", "value1");
			cache.set("key2", "value2");

			const firstItem = cache.first;
			cache.set("key3", "value3");

			// Evicted item should have nullified pointers
			assert.equal(firstItem.prev, null);
			assert.equal(firstItem.next, null);
		});

		it("should clear prev/next pointers on delete for garbage collection", function () {
			const cache = new LRU(3);
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key3", "value3");

			const middleItem = cache.items["key2"];
			cache.delete("key2");

			assert.equal(middleItem.prev, null);
			assert.equal(middleItem.next, null);
		});

		it("should handle first/last consistency after middle deletion", function () {
			const cache = new LRU(3);
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);

			cache.delete("b");

			assert.equal(cache.first.key, "a");
			assert.equal(cache.last.key, "c");
			assert.equal(cache.first.next.key, "c");
			assert.equal(cache.last.prev.key, "a");
		});

		it("should handle first/last consistency after first deletion", function () {
			const cache = new LRU(3);
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);

			cache.delete("a");

			assert.equal(cache.first.key, "b");
			assert.equal(cache.last.key, "c");
			assert.equal(cache.first.prev, null);
		});

		it("should handle first/last consistency after last deletion", function () {
			const cache = new LRU(3);
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);

			cache.delete("c");

			assert.equal(cache.first.key, "a");
			assert.equal(cache.last.key, "b");
			assert.equal(cache.last.next, null);
		});
	});

	describe("Different key types", function () {
		it("should handle number keys", function () {
			const cache = new LRU(3);
			cache.set(1, "one");
			cache.set(2, "two");
			cache.set(3, "three");

			assert.equal(cache.get(1), "one");
			assert.equal(cache.get(2), "two");
			assert.equal(cache.has(3), true);
		});

		it("should handle null as key value", function () {
			const cache = new LRU(3);
			cache.set("key1", null);
			assert.equal(cache.get("key1"), null);
			assert.equal(cache.has("key1"), true);
		});

		it("should handle undefined as key value", function () {
			const cache = new LRU(3);
			cache.set("key1", undefined);
			assert.equal(cache.get("key1"), undefined);
			assert.equal(cache.has("key1"), true);
		});

		it("should handle function values", function () {
			const cache = new LRU(3);
			const fn = () => "hello";
			cache.set("key1", fn);

			const retrieved = cache.get("key1");
			assert.equal(retrieved(), "hello");
		});

		it("should handle object values", function () {
			const cache = new LRU(3);
			const obj = { nested: { value: 42 } };
			cache.set("key1", obj);

			const retrieved = cache.get("key1");
			assert.equal(retrieved.nested.value, 42);
		});

		it("should handle array values", function () {
			const cache = new LRU(3);
			const arr = [1, 2, 3, 4, 5];
			cache.set("key1", arr);

			const retrieved = cache.get("key1");
			assert.deepEqual(retrieved, [1, 2, 3, 4, 5]);
		});
	});

	describe("Unlimited cache (max=0) edge cases", function () {
		it("should never evict with unlimited size", function () {
			const cache = new LRU(0);
			for (let i = 0; i < 10000; i++) {
				cache.set(`key${i}`, `value${i}`);
			}
			assert.equal(cache.size, 10000);
			assert.equal(cache.has("key0"), true);
			assert.equal(cache.has("key9999"), true);
		});

		it("should maintain LRU order with unlimited size", function () {
			const cache = new LRU(0);
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);

			cache.get("a");

			assert.deepEqual(cache.keys(), ["b", "c", "a"]);
		});
	});

	describe("Memory and performance", function () {
		it("should handle large number of operations", function () {
			const cache = new LRU(1000);

			for (let i = 0; i < 1000; i++) {
				cache.set(`key${i}`, `value${i}`);
			}
			assert.equal(cache.size, 1000);

			for (let i = 0; i < 100; i++) {
				const key = `key${Math.floor(Math.random() * 1000)}`;
				cache.get(key);
			}

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
			const cache = new LRU(0);
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

		it("should set expiry when using setWithEvicted with ttl > 0", function () {
			const cache = new LRU(2, 100);
			const before = Date.now();
			cache.set("a", 1);
			cache.set("b", 2);
			const evicted = cache.setWithEvicted("c", 3);
			assert.notEqual(evicted, null);
			const expiry = cache.expiresAt("c");
			assert.ok(expiry >= before + 100);
			assert.ok(expiry <= before + 250);
		});

		it("should set expiry to 0 when resetTtl=true and ttl=0 on update", function () {
			const cache = new LRU(2, 0, true);
			cache.set("x", 1);
			assert.equal(cache.expiresAt("x"), 0);
			cache.set("x", 2);
			assert.equal(cache.expiresAt("x"), 0);
		});

		it("should set expiry to 0 when resetTtl=true and ttl=0 on setWithEvicted", function () {
			const cache = new LRU(2, 0, true);
			cache.set("x", 1);
			assert.equal(cache.expiresAt("x"), 0);
			cache.setWithEvicted("x", 2);
			assert.equal(cache.expiresAt("x"), 0);
		});

		it("should handle evict on empty cache without errors", function () {
			const cache = new LRU(3);
			cache.evict();
			assert.equal(cache.size, 0);
			assert.equal(cache.first, null);
			assert.equal(cache.last, null);
		});

		it("should handle updating first item with setWithEvicted", function () {
			const cache = new LRU(2);
			cache.set("a", 1);
			cache.set("b", 2);

			const evicted = cache.setWithEvicted("a", 10);
			assert.equal(evicted, null);
			assert.equal(cache.get("a"), 10);
			assert.deepEqual(cache.keys(), ["b", "a"]);
		});

		it("should handle updating last item with setWithEvicted", function () {
			const cache = new LRU(2);
			cache.set("a", 1);
			cache.set("b", 2);

			const evicted = cache.setWithEvicted("b", 20);
			assert.equal(evicted, null);
			assert.equal(cache.get("b"), 20);
			assert.deepEqual(cache.keys(), ["a", "b"]);
		});

		it("should return correct evicted item shape", function () {
			const cache = new LRU(1, 1000);
			cache.set("old", "value");
			const firstExpiry = cache.expiresAt("old");

			const evicted = cache.setWithEvicted("new", "newvalue");

			assert.equal(evicted.key, "old");
			assert.equal(evicted.value, "value");
			assert.equal(evicted.expiry, firstExpiry);
			assert.equal(typeof evicted.expiry, "number");
		});

		it("should handle entries() with non-existent keys", function () {
			const cache = new LRU(3);
			cache.set("a", 1);
			cache.set("b", 2);

			const entries = cache.entries(["a", "nonexistent", "b"]);
			assert.deepEqual(entries, [
				["a", 1],
				["nonexistent", undefined],
				["b", 2],
			]);
		});

		it("should handle values() with non-existent keys", function () {
			const cache = new LRU(3);
			cache.set("a", 1);
			cache.set("b", 2);

			const values = cache.values(["a", "nonexistent", "b"]);
			assert.deepEqual(values, [1, undefined, 2]);
		});
	});

	describe("peek method", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(3);
		});

		it("should retrieve value without moving to end", function () {
			cache.set("key1", "value1");
			cache.set("key2", "value2");

			assert.equal(cache.peek("key1"), "value1");
			assert.deepEqual(cache.keys(), ["key1", "key2"]);
		});

		it("should return undefined for non-existent key", function () {
			assert.equal(cache.peek("nonexistent"), undefined);
		});

		it("should not affect LRU order when used with get", function () {
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key3", "value3");

			cache.peek("key1");
			cache.get("key2");

			assert.deepEqual(cache.keys(), ["key1", "key3", "key2"]);
		});

		it("should work with TTL enabled but not check expiration", function () {
			const ttlCache = new LRU(3, 100);
			ttlCache.set("key1", "value1");

			assert.equal(ttlCache.peek("key1"), "value1");

			const expiry = ttlCache.expiresAt("key1");
			assert.ok(expiry > 0);
		});

		it("should allow peek after get maintains LRU order", function () {
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.set("key3", "value3");

			cache.get("key1");
			cache.peek("key2");

			assert.deepEqual(cache.keys(), ["key2", "key3", "key1"]);
		});
	});

	describe("forEach method", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(5);
			cache.set("a", 1).set("b", 2).set("c", 3);
		});

		it("should iterate over all items in LRU order", function () {
			const result = [];
			cache.forEach((value, key) => {
				result.push({ key, value });
			});

			assert.deepEqual(result, [
				{ key: "a", value: 1 },
				{ key: "b", value: 2 },
				{ key: "c", value: 3 },
			]);
		});

		it("should iterate without modifying LRU order", function () {
			const result = [];
			cache.forEach((value, key) => {
				result.push(key);
			});

			assert.deepEqual(result, ["a", "b", "c"]);
			assert.deepEqual(cache.keys(), ["a", "b", "c"]);
		});

		it("should not modify LRU order when calling peek() during forEach", function () {
			const result = [];
			cache.forEach((value, key) => {
				result.push(key);
				cache.peek(key);
			});

			assert.deepEqual(result, ["a", "b", "c"]);
			assert.deepEqual(cache.keys(), ["a", "b", "c"]);
		});

		it("should work with thisArg parameter", function () {
			const context = { items: [] };
			cache.forEach(function (value, key) {
				this.items.push({ key, value });
			}, context);

			assert.deepEqual(context.items, [
				{ key: "a", value: 1 },
				{ key: "b", value: 2 },
				{ key: "c", value: 3 },
			]);
		});

		it("should return this for chaining", function () {
			const result = cache.forEach(() => {});
			assert.equal(result, cache);
		});

		it("should handle empty cache", function () {
			cache.clear();
			const result = [];
			cache.forEach((value, key) => result.push({ key, value }));
			assert.deepEqual(result, []);
		});

		it("should iterate in correct LRU order after operations", function () {
			cache.get("a");
			cache.set("d", 4);

			const result = [];
			cache.forEach((value, key) => result.push(key));

			assert.deepEqual(result, ["b", "c", "a", "d"]);
		});

		it("should allow deleting items after collecting keys during iteration", function () {
			const keysToDelete = [];
			cache.forEach((value, key) => {
				if (value === 2) {
					keysToDelete.push(key);
				}
			});

			keysToDelete.forEach((key) => cache.delete(key));

			assert.equal(cache.size, 2);
			assert.equal(cache.has("b"), false);
		});
	});

	describe("getMany method", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(5);
			cache.set("a", 1).set("b", 2).set("c", 3);
		});

		it("should retrieve multiple values", function () {
			const result = cache.getMany(["a", "c"]);
			assert.deepEqual(result, { a: 1, c: 3 });
		});

		it("should handle non-existent keys", function () {
			const result = cache.getMany(["a", "nonexistent", "c"]);
			assert.deepEqual(result, { a: 1, nonexistent: undefined, c: 3 });
		});

		it("should handle empty array", function () {
			const result = cache.getMany([]);
			assert.deepEqual(result, {});
		});

		it("should expire items when TTL is enabled", async function () {
			const ttlCache = new LRU(5, 50);
			ttlCache.set("a", 1).set("b", 2);

			await new Promise((resolve) => setTimeout(resolve, 100));

			const result = ttlCache.getMany(["a", "b"]);
			assert.equal(result.a, undefined);
			assert.equal(result.b, undefined);
		});

		it("should update LRU order for retrieved items", function () {
			cache.getMany(["a", "b"]);

			assert.deepEqual(cache.keys(), ["c", "a", "b"]);
		});

		it("should work with single key", function () {
			const result = cache.getMany(["b"]);
			assert.deepEqual(result, { b: 2 });
		});
	});

	describe("hasAll method", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(5);
			cache.set("a", 1).set("b", 2).set("c", 3);
		});

		it("should return true when all keys exist", function () {
			assert.equal(cache.hasAll(["a", "b"]), true);
			assert.equal(cache.hasAll(["a", "b", "c"]), true);
		});

		it("should return false when any key is missing", function () {
			assert.equal(cache.hasAll(["a", "nonexistent"]), false);
			assert.equal(cache.hasAll(["a", "b", "nonexistent"]), false);
		});

		it("should return true for empty array", function () {
			assert.equal(cache.hasAll([]), true);
		});

		it("should return false for expired items with TTL", async function () {
			const ttlCache = new LRU(5, 50);
			ttlCache.set("a", 1).set("b", 2);

			await new Promise((resolve) => setTimeout(resolve, 100));

			assert.equal(ttlCache.hasAll(["a", "b"]), false);
		});

		it("should not modify LRU order", function () {
			cache.hasAll(["a", "b"]);
			assert.deepEqual(cache.keys(), ["a", "b", "c"]);
		});
	});

	describe("hasAny method", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(5);
			cache.set("a", 1).set("b", 2).set("c", 3);
		});

		it("should return true when any key exists", function () {
			assert.equal(cache.hasAny(["a", "nonexistent"]), true);
			assert.equal(cache.hasAny(["nonexistent", "b"]), true);
		});

		it("should return false when no keys exist", function () {
			assert.equal(cache.hasAny(["nonexistent1", "nonexistent2"]), false);
		});

		it("should return false for empty array", function () {
			assert.equal(cache.hasAny([]), false);
		});

		it("should return false for all expired items with TTL", async function () {
			const ttlCache = new LRU(5, 50);
			ttlCache.set("a", 1).set("b", 2);

			await new Promise((resolve) => setTimeout(resolve, 100));

			assert.equal(ttlCache.hasAny(["a", "b"]), false);
		});

		it("should not modify LRU order", function () {
			cache.hasAny(["a", "b"]);
			assert.deepEqual(cache.keys(), ["a", "b", "c"]);
		});
	});

	describe("cleanup method", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(5, 100);
		});

		it("should remove expired items", async function () {
			cache.set("a", 1);
			cache.set("b", 2);

			await new Promise((resolve) => setTimeout(resolve, 150));

			const removed = cache.cleanup();
			assert.equal(removed, 2);
			assert.equal(cache.size, 0);
		});

		it("should return 0 when no items expired", async function () {
			cache.set("a", 1);
			cache.set("b", 2);

			const removed = cache.cleanup();
			assert.equal(removed, 0);
			assert.equal(cache.size, 2);
		});

		it("should return 0 when TTL is disabled", function () {
			const noTtlCache = new LRU(5, 0);
			noTtlCache.set("a", 1);

			const removed = noTtlCache.cleanup();
			assert.equal(removed, 0);
		});

		it("should not affect valid items", async function () {
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);

			await new Promise((resolve) => setTimeout(resolve, 50));

			const removed = cache.cleanup();
			assert.equal(removed, 0);
			assert.equal(cache.size, 3);
		});

		it("should handle mixed expired and valid items", async function () {
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);

			await new Promise((resolve) => setTimeout(resolve, 150));

			cache.set("d", 4);
			cache.set("e", 5);

			const removed = cache.cleanup();
			assert.equal(removed, 3);
			assert.equal(cache.size, 2);
			assert.equal(cache.has("a"), false);
			assert.equal(cache.has("b"), false);
			assert.equal(cache.has("c"), false);
			assert.equal(cache.has("d"), true);
			assert.equal(cache.has("e"), true);
		});

		it("should return 0 for empty cache", function () {
			const removed = cache.cleanup();
			assert.equal(removed, 0);
		});
	});

	describe("toJSON method", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(5);
			cache.set("a", 1).set("b", 2).set("c", 3);
		});

		it("should serialize cache items", function () {
			const json = cache.toJSON();
			assert.strictEqual(Array.isArray(json), true);
			assert.equal(json.length, 3);

			assert.deepEqual(json[0], { key: "a", value: 1, expiry: 0 });
			assert.deepEqual(json[1], { key: "b", value: 2, expiry: 0 });
			assert.deepEqual(json[2], { key: "c", value: 3, expiry: 0 });
		});

		it("should include expiry timestamps when TTL is enabled", function () {
			const ttlCache = new LRU(5, 1000);
			ttlCache.set("a", 1);

			const json = ttlCache.toJSON();
			assert.ok(json[0].expiry > 0);
		});

		it("should preserve LRU order", function () {
			cache.get("a");
			const json = cache.toJSON();

			assert.deepEqual(json[0].key, "b");
			assert.deepEqual(json[1].key, "c");
			assert.deepEqual(json[2].key, "a");
		});

		it("should return empty array for empty cache", function () {
			cache.clear();
			const json = cache.toJSON();
			assert.deepEqual(json, []);
		});

		it("should be compatible with JSON.stringify", function () {
			const jsonStr = JSON.stringify(cache);
			const parsed = JSON.parse(jsonStr);

			assert.strictEqual(Array.isArray(parsed), true);
			assert.equal(parsed.length, 3);
		});
	});

	describe("stats method", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(3);
			cache.set("a", 1).set("b", 2).set("c", 3);
		});

		it("should return statistics object", function () {
			const stats = cache.stats();
			assert.strictEqual(typeof stats, "object");
			assert.ok("hits" in stats);
			assert.ok("misses" in stats);
			assert.ok("sets" in stats);
			assert.ok("deletes" in stats);
			assert.ok("evictions" in stats);
		});

		it("should track set operations", function () {
			cache.set("d", 4);
			const stats = cache.stats();
			assert.equal(stats.sets, 4);
		});

		it("should track get hits", function () {
			cache.get("a");
			cache.get("b");
			const stats = cache.stats();
			assert.equal(stats.hits, 2);
		});

		it("should track get misses", function () {
			cache.get("nonexistent");
			const stats = cache.stats();
			assert.equal(stats.misses, 1);
		});

		it("should track delete operations", function () {
			cache.delete("a");
			const stats = cache.stats();
			assert.equal(stats.deletes, 1);
		});

		it("should track evictions", function () {
			cache.set("d", 4);
			cache.set("e", 5);
			const stats = cache.stats();
			assert.equal(stats.evictions, 2);
		});

		it("should return a copy, not the internal object", function () {
			const stats1 = cache.stats();
			cache.set("d", 4);
			const stats2 = cache.stats();

			assert.equal(stats1.sets, 3);
			assert.equal(stats2.sets, 4);
		});

		it("should track correct hits/misses with has()", function () {
			cache.has("a");
			cache.has("nonexistent");
			const stats = cache.stats();

			assert.equal(stats.hits, 0);
			assert.equal(stats.misses, 0);
		});

		it("should reset on clear()", function () {
			cache.get("a");
			cache.clear();
			const stats = cache.stats();

			assert.equal(stats.hits, 0);
			assert.equal(stats.misses, 0);
			assert.equal(stats.sets, 0);
			assert.equal(stats.deletes, 0);
			assert.equal(stats.evictions, 0);
		});

		it("should track evictions with onEvict callback", function () {
			let evictedKey;
			cache.onEvict((item) => {
				evictedKey = item.key;
			});

			cache.set("d", 4);
			cache.set("e", 5);

			const stats = cache.stats();
			assert.equal(stats.evictions, 2);
			assert.equal(evictedKey, "b");
		});
	});

	describe("onEvict method", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(3);
		});

		it("should register evict callback", function () {
			let evicted = null;
			cache.onEvict((item) => {
				evicted = item;
			});

			cache.set("a", 1).set("b", 2).set("c", 3).set("d", 4);

			assert.ok(evicted !== null);
			assert.equal(evicted.key, "a");
			assert.equal(evicted.value, 1);
		});

		it("should receive correct item shape", function () {
			cache.set("a", 1).set("b", 2).set("c", 3);

			let receivedItem;
			cache.onEvict((item) => {
				receivedItem = item;
			});

			cache.set("d", 4);

			assert.equal(receivedItem.key, "a");
			assert.equal(receivedItem.value, 1);
			assert.ok("expiry" in receivedItem);
		});

		it("should work with TTL expiry via cleanup", async function () {
			const ttlCache = new LRU(5, 50);
			ttlCache.set("a", 1).set("b", 2).set("c", 3);

			await new Promise((resolve) => setTimeout(resolve, 100));
			const removed = ttlCache.cleanup();

			assert.equal(removed, 3);
			assert.equal(ttlCache.size, 0);
		});

		it("should only have last registered callback", function () {
			let firstCalled = false;
			let secondCalled = false;

			cache.onEvict(() => {
				firstCalled = true;
			});

			cache.onEvict(() => {
				secondCalled = true;
			});

			cache.set("a", 1).set("b", 2).set("c", 3).set("d", 4);

			assert.equal(firstCalled, false);
			assert.equal(secondCalled, true);
		});

		it("should return this for chaining", function () {
			const result = cache.onEvict(() => {});
			assert.equal(result, cache);
		});

		it("should handle multiple evictions", function () {
			const evictedItems = [];
			cache.onEvict((item) => {
				evictedItems.push(item);
			});

			cache.set("a", 1).set("b", 2).set("c", 3).set("d", 4).set("e", 5).set("f", 6);

			assert.equal(evictedItems.length, 3);
			assert.equal(evictedItems[0].key, "a");
			assert.equal(evictedItems[1].key, "b");
			assert.equal(evictedItems[2].key, "c");
		});
	});

	describe("sizeByTTL method", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(10, 100);
		});

		it("should return counts for valid, expired, and noTTL items", function () {
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);

			assert.deepEqual(cache.sizeByTTL(), { valid: 3, expired: 0, noTTL: 0 });
		});

		it("should count expired items correctly", async function () {
			cache.set("a", 1);
			cache.set("b", 2);

			await new Promise((resolve) => setTimeout(resolve, 150));

			const counts = cache.sizeByTTL();
			assert.equal(counts.valid, 0);
			assert.equal(counts.expired, 2);
			assert.equal(counts.noTTL, 0);
		});

		it("should count noTTL items when ttl=0", function () {
			const noTtlCache = new LRU(10, 0);
			noTtlCache.set("a", 1).set("b", 2);

			assert.deepEqual(noTtlCache.sizeByTTL(), { valid: 2, expired: 0, noTTL: 2 });
		});

		it("should handle items with expiry=0 when ttl>0 (manual expiry set)", function () {
			const cache = new LRU(10, 100);
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);

			cache.items["a"].expiry = 0;
			cache.items["b"].expiry = 0;

			const counts = cache.sizeByTTL();
			assert.equal(counts.valid, 3);
			assert.equal(counts.expired, 0);
			assert.equal(counts.noTTL, 2);
		});

		it("should handle mixed expired and valid items", async function () {
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);

			await new Promise((resolve) => setTimeout(resolve, 150));

			cache.set("d", 4);
			cache.set("e", 5);

			const counts = cache.sizeByTTL();
			assert.equal(counts.valid, 2);
			assert.equal(counts.expired, 3);
			assert.equal(counts.noTTL, 0);
		});

		it("should return zero counts for empty cache", function () {
			assert.deepEqual(cache.sizeByTTL(), { valid: 0, expired: 0, noTTL: 0 });
		});

		it("should not modify cache state", function () {
			cache.set("a", 1).set("b", 2);
			const originalSize = cache.size;

			cache.sizeByTTL();

			assert.equal(cache.size, originalSize);
		});
	});

	describe("keysByTTL method", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(10, 100);
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);
		});

		it("should return keys grouped by TTL status", function () {
			const result = cache.keysByTTL();
			assert.ok("valid" in result);
			assert.ok("expired" in result);
			assert.ok("noTTL" in result);
		});

		it("should return all keys in valid array when none expired", function () {
			const result = cache.keysByTTL();
			assert.deepEqual(result.valid.sort(), ["a", "b", "c"]);
			assert.deepEqual(result.expired, []);
		});

		it("should return correct expired keys after TTL", async function () {
			await new Promise((resolve) => setTimeout(resolve, 150));
			const result = cache.keysByTTL();

			assert.deepEqual(result.valid, []);
			assert.deepEqual(result.expired.sort(), ["a", "b", "c"]);
		});

		it("should handle noTTL when ttl=0", function () {
			const noTtlCache = new LRU(10, 0);
			noTtlCache.set("a", 1).set("b", 2);

			const result = noTtlCache.keysByTTL();
			assert.deepEqual(result.valid.sort(), ["a", "b"]);
			assert.deepEqual(result.expired, []);
			assert.deepEqual(result.noTTL.sort(), ["a", "b"]);
		});

		it("should handle items with expiry=0 when ttl>0 (manual expiry set)", function () {
			const cache = new LRU(10, 100);
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);

			cache.items["a"].expiry = 0;
			cache.items["b"].expiry = 0;

			const result = cache.keysByTTL();
			assert.equal(result.valid.length, 3);
			assert.equal(result.expired.length, 0);
			assert.deepEqual(result.noTTL.sort(), ["a", "b"]);
			assert.ok(result.valid.includes("a"));
			assert.ok(result.valid.includes("b"));
			assert.ok(result.valid.includes("c"));
		});

		it("should return empty arrays for empty cache", function () {
			cache.clear();
			const result = cache.keysByTTL();
			assert.deepEqual(result.valid, []);
			assert.deepEqual(result.expired, []);
			assert.deepEqual(result.noTTL, []);
		});

		it("should preserve key order", function () {
			const result = cache.keysByTTL();
			assert.deepEqual(result.valid, ["a", "b", "c"]);
		});

		it("should handle mixed expired and valid", async function () {
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);

			await new Promise((resolve) => setTimeout(resolve, 150));

			cache.set("d", 4);
			cache.set("e", 5);

			const result = cache.keysByTTL();
			assert.equal(result.valid.length, 2);
			assert.equal(result.expired.length, 3);
			assert.ok(result.valid.includes("d"));
			assert.ok(result.valid.includes("e"));
			assert.ok(result.expired.includes("a"));
			assert.ok(result.expired.includes("b"));
			assert.ok(result.expired.includes("c"));
		});
	});

	describe("valuesByTTL method", function () {
		let cache;

		beforeEach(function () {
			cache = new LRU(10, 100);
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);
		});

		it("should return values grouped by TTL status", function () {
			const result = cache.valuesByTTL();
			assert.ok("valid" in result);
			assert.ok("expired" in result);
			assert.ok("noTTL" in result);
		});

		it("should return all values in valid array when none expired", function () {
			const result = cache.valuesByTTL();
			assert.deepEqual(result.valid, [1, 2, 3]);
			assert.deepEqual(result.expired, []);
		});

		it("should handle items with expiry=0 when ttl>0 (manual expiry set)", function () {
			const cache = new LRU(10, 100);
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);

			cache.items["a"].expiry = 0;
			cache.items["b"].expiry = 0;

			const result = cache.valuesByTTL();
			assert.equal(result.valid.length, 3);
			assert.equal(result.expired.length, 0);
			assert.deepEqual(result.noTTL.sort(), [1, 2]);
			assert.ok(result.valid.includes(1));
			assert.ok(result.valid.includes(2));
			assert.ok(result.valid.includes(3));
		});

		it("should return correct expired values after TTL", async function () {
			await new Promise((resolve) => setTimeout(resolve, 150));
			const result = cache.valuesByTTL();

			assert.deepEqual(result.valid, []);
			assert.deepEqual(result.expired.sort(), [1, 2, 3]);
		});

		it("should handle noTTL when ttl=0", function () {
			const noTtlCache = new LRU(10, 0);
			noTtlCache.set("a", 1).set("b", 2);

			const result = noTtlCache.valuesByTTL();
			assert.deepEqual(result.valid.sort(), [1, 2]);
			assert.deepEqual(result.expired, []);
			assert.deepEqual(result.noTTL.sort(), [1, 2]);
		});

		it("should return empty arrays for empty cache", function () {
			cache.clear();
			const result = cache.valuesByTTL();
			assert.deepEqual(result.valid, []);
			assert.deepEqual(result.expired, []);
			assert.deepEqual(result.noTTL, []);
		});

		it("should preserve value order matching keys", function () {
			const result = cache.valuesByTTL();
			assert.deepEqual(result.valid, [1, 2, 3]);
		});

		it("should handle mixed expired and valid", async function () {
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);

			await new Promise((resolve) => setTimeout(resolve, 150));

			cache.set("d", 4);
			cache.set("e", 5);

			const result = cache.valuesByTTL();
			assert.equal(result.valid.length, 2);
			assert.equal(result.expired.length, 3);
			assert.ok(result.valid.includes(4));
			assert.ok(result.valid.includes(5));
			assert.ok(result.expired.includes(1));
			assert.ok(result.expired.includes(2));
			assert.ok(result.expired.includes(3));
		});
	});
});
