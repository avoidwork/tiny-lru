import assert from "node:assert";
import {lru} from "../dist/tiny-lru.esm.js";

describe("Testing functionality", function () {
	beforeEach(function () {
		this.cache = lru(4);
		this.items = ["a", "b", "c", "d", "e"];
	});

	it("It should evict", function () {
		this.items.forEach(i => this.cache.set(i, false));
		assert.strictEqual(this.cache.first.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.last.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.size, 4, "Should be '4'");
		this.cache.evict();
		assert.strictEqual(this.cache.first.key, "c", "Should be 'c'");
	});

	it("It should delete", function () {
		this.items.forEach(i => this.cache.set(i, false));
		assert.strictEqual(this.cache.first.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.last.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.size, 4, "Should be '4'");
		assert.strictEqual(this.cache.items.get("e").next, null, "Should be 'null'");
		assert.strictEqual(this.cache.items.get("e").prev.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.items.get("d").next.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.items.get("d").prev.key, "c", "Should be 'c'");
		assert.strictEqual(this.cache.items.get("c").next.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.items.get("c").prev.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.items.get("b").next.key, "c", "Should be 'c'");
		assert.strictEqual(this.cache.items.get("b").prev, null, "Should be 'null'");
		this.cache.delete("c");
		assert.strictEqual(this.cache.first.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.last.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.size, 3, "Should be '3'");
		assert.strictEqual(this.cache.items.get("e").next, null, "Should be 'null'");
		assert.strictEqual(this.cache.items.get("e").prev.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.items.get("d").next.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.items.get("d").prev.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.items.get("b").next.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.items.get("b").prev, null, "Should be 'null'");
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

	it("It should handle a small evict", function () {
		this.items.forEach(i => this.cache.set(i, false));
		assert.strictEqual(this.cache.first.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.last.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.size, 4, "Should be '4'");
		assert.strictEqual(this.cache.items.get("e").next, null, "Should be 'null'");
		assert.strictEqual(this.cache.items.get("e").prev.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.items.get("d").next.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.items.get("d").prev.key, "c", "Should be 'c'");
		assert.strictEqual(this.cache.items.get("c").next.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.items.get("c").prev.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.items.get("b").next.key, "c", "Should be 'c'");
		assert.strictEqual(this.cache.items.get("b").prev, null, "Should be 'null'");
		this.cache.delete("c");
		assert.strictEqual(this.cache.first.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.last.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.size, 3, "Should be '3'");
		assert.strictEqual(this.cache.items.get("e").next, null, "Should be 'null'");
		assert.strictEqual(this.cache.items.get("e").prev.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.items.get("d").next.key, "e", "Should be 'e'");
		assert.strictEqual(this.cache.items.get("d").prev.key, "b", "Should be 'b'");
		assert.strictEqual(this.cache.items.get("b").next.key, "d", "Should be 'd'");
		assert.strictEqual(this.cache.items.get("b").prev, null, "Should be 'null'");
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

	it("It should reset the TTL with optional parameter", function (done) {
		this.cache = lru(1, 6e4);
		this.cache.set(this.items[0], false);
		const n1 = this.cache.expiresAt(this.items[0]);
		assert.strictEqual(typeof n1, "number", "Should be a number");
		assert.strictEqual(n1 > 0, true, "Should be greater than zero");
		setTimeout(() => {
			this.cache.set(this.items[0], false, false, true);
			const n2 = this.cache.expiresAt(this.items[0]);
			assert.strictEqual(typeof n2, "number", "Should be a number");
			assert.strictEqual(n2 > 0, true, "Should be greater than zero");
			assert.strictEqual(n2 > n1, true, "Should be greater than first expiration timestamp");
			done();
		}, 11);
	});

	it("It should reset the TTL with optional property", function (done) {
		this.cache = lru(1, 6e4, true);
		this.cache.set(this.items[0], false);
		const n1 = this.cache.expiresAt(this.items[0]);
		assert.strictEqual(typeof n1, "number", "Should be a number");
		assert.strictEqual(n1 > 0, true, "Should be greater than zero");
		setTimeout(() => {
			this.cache.set(this.items[0], false);
			const n2 = this.cache.expiresAt(this.items[0]);
			assert.strictEqual(typeof n2, "number", "Should be a number");
			assert.strictEqual(n2 > 0, true, "Should be greater than zero");
			assert.strictEqual(n2 > n1, true, "Should be greater than first expiration timestamp");
			done();
		}, 11);
	});
});
