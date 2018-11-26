var path = require("path"),
	lru = require(path.join("..", "lib", "tiny-lru.js")),
	empty = null;

exports.suite = {
	setUp: function (done) {
		this.cache = lru(2);
		done();
	},
	direct: function (test) {
		test.expect(26);
		test.equal(this.cache.length, 0, "Should be '0'");
		test.equal(this.cache.max, 2, "Should be '2'");
		test.equal(this.cache.set("test1", {prop: true}).length, 1, "Should be '1'");
		test.equal(this.cache.has("test1"), true, "Should be 'true'");
		test.equal(this.cache.first, "test1", "Should be 'test1'");
		test.equal(this.cache.last, "test1", "Should be 'test1'");
		test.equal(this.cache.set("test2", {prop: true}).length, 2, "Should be '2'");
		test.equal(this.cache.first, "test2", "Should be 'test2'");
		test.equal(this.cache.last, "test1", "Should be 'test1'");
		test.equal(this.cache.set("test3", {prop: true}).length, 2, "Should be '2'");
		test.equal(this.cache.first, "test3", "Should be 'test3'");
		test.equal(this.cache.last, "test2", "Should be 'test2'");
		test.equal(this.cache.remove("test2").value.prop, true, "Should be 'true'");
		test.equal(this.cache.length, 1, "Should be '1'");
		test.equal(this.cache.has("test2"), false, "Should be 'false'");
		test.equal(this.cache.first, "test3", "Should be 'test3'");
		test.equal(this.cache.last, "test3", "Should be 'test3'");
		test.equal(this.cache.delete("test3").value.prop, true, "Should be 'true'");
		test.equal(this.cache.length, 0, "Should be '0'");
		test.equal(this.cache.first, empty, "Should be ''");
		test.equal(this.cache.last, empty, "Should be ''");
		test.equal(this.cache.delete("test4"), undefined, "Should be 'undefined'");
		test.equal(this.cache.set("test4", empty).length, 1, "Should be '1'");
		test.equal(this.cache.delete("test4").prop, null, "Should be 'null'");
		test.equal(this.cache.delete("test4"), undefined, "Should be 'undefined'");
		test.equal(this.cache.length, 0, "Should be '0'");
		this.cache.clear();
		test.done();
	},
	realistic: function (test) {
		test.expect(30);
		test.equal(this.cache.set("1", "a").length, 1, "Should be '1'");
		test.equal(this.cache.set("2", "b").length, 2, "Should be '2'");
		test.equal(this.cache.set("1", "c").length, 2, "Should be '2'");
		test.equal(this.cache.cache["2"].next, "1", "Should be '1'");
		test.equal(this.cache.cache["2"].previous, empty, "Should be ''");
		test.equal(this.cache.get("2"), "b", "Should be 'b'");
		test.equal(this.cache.cache["2"].next, empty, "Should be ''");
		test.equal(this.cache.cache["2"].previous, "1", "Should be '1'");
		test.equal(this.cache.get("1"), "c", "Should be 'c'");
		test.equal(this.cache.cache["1"].next, empty, "Should be ''");
		test.equal(this.cache.cache["1"].previous, "2", "Should be '2'");
		this.cache.delete("1");
		test.equal(this.cache.cache["2"].next, empty, "Should be ''");
		test.equal(this.cache.cache["2"].previous, empty, "Should be ''");
		test.equal(this.cache.length, 1, "Should be '1'");
		test.equal(this.cache.first, "2", "Should be '2'");
		test.equal(this.cache.last, "2", "Should be '2'");
		test.equal(this.cache.set("3", "d").length, 2, "Should be '2'");
		test.equal(this.cache.set("3", "c").length, 2, "Should be '2'");
		test.equal(this.cache.set("3", "c").length, 2, "Should be '2'");
		test.equal(this.cache.first, "3", "Should be '3'");
		test.equal(this.cache.last, "2", "Should be '2'");
		this.cache.delete("3");
		test.equal(this.cache.first, "2", "Should be '2'");
		test.equal(this.cache.last, "2", "Should be '2'");
		test.equal(this.cache.length, 1, "Should be '1'");
		this.cache.delete("2");
		test.equal(this.cache.length, 0, "Should be '0'");
		test.equal(this.cache.set("1", "a").length, 1, "Should be '1'");
		test.equal(this.cache.set("2", "b").length, 2, "Should be '2'");
		this.cache.delete("2");
		test.equal(this.cache.length, 1, "Should be '1'");
		test.equal(this.cache.first, "1", "Should be '1'");
		test.equal(this.cache.last, "1", "Should be '1'");
		test.done();
	},
	ttl: function (test) {
		const cache = this.cache;

		cache.ttl = 25;
		test.expect(2);
		test.equal(cache.set("1", "a").length, 1, "Should be '1'");
		setTimeout(function () {
			cache.get("1");
			test.equal(cache.length, 0, "Should be '0'");
			test.done();
		}, 30);
	},
	evict: function (test) {
		function populate (arg, start = 0) {
			const nth = arg.max;
			let i = -1;

			while (++i < nth) {
				arg.set(i + start, Math.floor(Math.random() * nth));
			}
		}

		const cache = this.cache;

		cache.max = 2e5;
		test.expect(3);
		test.equal(cache.length, 0, "Should be '0'");
		populate(cache);
		test.equal(cache.length, cache.max, `Should be '${cache.max}'`);
		populate(cache, cache.max);
		test.equal(cache.length, cache.max, `Should be '${cache.max}'`);
		test.done();
	}
};
