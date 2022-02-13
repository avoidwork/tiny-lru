"use strict";

const path = require("path"),
	lru = require(path.join("..", "lib", "tiny-lru.cjs.js"));

exports.evict = {
	setUp: function (done) {
		this.cache = lru(4);
		this.items = ["a", "b", "c", "d", "e"];
		done();
	},
	test: function (test) {
		this.items.forEach(i => this.cache.set(i, false));
		test.expect(6);
		test.equal(this.cache.first.key, "b", "Should be 'b'");
		test.equal(this.cache.last.key, "e", "Should be 'e'");
		test.equal(this.cache.size, 4, "Should be '4'");
		this.cache.evict();
		test.equal(this.cache.first.key, "c", "Should be 'c'");
		test.equal(this.cache.last.key, "e", "Should be 'e'");
		test.equal(this.cache.size, 3, "Should be '3'");
		test.done();
	}
};

exports.deletion = {
	setUp: function (done) {
		this.cache = lru(4);
		this.items = ["a", "b", "c", "d", "e"];
		done();
	},
	test: function (test) {
		this.items.forEach(i => this.cache.set(i, false));
		test.expect(30);
		test.equal(this.cache.first.key, "b", "Should be 'b'");
		test.equal(this.cache.last.key, "e", "Should be 'e'");
		test.equal(this.cache.size, 4, "Should be '4'");
		test.equal(this.cache.items.e.next, null, "Should be 'null'");
		test.equal(this.cache.items.e.prev.key, "d", "Should be 'd'");
		test.equal(this.cache.items.d.next.key, "e", "Should be 'e'");
		test.equal(this.cache.items.d.prev.key, "c", "Should be 'c'");
		test.equal(this.cache.items.c.next.key, "d", "Should be 'd'");
		test.equal(this.cache.items.c.prev.key, "b", "Should be 'b'");
		test.equal(this.cache.items.b.next.key, "c", "Should be 'c'");
		test.equal(this.cache.items.b.prev, null, "Should be 'null'");
		this.cache.delete("c");
		test.equal(this.cache.first.key, "b", "Should be 'b'");
		test.equal(this.cache.last.key, "e", "Should be 'e'");
		test.equal(this.cache.size, 3, "Should be '3'");
		test.equal(this.cache.items.e.next, null, "Should be 'null'");
		test.equal(this.cache.items.e.prev.key, "d", "Should be 'd'");
		test.equal(this.cache.items.d.next.key, "e", "Should be 'e'");
		test.equal(this.cache.items.d.prev.key, "b", "Should be 'b'");
		test.equal(this.cache.items.b.next.key, "d", "Should be 'd'");
		test.equal(this.cache.items.b.prev, null, "Should be 'null'");
		this.cache.delete("e");
		test.equal(this.cache.first.key, "b", "Should be 'b'");
		test.equal(this.cache.last.key, "d", "Should be 'd'");
		test.equal(this.cache.size, 2, "Should be '2'");
		this.cache.get("b");
		test.equal(this.cache.first.key, "d", "Should be 'd'");
		test.equal(this.cache.first.prev, null, "Should be 'null'");
		test.equal(this.cache.first.next.key, "b", "Should be 'b'");
		test.equal(this.cache.last.key, "b", "Should be 'b'");
		test.equal(this.cache.last.prev.key, "d", "Should be 'd'");
		test.equal(this.cache.last.next, null, "Should be 'null'");
		test.equal(this.cache.size, 2, "Should be '2'");
		test.done();
	}
};

