"use strict";

(function (global) {
	const next = typeof process !== "undefined" ? process.nextTick : arg => setTimeout(arg, 1),
		keys = typeof Reflect !== "undefined" ? Reflect.ownKeys : Object.keys;
