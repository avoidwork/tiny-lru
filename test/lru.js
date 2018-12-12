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
		test.expect(14);
		test.equal(this.cache.first, "e", "Should be 'e'");
		test.equal(this.cache.last, "a", "Should be 'a'");
		this.cache.set("e", true);
		test.equal(this.cache.first, "e", "Should be 'e'");
		test.equal(this.cache.last, "a", "Should be 'a'");
		this.cache.set("a", true);
		test.equal(this.cache.first, "a", "Should be 'a'");
		test.equal(this.cache.last, "b", "Should be 'b'");
		this.cache.remove("a");
		test.equal(this.cache.first, "e", "Should be 'e'");
		test.equal(this.cache.last, "b", "Should be 'b'");
		this.cache.evict();
		test.equal(this.cache.first, "e", "Should be 'e'");
		test.equal(this.cache.last, "c", "Should be 'c'");
		this.cache.evict();
		test.equal(this.cache.first, "e", "Should be 'e'");
		test.equal(this.cache.last, "d", "Should be 'd'");
		this.cache.remove("a");
		test.equal(this.cache.first, "e", "Should be 'e'");
		test.equal(this.cache.last, "d", "Should be 'd'");
		test.done();
	}
};
