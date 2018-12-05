var path = require("path"),
	lru = require(path.join("..", "lib", "tiny-lru.js")),
	empty = null;

exports.suite = {
	setUp: function (done) {
		this.cache = lru(2);
		done();
	},
	realistic: function (test) {
		test.expect(33);
		test.equal(this.cache.set("1", "a").length, 1, "Should be '1'");
		test.equal(this.cache.cache["1"].next, empty, `Should be '${empty}'`);
		test.equal(this.cache.cache["1"].previous, empty, `Should be '${empty}'`);
		test.equal(this.cache.set("2", "b").length, 2, "Should be '2'");
		test.equal(this.cache.cache["1"].next, "2", "Should be '2'");
		test.equal(this.cache.cache["1"].previous, empty, `Should be '${empty}'`);
		test.equal(this.cache.cache["2"].next, empty, `Should be '${empty}'`);
		test.equal(this.cache.cache["2"].previous, "1", "Should be '1'");
		test.equal(this.cache.set("1", "c").length, 2, "Should be '2'");
		test.equal(this.cache.cache["1"].next, empty, "Should be '2'");
		test.equal(this.cache.cache["1"].previous, "2", `Should be '${empty}'`);
		test.equal(this.cache.cache["2"].next, "1", `Should be '${empty}'`);
		test.equal(this.cache.cache["2"].previous, empty, "Should be '1'");
		test.equal(this.cache.set("1", "d").length, 2, "Should be '2'");
		test.equal(this.cache.cache["1"].next, empty, "Should be '2'");
		test.equal(this.cache.cache["1"].previous, "2", `Should be '${empty}'`);
		test.equal(this.cache.cache["2"].next, "1", `Should be '${empty}'`);
		test.equal(this.cache.cache["2"].previous, empty, "Should be '1'");
		test.equal(this.cache.set("2", "e").length, 2, "Should be '2'");
		test.equal(this.cache.cache["1"].next, "2", "Should be '2'");
		test.equal(this.cache.cache["1"].previous, empty, `Should be '${empty}'`);
		test.equal(this.cache.cache["2"].next, empty, `Should be '${empty}'`);
		test.equal(this.cache.cache["2"].previous, "1", "Should be '1'");
		test.equal(this.cache.set("3", "e").length, 2, "Should be '2'");
		test.equal(this.cache.cache["2"].next, "3", `Should be '${empty}'`);
		test.equal(this.cache.cache["2"].previous, empty, "Should be '1'");
		test.equal(this.cache.cache["3"].next, empty, `Should be '${empty}'`);
		test.equal(this.cache.cache["3"].previous, "2", "Should be '1'");
		this.cache.delete("2");
		test.equal(this.cache.length, 1, "Should be '1'");
		test.equal(this.cache.first, "3", "Should be '3'");
		test.equal(this.cache.last, "3", "Should be '3'");
		test.equal(this.cache.cache["3"].next, empty, `Should be '${empty}'`);
		test.equal(this.cache.cache["3"].previous, empty, `Should be '${empty}'`);
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

		cache.max = 2e4;
		cache.expiry = 25;

		test.expect(11);
		test.equal(cache.length, 0, "Should be '0'");
		populate(cache);
		test.equal(cache.length, cache.max, `Should be '${cache.max}'`);
		populate(cache, cache.max);
		test.equal(cache.length, cache.max, `Should be '${cache.max}'`);
		cache.remove(20004);
		cache.remove(20006);
		setTimeout(() => {
			cache.remove(20007);

			const first = cache.first;

			cache.get(20003);

			const item = cache.cache[20003];

			test.equal(cache.first, 20003, "Should be '20003'");
			test.equal(item.next, null, "Should be 'null'");
			test.equal(item.previous, first, `Should be '${first}'`);
			cache.remove(first);
			test.equal(item.previous, first - 1, `Should be '${first - 1}'`);
			test.equal(cache.cache[first - 1].next, cache.first, `Should be '${cache.first}'`);
			test.equal(cache.cache[first - 1].previous, first - 2, `Should be '${first - 2}'`);
			test.equal(Object.keys(cache.cache).map(i => cache.cache[i]).filter(i => i.next === null).length, 1, "Should be '1'");
			test.equal(Object.keys(cache.cache).map(i => cache.cache[i]).filter(i => i.previous === null).length, 1, "Should be '1'");
			test.done();
		}, 25);
	}
};
