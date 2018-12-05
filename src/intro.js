"use strict";

(function (global) {
	const next = typeof process !== "undefined" ? process.nextTick : arg => setTimeout(arg, 1),
		empty = null;

	function reset () {
		this.cache = {};
		this.first = empty;
		this.last = empty;
		this.length = 0;

		return this;
	}