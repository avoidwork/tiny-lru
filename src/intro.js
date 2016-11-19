"use strict";

(function (global) {
	let next = typeof process !== "undefined" ? process.nextTick : arg => setTimeout(arg, 1);

