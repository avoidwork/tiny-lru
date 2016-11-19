/**
 * Tiny LRU cache for Client or Server
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2016
 * @license BSD-3-Clause
 * @link https://github.com/avoidwork/tiny-lru
 * @version 1.3.1
 */
"use strict";

(function (global) {
	let next = typeof process !== "undefined" ? process.nextTick : arg => setTimeout(arg, 1);


	class LRU {
		constructor (max) {
			this.cache = {};
			this.first = null;
			this.last = null;
			this.length = 0;
			this.max = max;
			this.notify = false;
			this.onchange = () => {};
			this.update = arg => {
				let obj = JSON.parse(arg);

				Object.keys(obj).forEach(i => {
					this.cache[i] = obj[i];
				});
			};
		}

		delete (key) {
			return this.remove(key);
		}

		dump () {
			return JSON.stringify(this, null, 0);
		}

		evict () {
			if (this.last !== null) {
				this.remove(this.last, true);
			}

			if (this.notify) {
				next(this.onchange("evict", this.dump()));
			}

			return this;
		}

		get (key) {
			let cached = this.cache[key],
				output;

			if (cached) {
				output = cached.value;
				this.set(key, cached.value);
			}

			if (this.notify) {
				next(this.onchange("get", this.dump()));
			}

			return output;
		}

		has (key) {
			return this.cache[key] !== undefined;
		}

		remove (key, silent = false) {
			let cached = this.cache[key];

			if (cached) {
				delete this.cache[key];
				this.length--;

				if (cached.previous !== null) {
					this.cache[cached.previous].next = cached.next;
				}

				if (cached.next !== null) {
					this.cache[cached.next].previous = cached.previous;
				}

				if (this.first === key) {
					this.first = cached.previous;
				}

				if (this.last === key) {
					this.last = cached.next;
				}
			}

			if (!silent && this.notify) {
				next(this.onchange("remove", this.dump()));
			}

			return cached;
		}

		set (key, value) {
			let obj = this.remove(key, true);

			if (!obj) {
				obj = {
					next: null,
					previous: null,
					value: value
				};
			} else {
				obj.value = value;
			}

			obj.next = null;
			obj.previous = this.first;
			this.cache[key] = obj;

			if (this.first) {
				this.cache[this.first].next = key;
			}

			this.first = key;

			if (!this.last) {
				this.last = key;
			}

			if (++this.length > this.max) {
				this.evict();
			}

			if (this.notify) {
				next(this.onchange("set", this.dump()));
			}

			return this;
		}
	}

	function factory (max = 1000) {
		return new LRU(max);
	}

	// Node, AMD & window supported
	if (typeof exports !== "undefined") {
		module.exports = factory;
	} else if (typeof define === "function" && define.amd) {
		define(function () {
			return factory;
		});
	} else {
		global.lru = factory;
	}
}(typeof window !== "undefined" ? window : global));
