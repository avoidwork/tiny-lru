/**
 * Tiny LRU cache for Client or Server
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2017
 * @license BSD-3-Clause
 * @link https://github.com/avoidwork/tiny-lru
 * @version 1.4.13
 */
"use strict";

(function (global) {
	const next = typeof process !== "undefined" ? process.nextTick : arg => setTimeout(arg, 1);

	class LRU {
		constructor (max) {
			this.max = max;
			this.notify = false;

			return this.reset();
		}

		clear (silent = false) {
			this.reset();

			if (!silent && this.notify) {
				next(this.onchange("clear", this.dump()));
			}

			return this;
		}

		delete (key, silent = false) {
			return this.remove(key, silent);
		}

		dump () {
			return JSON.stringify(this, null, 0);
		}

		evict () {
			if (this.has(this.last)) {
				this.remove(this.last, true);
			}

			if (this.notify) {
				next(this.onchange("evict", this.dump()));
			}

			return this;
		}

		get (key) {
			let output;

			if (this.has(key)) {
				output = this.cache[key].value;
				this.set(key, output);

				if (this.notify) {
					next(this.onchange("get", this.dump()));
				}
			}

			return output;
		}

		has (key) {
			return key in this.cache;
		}

		onchange () {}

		remove (k, silent = false) {
			let key = typeof k !== "string" ? k.toString() : k,
				cached = this.cache[key];

			if (cached) {
				delete this.cache[key];
				this.length--;

				if (this.has(cached.previous)) {
					this.cache[cached.previous].next = cached.next;

					if (this.first === key) {
						this.first = cached.previous;
					}
				} else if (this.first === key) {
					this.first = null;
				}

				if (this.has(cached.next)) {
					this.cache[cached.next].previous = cached.previous;

					if (this.last === key) {
						this.last = cached.next;
					}
				} else if (this.last === key) {
					this.last = null;
				}
			} else {
				if (this.first === key) {
					this.first = null;
				}

				if (this.last === key) {
					this.last = null;
				}
			}

			if (!silent && this.notify) {
				next(this.onchange("remove", this.dump()));
			}

			return cached;
		}

		reset () {
			this.cache = Object.create(null);
			this.first = null;
			this.last = null;
			this.length = 0;

			return this;
		}

		set (key, value) {
			let first, item;

			if (this.has(key)) {
				item = this.cache[key];
				item.value = value;
				item.next = null;

				if (this.first !== key) {
					item.previous = this.first;
				}

				if (this.last === key && item.previous !== null) {
					this.last = item.previous;
				}
			} else {
				if (++this.length > this.max) {
					this.remove(this.last, true);
				}

				if (this.length === 1) {
					this.last = key;
				}

				this.cache[key] = {
					next: null,
					previous: this.first,
					value: value
				};
			}

			if (this.first !== key && this.has(this.first)) {
				first = this.cache[this.first];
				first.next = key;

				if (first.previous === key) {
					first.previous = null;
				}
			}

			this.first = key;

			if (this.notify) {
				next(this.onchange("set", this.dump()));
			}

			return this;
		}

		update (arg) {
			const obj = JSON.parse(arg);

			Object.keys(obj).forEach(i => {
				this[i] = obj[i];
			});
		}
	}

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
