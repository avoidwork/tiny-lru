var path = require("path"),
	lru = require(path.join("..", "lib", "tiny-lru.js"));

exports.suite = {
	setUp: function (done) {
		this.cache = lru(2, 25);
		done();
	},
	ttl: function (test) {
		const cache = this.cache;

		test.expect(1);
		cache.set("1", true);
		setTimeout(function () {
			cache.get("1");
			test.equal(cache.get("1"), void 0, "Should be 'undefined'");
			test.done();
		}, 30);
	}
};

exports.simple = {
	setUp: function (done) {
		this.cache = lru(5);
		this.items = ["a", "b", "c", "d", "e"];
		done();
	},
	test: function (test) {
		this.items.forEach(i => this.cache.set(i, false));
		test.expect(68);
		test.equal(this.cache.first, "e", "Should be 'e'");
		test.equal(this.cache.last, "a", "Should be 'a'");
		this.cache.set("e", true);
		test.equal(this.cache.first, "e", "Should be 'e'");
		test.equal(this.cache.last, "a", "Should be 'a'");
		test.equal(this.cache.cache.e.right, null, "Should be 'null'");
		test.equal(this.cache.cache.e.left, "d", "Should be 'd'");
		test.equal(this.cache.cache.d.right, "e", "Should be 'e'");
		test.equal(this.cache.cache.d.left, "c", "Should be 'c'");
		test.equal(this.cache.cache.c.right, "d", "Should be 'd'");
		test.equal(this.cache.cache.c.left, "b", "Should be 'b'");
		test.equal(this.cache.cache.b.right, "c", "Should be 'c'");
		test.equal(this.cache.cache.b.left, "a", "Should be 'a'");
		test.equal(this.cache.cache.a.right, "b", "Should be 'b'");
		test.equal(this.cache.cache.a.left, null, "Should be 'null'");
		this.cache.set("a", true);
		test.equal(this.cache.first, "a", "Should be 'a'");
		test.equal(this.cache.last, "b", "Should be 'b'");
		test.equal(this.cache.cache.a.right, null, "Should be 'null'");
		test.equal(this.cache.cache.a.left, "e", "Should be 'e'");
		test.equal(this.cache.cache.e.right, "a", "Should be 'a'");
		test.equal(this.cache.cache.e.left, "d", "Should be 'd'");
		test.equal(this.cache.cache.d.right, "e", "Should be 'e'");
		test.equal(this.cache.cache.d.left, "c", "Should be 'c'");
		test.equal(this.cache.cache.c.right, "d", "Should be 'd'");
		test.equal(this.cache.cache.c.left, "b", "Should be 'b'");
		test.equal(this.cache.cache.b.right, "c", "Should be 'c'");
		test.equal(this.cache.cache.b.left, null, "Should be 'null'");
		this.cache.set("e", false);
		test.equal(this.cache.first, "e", "Should be 'e'");
		test.equal(this.cache.last, "b", "Should be 'b'");
		test.equal(this.cache.cache.e.right, null, "Should be 'null'");
		test.equal(this.cache.cache.e.left, "a", "Should be 'a'");
		test.equal(this.cache.cache.a.right, "e", "Should be 'e'");
		test.equal(this.cache.cache.a.left, "d", "Should be 'd'");
		test.equal(this.cache.cache.d.right, "a", "Should be 'a'");
		test.equal(this.cache.cache.d.left, "c", "Should be 'c'");
		test.equal(this.cache.cache.c.right, "d", "Should be 'd'");
		test.equal(this.cache.cache.c.left, "b", "Should be 'b'");
		test.equal(this.cache.cache.b.right, "c", "Should be 'c'");
		test.equal(this.cache.cache.b.left, null, "Should be 'null'");
		this.cache.remove("a");
		test.equal(this.cache.first, "e", "Should be 'e'");
		test.equal(this.cache.last, "b", "Should be 'b'");
		test.equal(this.cache.cache.e.right, null, "Should be 'null'");
		test.equal(this.cache.cache.e.left, "d", "Should be 'a'");
		test.equal(this.cache.cache.d.right, "e", "Should be 'a'");
		test.equal(this.cache.cache.d.left, "c", "Should be 'c'");
		test.equal(this.cache.cache.c.right, "d", "Should be 'd'");
		test.equal(this.cache.cache.c.left, "b", "Should be 'b'");
		test.equal(this.cache.cache.b.right, "c", "Should be 'c'");
		test.equal(this.cache.cache.b.left, null, "Should be 'null'");
		this.cache.evict();
		test.equal(this.cache.first, "e", "Should be 'e'");
		test.equal(this.cache.last, "c", "Should be 'c'");
		test.equal(this.cache.cache.e.right, null, "Should be 'null'");
		test.equal(this.cache.cache.e.left, "d", "Should be 'a'");
		test.equal(this.cache.cache.d.right, "e", "Should be 'a'");
		test.equal(this.cache.cache.d.left, "c", "Should be 'c'");
		test.equal(this.cache.cache.c.right, "d", "Should be 'd'");
		test.equal(this.cache.cache.c.left, null, "Should be 'null'");
		this.cache.evict();
		test.equal(this.cache.first, "e", "Should be 'e'");
		test.equal(this.cache.last, "d", "Should be 'd'");
		test.equal(this.cache.cache.e.right, null, "Should be 'null'");
		test.equal(this.cache.cache.e.left, "d", "Should be 'a'");
		test.equal(this.cache.cache.d.right, "e", "Should be 'a'");
		test.equal(this.cache.cache.d.left, null, "Should be 'null'");
		this.cache.remove("a"); // no op - repeating assertions
		test.equal(this.cache.first, "e", "Should be 'e'");
		test.equal(this.cache.last, "d", "Should be 'd'");
		test.equal(this.cache.cache.e.right, null, "Should be 'null'");
		test.equal(this.cache.cache.e.left, "d", "Should be 'a'");
		test.equal(this.cache.cache.d.right, "e", "Should be 'a'");
		test.equal(this.cache.cache.d.left, null, "Should be 'null'");
		test.done();
	}
};
