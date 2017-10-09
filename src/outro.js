	function factory (max = 1000) {
		return new LRU(max);
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
