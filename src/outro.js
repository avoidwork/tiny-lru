	function factory (max = 1000, ttl = 0) {
		if (isNaN(max) || max < 0) {
			throw new TypeError("Invalid max value");
		}

		if (isNaN(ttl) || ttl < 0) {
			throw new TypeError("Invalid ttl value");
		}

		return new LRU(max, ttl);
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
