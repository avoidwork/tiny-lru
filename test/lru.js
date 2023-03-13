import assert from "node:assert";
import {lru} from "../dist/tiny-lru.esm.js";
import {setTimeout} from "node:timers/promises";

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

	it("It should expose expiration time", function () {
		this.cache = lru(1, 6e4);
		this.cache.set(this.items[0], false);
		assert.equal(typeof this.cache.expiresAt(this.items[0]), "number", "Should be a number");
		assert.equal(this.cache.expiresAt("invalid"), undefined, "Should be undefined");
	});

	it("It should update ttl on repeated set for the last entry", async function () {
		const ttl = 1000;
		this.cache = lru(5, ttl);
		this.cache.set(this.items[0], false);

		await setTimeout(500);
		const expiresAtBefore = this.cache.expiresAt(this.items[0]);
		const timeLeftBefore = expiresAtBefore - new Date().getTime();

		assert.equal(timeLeftBefore < 520, true);
		assert.equal(timeLeftBefore > 480, true);

		this.cache.set(this.items[0], false, false, true);
		const expiresAtAfter = this.cache.expiresAt(this.items[0]);
		const timeLeftAfter = expiresAtAfter - new Date().getTime();

		assert.equal(timeLeftAfter < 1020, true);
		assert.equal(timeLeftAfter > 980, true);
	});

	it("It should update ttl on repeated set for the non-last element", async function () {
		const ttl = 1000;
		this.cache = lru(5, ttl);
		this.cache.set(this.items[0], false);
		this.cache.set(this.items[1], false);

		await setTimeout(500);
		const expiresAtBefore = this.cache.expiresAt(this.items[0]);
		const timeLeftBefore = expiresAtBefore - new Date().getTime();

		assert.equal(timeLeftBefore < 520, true);
		assert.equal(timeLeftBefore > 480, true);

		this.cache.set(this.items[0], false, false, true);
		const expiresAtAfter = this.cache.expiresAt(this.items[0]);
		const timeLeftAfter = expiresAtAfter - new Date().getTime();

		assert.equal(timeLeftAfter < 1020, true);
		assert.equal(timeLeftAfter > 980, true);
	});

	it("It should not update ttl on repeated set when resetTtl is disabled", async function () {
		const ttl = 1000;
		this.cache = lru(5, ttl);
		this.cache.set(this.items[0], false);
		this.cache.set(this.items[1], false);

		await setTimeout(500);
		const expiresAtBefore = this.cache.expiresAt(this.items[0]);
		const timeLeftBefore = expiresAtBefore - new Date().getTime();

		assert.equal(timeLeftBefore < 520, true);
		assert.equal(timeLeftBefore > 480, true);

		this.cache.set(this.items[0], false, false, false);
		const expiresAtAfter = this.cache.expiresAt(this.items[0]);
		const timeLeftAfter = expiresAtAfter - new Date().getTime();

		assert.equal(timeLeftAfter < 520, true);
		assert.equal(timeLeftAfter > 480, true);
	});

	it("It should update ttl on repeated set by default", async function () {
		const ttl = 1000;
		this.cache = lru(5, ttl);
		this.cache.set(this.items[0], false);
		this.cache.set(this.items[1], false);

		await setTimeout(500);
		const expiresAtBefore = this.cache.expiresAt(this.items[0]);
		const timeLeftBefore = expiresAtBefore - new Date().getTime();

		assert.equal(timeLeftBefore < 520, true);
		assert.equal(timeLeftBefore > 480, true);

		this.cache.set(this.items[0], false);
		const expiresAtAfter = this.cache.expiresAt(this.items[0]);
		const timeLeftAfter = expiresAtAfter - new Date().getTime();

		assert.equal(timeLeftAfter < 1020, true);
		assert.equal(timeLeftAfter > 980, true);
	});
});
