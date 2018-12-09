"use strict";

(function (global) {
	const empty = null;

	function link (item, key) {
		item.next = key;

		if (item.previous === key) {
			item.previous = empty;
		}
	}
