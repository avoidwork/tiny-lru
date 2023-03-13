import assert from "node:assert";
import {lru} from "../dist/tiny-lru.esm.js";

describe("Testing functionality", function () {
	beforeEach(function () {
		this.cache = lru(4);
		this.items = ["a", "b", "c", "d", "e"];
	});

	it("It should evict", function () {
		this.items.forEach(i => this.cache.set(i, false));
		assert.equal(this.cache.first.key, "b", "Should be 'b'");
		assert.equal(this.cache.last.key, "e", "Should be 'e'");
		assert.equal(this.cache.size, 4, "Should be '4'");
		this.cache.evict();
		assert.equal(this.cache.first.key, "c", "Should be 'c'");
	});

	it("It should delete", function () {
		this.items.forEach(i => this.cache.set(i, false));
		assert.equal(this.cache.first.key, "b", "Should be 'b'");
		assert.equal(this.cache.last.key, "e", "Should be 'e'");
		assert.equal(this.cache.size, 4, "Should be '4'");
		assert.equal(this.cache.items.e.next, null, "Should be 'null'");
		assert.equal(this.cache.items.e.prev.key, "d", "Should be 'd'");
		assert.equal(this.cache.items.d.next.key, "e", "Should be 'e'");
		assert.equal(this.cache.items.d.prev.key, "c", "Should be 'c'");
		assert.equal(this.cache.items.c.next.key, "d", "Should be 'd'");
		assert.equal(this.cache.items.c.prev.key, "b", "Should be 'b'");
		assert.equal(this.cache.items.b.next.key, "c", "Should be 'c'");
		assert.equal(this.cache.items.b.prev, null, "Should be 'null'");
		this.cache.delete("c");
		assert.equal(this.cache.first.key, "b", "Should be 'b'");
		assert.equal(this.cache.last.key, "e", "Should be 'e'");
		assert.equal(this.cache.size, 3, "Should be '3'");
		assert.equal(this.cache.items.e.next, null, "Should be 'null'");
		assert.equal(this.cache.items.e.prev.key, "d", "Should be 'd'");
		assert.equal(this.cache.items.d.next.key, "e", "Should be 'e'");
		assert.equal(this.cache.items.d.prev.key, "b", "Should be 'b'");
		assert.equal(this.cache.items.b.next.key, "d", "Should be 'd'");
		assert.equal(this.cache.items.b.prev, null, "Should be 'null'");
		this.cache.delete("e");
		assert.equal(this.cache.first.key, "b", "Should be 'b'");
		assert.equal(this.cache.last.key, "d", "Should be 'd'");
		assert.equal(this.cache.size, 2, "Should be '2'");
		this.cache.get("b");
		assert.equal(this.cache.first.key, "d", "Should be 'd'");
		assert.equal(this.cache.first.prev, null, "Should be 'null'");
		assert.equal(this.cache.first.next.key, "b", "Should be 'b'");
		assert.equal(this.cache.last.key, "b", "Should be 'b'");
		assert.equal(this.cache.last.prev.key, "d", "Should be 'd'");
		assert.equal(this.cache.last.next, null, "Should be 'null'");
		assert.equal(this.cache.size, 2, "Should be '2'");
	});

	it("It should handle a small evict", function () {
		this.items.forEach(i => this.cache.set(i, false));
		assert.equal(this.cache.first.key, "b", "Should be 'b'");
		assert.equal(this.cache.last.key, "e", "Should be 'e'");
		assert.equal(this.cache.size, 4, "Should be '4'");
		assert.equal(this.cache.items.e.next, null, "Should be 'null'");
		assert.equal(this.cache.items.e.prev.key, "d", "Should be 'd'");
		assert.equal(this.cache.items.d.next.key, "e", "Should be 'e'");
		assert.equal(this.cache.items.d.prev.key, "c", "Should be 'c'");
		assert.equal(this.cache.items.c.next.key, "d", "Should be 'd'");
		assert.equal(this.cache.items.c.prev.key, "b", "Should be 'b'");
		assert.equal(this.cache.items.b.next.key, "c", "Should be 'c'");
		assert.equal(this.cache.items.b.prev, null, "Should be 'null'");
		this.cache.delete("c");
		assert.equal(this.cache.first.key, "b", "Should be 'b'");
		assert.equal(this.cache.last.key, "e", "Should be 'e'");
		assert.equal(this.cache.size, 3, "Should be '3'");
		assert.equal(this.cache.items.e.next, null, "Should be 'null'");
		assert.equal(this.cache.items.e.prev.key, "d", "Should be 'd'");
		assert.equal(this.cache.items.d.next.key, "e", "Should be 'e'");
		assert.equal(this.cache.items.d.prev.key, "b", "Should be 'b'");
		assert.equal(this.cache.items.b.next.key, "d", "Should be 'd'");
		assert.equal(this.cache.items.b.prev, null, "Should be 'null'");
		this.cache.delete("e");
		assert.equal(this.cache.first.key, "b", "Should be 'b'");
		assert.equal(this.cache.last.key, "d", "Should be 'd'");
		assert.equal(this.cache.size, 2, "Should be '2'");
		this.cache.get("b");
		assert.equal(this.cache.first.key, "d", "Should be 'd'");
		assert.equal(this.cache.first.prev, null, "Should be 'null'");
		assert.equal(this.cache.first.next.key, "b", "Should be 'b'");
		assert.equal(this.cache.last.key, "b", "Should be 'b'");
		assert.equal(this.cache.last.prev.key, "d", "Should be 'd'");
		assert.equal(this.cache.last.next, null, "Should be 'null'");
		assert.equal(this.cache.size, 2, "Should be '2'");
	});

	it("It should handle an empty evict", function () {
		this.cache = lru(1);
		assert.equal(this.cache.first, null, "Should be 'null'");
		assert.equal(this.cache.last, null, "Should be 'null'");
		assert.equal(this.cache.size, 0, "Should be 'null'");
		this.cache.evict();
		assert.equal(this.cache.first, null, "Should be 'null'");
		assert.equal(this.cache.last, null, "Should be 'null'");
		assert.equal(this.cache.size, 0, "Should be 'null'");
	});

	it("It should return expiration time", function () {
		const ttl = 99999;
		this.cache = lru(1, ttl);
		const now = new Date();
		this.cache.set("key", "value");
		const expirationTime = this.cache.getExpirationTime("key");
		const remainingTime = expirationTime - now.getTime();
		// keep 100 msec margin of error just in case
		assert.equal(99999 - remainingTime < 100, true, "Should be within a margin of error");
	});
});
