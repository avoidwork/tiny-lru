import assert from "node:assert";
import {lru} from "../dist/tiny-lru.cjs";

describe("Testing functionality", function () {

	it("setWithEvicted should return evicted item when full", function () {
		const cache = lru(2);
		cache.setWithEvicted("a", 1);
		cache.setWithEvicted("b", 2);
		const evicted = cache.setWithEvicted("c", 3);
		assert.strictEqual(evicted.key, "a", "Should evict 'a'");
		assert.strictEqual(evicted.value, 1, "Evicted value should be 1");
		assert.strictEqual(cache.size, 2, "Cache size should remain at max");
		assert.deepStrictEqual(cache.keys(), ["b", "c"], "Keys should be ['b','c']");
	});

	it("setWithEvicted should return null when not evicting", function () {
		const cache = lru(2);
		const result = cache.setWithEvicted("a", 1);
		assert.strictEqual(result, null, "Should return null when not evicting");
		cache.setWithEvicted("b", 2);
		assert.strictEqual(cache.setWithEvicted("b", 3), null, "Should return null when updating existing");
	});

	it("setWithEvicted: evicted item should not mutate after eviction", function () {
		const cache = lru(2);
		cache.setWithEvicted("a", { foo: 1 });
		cache.setWithEvicted("b", { bar: 2 });
		const evicted = cache.setWithEvicted("c", { baz: 3 });
		assert.deepStrictEqual(evicted.value, { foo: 1 }, "Evicted value should be a shallow clone");
		// Mutate cache, evicted should not change
		cache.setWithEvicted("d", { qux: 4 });
		assert.deepStrictEqual(evicted.value, { foo: 1 }, "Evicted value should remain unchanged");
	});

	beforeEach(function () {
		this.cache = lru(4);
		this.items = ["a", "b", "c", "d", "e"];
	});

	it("It should clear", function () {
		this.items.forEach(i => this.cache.set(i, false));
		assert.strictEqual(this.cache.first.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.last.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.size, 4, "Should be '4'");
		this.cache.clear();
		assert.strictEqual(this.cache.first, null, "Should be 'null'");
		assert.strictEqual(this.cache.last, null, "Should be 'null'");
		assert.strictEqual(this.cache.size, 0, "Should be '0'");
	});

	it("It should delete (size 1)", function () {
		this.cache.max = 1;
		this.items.forEach(i => this.cache.set(i, false));
		assert.strictEqual(this.cache.size, 1, "Should be '1'");
		this.cache.delete(this.cache.first.key);
		assert.strictEqual(this.cache.size, 0, "Should be '0'");
	});

	it("It should expire (size 1)", function (done) {
		this.cache.max = 1;
		this.cache.ttl = 1;
		this.items.forEach(i => this.cache.set(i, false));
		assert.strictEqual(this.cache.size, 1, "Should be '1'");
		setTimeout(() => {
			this.cache.get(this.cache.first.key);
			assert.strictEqual(this.cache.size, 0, "Should be '0'");
			done();
		}, 11);
	});

	it("It should have keys", function () {
		this.items.forEach(i => this.cache.set(i, false));
		assert.strictEqual(this.cache.has(this.items[0]), false, "Should be 'false'");
		assert.strictEqual(this.cache.has(this.items[1]), true, "Should be 'true'");
	});


	it("It should have keys() which reflect current order", function () {
		this.cache.max = this.items.length;
		this.items.forEach(i => this.cache.set(i, false));
		assert.strictEqual(JSON.stringify(this.cache.keys()), JSON.stringify(this.items), "Should be equal arrays");
	});

	it("It should have no keys() when empty", function () {
		assert.strictEqual(JSON.stringify(this.cache.keys()), JSON.stringify([]), "Should be equal");
	});

	it("It should have entries()", function () {
		this.items.forEach(i => this.cache.set(i, false));
		const entries = this.cache.entries();
		assert.strictEqual(entries.length, this.cache.keys().length, "Should be equal");
		assert.strictEqual(JSON.stringify(entries.map(i => i[0])), JSON.stringify(this.cache.keys()), "Should be equal");
		assert.strictEqual(entries[entries.length - 1][0], this.items[this.items.length - 1], "Should be equal");
	});

	it("It should evict", function () {
		this.items.forEach(i => this.cache.set(i, false));
		assert.strictEqual(this.cache.first.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.first.next.key, "c", "Should be 'c'");
		assert.strictEqual(this.cache.last.prev.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.last.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.size, 4, "Should be '4'");
		this.cache.evict();
		assert.strictEqual(this.cache.first.key, "c", "Should be 'c'");
		assert.strictEqual(this.cache.first.next.key, "d", "Should be 'c'");
		assert.strictEqual(this.cache.last.prev.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.last.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.size, 3, "Should be '4'");
	});

	it("It should delete", function () {
		this.items.forEach(i => this.cache.set(i, false));
		assert.strictEqual(this.cache.first.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.last.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.size, 4, "Should be '4'");
		assert.strictEqual(this.cache.items.e.next, null, "Should be 'null'");
		assert.strictEqual(this.cache.items.e.prev.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.items.d.next.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.items.d.prev.key, "c", "Should be 'c'");
		assert.strictEqual(this.cache.items.c.next.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.items.c.prev.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.items.b.next.key, "c", "Should be 'c'");
		assert.strictEqual(this.cache.items.b.prev, null, "Should be 'null'");
		this.cache.delete("c");
		assert.strictEqual(this.cache.first.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.last.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.size, 3, "Should be '3'");
		assert.strictEqual(this.cache.items.e.next, null, "Should be 'null'");
		assert.strictEqual(this.cache.items.e.prev.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.items.d.next.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.items.d.prev.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.items.b.next.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.items.b.prev, null, "Should be 'null'");
		this.cache.delete("e");
		assert.strictEqual(this.cache.first.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.first.next.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.last.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.last.prev.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.size, 2, "Should be '2'");
		this.cache.get("b");
		assert.strictEqual(this.cache.first.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.first.prev, null, "Should be 'null'");
		assert.strictEqual(this.cache.first.next.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.last.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.last.prev.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.last.next, null, "Should be 'null'");
		assert.strictEqual(this.cache.size, 2, "Should be '2'");
		this.cache.delete("b");
		assert.strictEqual(this.cache.first.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.first.prev, null, "Should be 'null'");
		assert.strictEqual(this.cache.first.next, null, "Should be 'null'");
		assert.strictEqual(this.cache.last.key, "d", "Should be 'b'");
		assert.strictEqual(this.cache.last.prev, null, "Should be 'null'");
		assert.strictEqual(this.cache.last.next, null, "Should be 'null'");
		assert.strictEqual(this.cache.size, 1, "Should be '1'");
	});

	it("It should re-balance", function () {
		this.items.forEach(i => this.cache.set(i, false));
		assert.strictEqual(this.cache.items.c.prev.key, "b", "Should be 'b'");
		this.cache.set("c", true);
		assert.strictEqual(this.cache.items.b.next.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.items.d.prev.key, "b", "Should be 'b'");
		assert.strictEqual(JSON.stringify(this.cache.keys()), JSON.stringify(["b", "d", "e", "c"]), "Should be equal arrays");
	});

	it("It should handle a small evict", function () {
		this.items.forEach(i => this.cache.set(i, false));
		assert.strictEqual(this.cache.first.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.last.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.size, 4, "Should be '4'");
		assert.strictEqual(this.cache.items.e.next, null, "Should be 'null'");
		assert.strictEqual(this.cache.items.e.prev.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.items.d.next.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.items.d.prev.key, "c", "Should be 'c'");
		assert.strictEqual(this.cache.items.c.next.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.items.c.prev.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.items.b.next.key, "c", "Should be 'c'");
		assert.strictEqual(this.cache.items.b.prev, null, "Should be 'null'");
		this.cache.delete("c");
		assert.strictEqual(this.cache.first.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.last.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.size, 3, "Should be '3'");
		assert.strictEqual(this.cache.items.e.next, null, "Should be 'null'");
		assert.strictEqual(this.cache.items.e.prev.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.items.d.next.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.items.d.prev.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.items.b.next.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.items.b.prev, null, "Should be 'null'");
		this.cache.delete("e");
		assert.strictEqual(this.cache.first.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.last.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.size, 2, "Should be '2'");
		this.cache.get("b");
		assert.strictEqual(this.cache.first.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.first.prev, null, "Should be 'null'");
		assert.strictEqual(this.cache.first.next.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.last.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.last.prev.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.last.next, null, "Should be 'null'");
		assert.strictEqual(this.cache.size, 2, "Should be '2'");
	});

	it("It should handle an empty evict", function () {
		this.cache = lru(1);
		assert.strictEqual(this.cache.first, null, "Should be 'null'");
		assert.strictEqual(this.cache.last, null, "Should be 'null'");
		assert.strictEqual(this.cache.size, 0, "Should be 'null'");
		this.cache.evict();
		assert.strictEqual(this.cache.first, null, "Should be 'null'");
		assert.strictEqual(this.cache.last, null, "Should be 'null'");
		assert.strictEqual(this.cache.size, 0, "Should be 'null'");
	});

	it("It should expose expiration time", function () {
		this.cache = lru(1, 6e4);
		this.cache.set(this.items[0], false);
		assert.strictEqual(typeof this.cache.expiresAt(this.items[0]), "number", "Should be a number");
		assert.strictEqual(this.cache.expiresAt("invalid"), undefined, "Should be undefined");
	});

	it("It should not have a TTL by default", function () {
		this.cache = lru(1);
		this.cache.set(this.items[0], false);
		const n1 = this.cache.expiresAt(this.items[0]);
		assert.strictEqual(typeof n1, "number", "Should be a number");
		assert.strictEqual(n1, 0, "Should be zero");
	});

	it("It should have immutable TTL on set() by default", function (done) {
		this.cache = lru(1, 6e4);
		this.cache.set(this.items[0], false);
		const n1 = this.cache.expiresAt(this.items[0]);
		assert.strictEqual(typeof n1, "number", "Should be a number");
		assert.strictEqual(n1 > 0, true, "Should be greater than zero");
		setTimeout(() => {
			this.cache.get(this.items[0]);
			const n2 = this.cache.expiresAt(this.items[0]);
			assert.strictEqual(n1, n2, "Should be equal");
			setTimeout(() => {
				this.cache.set(this.items[0], false);
				const n3 = this.cache.expiresAt(this.items[0]);
				assert.strictEqual(typeof n3, "number", "Should be a number");
				assert.strictEqual(n3 > 0, true, "Should be greater than zero");
				assert.strictEqual(n1, n3, "Should be equal to the first expiration timestamp");
				done();
			}, 11);
		}, 11);
	});

	it("It should have immutable TTL on set() with optional property of 0", function (done) {
		this.cache = lru(1, 0, true);
		this.cache.set(this.items[0], false);
		const n1 = this.cache.expiresAt(this.items[0]);
		assert.strictEqual(typeof n1, "number", "Should be a number");
		assert.strictEqual(n1, 0, "Should be zero");
		setTimeout(() => {
			this.cache.get(this.items[0]);
			const n2 = this.cache.expiresAt(this.items[0]);
			assert.strictEqual(n1, n2, "Should be equal");
			setTimeout(() => {
				this.cache.set(this.items[0], false);
				const n3 = this.cache.expiresAt(this.items[0]);
				assert.strictEqual(typeof n3, "number", "Should be a number");
				assert.strictEqual(n3, 0, "Should be zero");
				assert.strictEqual(n1, n3, "Should be equal to the first expiration timestamp");
				done();
			}, 11);
		}, 11);
	});

	it("It should reset the TTL on set() with optional parameter", function (done) {
		this.cache = lru(1, 6e4);
		this.cache.set(this.items[0], false);
		const n1 = this.cache.expiresAt(this.items[0]);
		assert.strictEqual(typeof n1, "number", "Should be a number");
		assert.strictEqual(n1 > 0, true, "Should be greater than zero");
		setTimeout(() => {
			this.cache.get(this.items[0]);
			const n2 = this.cache.expiresAt(this.items[0]);
			assert.strictEqual(n1, n2, "Should be equal");
			setTimeout(() => {
				this.cache.set(this.items[0], false, false, true);
				const n3 = this.cache.expiresAt(this.items[0]);
				assert.strictEqual(typeof n3, "number", "Should be a number");
				assert.strictEqual(n3 > 0, true, "Should be greater than zero");
				assert.strictEqual(n3 > n1, true, "Should be greater than first expiration timestamp");
				done();
			}, 11);
		}, 11);
	});

	it("It should reset the TTL on set() with optional property", function (done) {
		this.cache = lru(1, 6e4, true);
		this.cache.set(this.items[0], false);
		const n1 = this.cache.expiresAt(this.items[0]);
		assert.strictEqual(typeof n1, "number", "Should be a number");
		assert.strictEqual(n1 > 0, true, "Should be greater than zero");
		setTimeout(() => {
			this.cache.get(this.items[0]);
			const n2 = this.cache.expiresAt(this.items[0]);
			assert.strictEqual(n1, n2, "Should be equal");
			setTimeout(() => {
				this.cache.set(this.items[0], false);
				const n3 = this.cache.expiresAt(this.items[0]);
				assert.strictEqual(typeof n3, "number", "Should be a number");
				assert.strictEqual(n3 > 0, true, "Should be greater than zero");
				assert.strictEqual(n3 > n1, true, "Should be greater than first expiration timestamp");
				done();
			}, 11);
		}, 11);
	});

	it("It expires records which reset the TTL on set()", function (done) {
		this.cache = lru(1, 250, true);
		this.cache.set(this.items[0], false);
		setTimeout(() => {
			this.cache.set(this.items[0], false);
			setTimeout(() => {
				const record = this.cache.get(this.items[0]);
				assert.strictEqual(record, undefined, "Should be a 'undefined'");
				done();
			}, 255);
		}, 5);
	});

	it("It handle mid-deletes", function (done) {
		this.cache = lru(3);
		this.cache.set(this.items[0], false);
		this.cache.set(this.items[1], false);
		this.cache.set(this.items[2], false);
		this.cache.delete(this.items[1]);
		this.cache.get(this.items[2]);
		assert.strictEqual(this.cache.size, 2, "Should be 2");
		done();
	});

	it("It should have values()", function () {
		this.cache.max = this.items.length;
		this.items.forEach(i => this.cache.set(i, false));
		assert.strictEqual(JSON.stringify(this.cache.values()), JSON.stringify(Array(this.cache.max).fill(false)), "Should be equal arrays");
		assert.strictEqual(this.cache.values([this.items[0]])[0], false, "Should be 'false'");
		assert.strictEqual(this.cache.values(["invalid"])[0], undefined, "Should be 'undefined'");
	});

	it("It should Error with invalid factory parameters", function () {
		assert.throws(function () { lru(-1); }, Error);
		assert.throws(function () { lru(1, -1); }, Error);
		assert.throws(function () { lru(1, 1, -1); }, Error);
	});

	it("It should Error with invalid set parameters", function () {
		this.cache = lru(1);
		assert.throws(function () { this.cache.set(); }, Error);
		assert.throws(function () { this.cache.set(this.items[0]); }, Error);
	});

	it("It should Error with invalid delete parameters", function () {
		this.cache = lru(1);
		assert.throws(function () { this.cache.delete(); }, Error);
	});

	it("It should Error with invalid evict parameters", function () {
		this.cache = lru(1);
		assert.throws(function () { this.cache.evict(true); }, Error);
	});

	it("It should Error with invalid has parameters", function () {
		this.cache = lru(1);
		assert.throws(function () { this.cache.has(); }, Error);
	});

	it("It should Error with invalid get parameters", function () {
		this.cache = lru(1);
		assert.throws(function () { this.cache.get(); }, Error);
	});

	it("It should Error with invalid values parameters", function () {
		this.cache = lru(1);
		assert.throws(function () { this.cache.values(); }, Error);
	});

	it("It should Error with invalid keys parameters", function () {
		this.cache = lru(1);
		assert.throws(function () { this.cache.keys(); }, Error);
	});

	it("It should Error with invalid entries parameters", function () {
		this.cache = lru(1);
		assert.throws(function () { this.cache.entries(); }, Error);
	});

	it("It should Error with invalid expiresAt parameters", function () {
		this.cache = lru(1);
		assert.throws(function () { this.cache.expiresAt(); }, Error);
	});

	it("It should Error with invalid clear parameters", function () {
		this.cache = lru(1);
		assert.throws(function () { this.cache.clear(true); }, Error);
	});
});
