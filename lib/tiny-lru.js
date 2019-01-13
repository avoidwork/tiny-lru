/**
 * Tiny LRU cache for Client or Server
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2019
 * @license BSD-3-Clause
 * @link https://github.com/avoidwork/tiny-lru
 * @version 5.1.3
 */
"use strict";

(function (global) {
	const empty = null;

	class LRU {
		constructor (max, ttl) {
			this.clear();
			this.max = max;
			this.ttl = ttl;
		}

		clear () {
			this.cache = {};
			this.first = empty;
			this.last = empty;
			this.length = 0;

			return this;
		}

		delete (key, bypass = false) {
			if (bypass || this.has(key)) {
				const item = this.cache[key];

				delete this.cache[key];
				this.length--;

				if (item.next !== empty) {
					this.cache[item.next].prev = item.prev;
				}

				if (item.prev !== empty) {
					this.cache[item.prev].next = item.next;
				}

				if (this.first === key) {
					this.first = item.next;
				}

				if (this.last === key) {
					this.last = item.prev;
				}
			}

			return this;
		}

		evict () {
			if (this.length > 0) {
				this.delete(this.last, true);
			}

			return this;
		}

		get (key) {
			let result;

			if (this.has(key)) {
				const item = this.cache[key];

				if (item.expiry === -1 || item.expiry > Date.now()) {
					result = item.value;
					this.set(key, result, true);
				} else {
					this.delete(key, true);
				}
			}

			return result;
		}

		has (key) {
			return key in this.cache;
		}

		keys () {
			return Object.keys(this.cache);
		}

		remove (key, bypass = false) {
			return this.delete(key, bypass);
		}

		set (key, value, bypass = false) {
			if (bypass || this.has(key)) {
				const item = this.cache[key];

				item.value = value;

				if (this.first !== key) {
					const p = item.prev,
						n = item.next,
						f = this.cache[this.first];

					item.prev = empty;
					item.next = this.first;
					f.prev = key;

					if (p !== empty) {
						this.cache[p].next = n;
					}

					if (n !== empty) {
						this.cache[n].prev = p;
					}

					if (this.last === key) {
						this.last = p;
					}
				}
			} else {
				if (this.length === this.max) {
					this.evict();
				}

				this.length++;
				this.cache[key] = {
					expiry: this.ttl > 0 ? new Date().getTime() + this.ttl : -1,
					prev: empty,
					next: this.first,
					value: value
				};

				if (this.length === 1) {
					this.last = key;
				} else {
					this.cache[this.first].prev = key;
				}
			}

			this.first = key;

			return this;
		}
	}

	function factory (max = 1000, ttl = 0) {
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
