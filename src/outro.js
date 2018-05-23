	function factory (max = 1000, notify = false, ttl = 0, expire = 0) {
		return new LRU(max, notify, ttl, expire);
	}

	// Node, AMD & window supported
	if (typeof exports !== "undefined") {
		module.exports = factory;
	} else if (typeof define === "function" && define.amd !== void 0) {
		define(() => factory);
	} else {
		global.lru = factory;
	}
}(typeof window !== "undefined" ? window : global));
