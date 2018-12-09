/**
 * Tiny LRU cache for Client or Server
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2018
 * @license BSD-3-Clause
 * @link https://github.com/avoidwork/tiny-lru
 * @version 5.0.0
 */
"use strict";

(function (global) {
	const empty = null;

	class LRU {
		constructor (max, ttl) {
			this.cache = {};
			this.first = empty;
			this.last = empty;
			this.length = 0;
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
			return this.remove(key, bypass);
		}

		evict () {
			this.remove(this.last, true);

			return this;
		}

		get (key) {
			let result;

			if (this.has(key) === true) {
				const item = this.cache[key];

				if (item.expiry === -1 || item.expiry > Date.now()) {
					result = item.value;
					this.set(key, result, true);
				} else {
					this.remove(key, true);
				}
			}

			return result;
		}

		has (key) {
			return key in this.cache;
		}

		remove (key, bypass = false) {
			let result;

			if (bypass === true || this.has(key) === true) {
				result = this.cache[key];
				delete this.cache[key];
				this.length--;

				if (result.previous !== empty) {
					this.cache[result.previous].next = result.next;
				}

				if (result.next !== empty) {
					this.cache[result.next].previous = result.previous;
				}

				if (this.first === key) {
					this.first = result.previous;
				}

				if (this.last === key) {
					this.last = result.next;
				}
			}

			return result;
		}

		set (key, value, bypass = false) {
			if (bypass === true || this.has(key) === true) {
				const item = this.cache[key];

				item.value = value;

				if (this.first !== key) {
					const n = item.next,
						p = item.previous,
						f = this.cache[this.first];

					item.next = empty;
					item.previous = this.first;
					f.next = key;

					if (f.previous === key) {
						f.previous = empty;
					}

					if (n !== empty && n !== this.first) {
						if (p !== empty) {
							this.cache[p].next = n;
						}

						this.cache[n].previous = p;
					}

					if (this.last === key) {
						this.last = n;
					}
				}
			} else {
				if (this.length === this.max) {
					this.evict();
				}

				this.length++;
				this.cache[key] = {
					expiry: this.ttl > 0 ? new Date().getTime() + this.ttl : -1,
					next: empty,
					previous: this.first,
					value: value
				};

				if (this.length === 1) {
					this.last = key;
				} else {
					this.cache[this.first].next = key;
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
