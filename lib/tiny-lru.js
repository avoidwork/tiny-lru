/**
 * Tiny LRU cache for Client or Server
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2018
 * @license BSD-3-Clause
 * @link https://github.com/avoidwork/tiny-lru
 * @version 3.0.0
 */
"use strict";

(function (global) {
	const next = typeof process !== "undefined" ? process.nextTick : arg => setTimeout(arg, 1),
		empty = null;

	class LRU {
		constructor (max, notify, ttl) {
			this.max = max;
			this.notify = notify;
			this.ttl = ttl;

			return this.reset();
		}

		clear (silent = false) {
			this.reset();

			if (silent === false && this.notify === true) {
				next(this.onchange("clear", this.dump()));
			}

			return this;
		}

		delete (key, silent = false) {
			return this.remove(key, silent);
		}

		dump () {
			return JSON.stringify({
				cache: this.cache,
				first: this.first,
				last: this.last,
				length: this.length,
				max: this.max,
				notify: this.notify,
				ttl: this.ttl
			});
		}

		evict () {
			this.remove(this.last, true);

			if (this.notify === true) {
				next(this.onchange("evict", this.dump()));
			}

			return this;
		}

		get (key) {
			let output;

			if (this.has(key) === true) {
				const item = this.cache[key];

				if (item.expiry === -1 || item.expiry <= Date.now()) {
					output = item.value;

					if (this.first !== empty) {
						this.cache[this.first].next = key;
					}

					this.first = key;

					if (this.notify === true) {
						next(this.onchange("get", this.dump()));
					}
				} else {
					this.remove(key);
				}
			}

			return output;
		}

		has (key) {
			return key in this.cache;
		}

		onchange () {}

		remove (key, silent = false) {
			let result;

			if (this.has(key) === true) {
				result = this.cache[key];

				delete this.cache[key];
				this.length--;

				if (result.previous !== empty) {
					this.cache[result.previous].next = result.next;

					if (this.first === key) {
						this.first = result.previous;
					}
				} else if (this.first === key) {
					this.first = empty;
				}

				if (result.next !== empty) {
					this.cache[result.next].previous = result.previous;

					if (this.last === key) {
						this.last = result.next;
					}
				} else if (this.last === key) {
					this.last = empty;
				}

				if (silent === false && this.notify === true) {
					next(this.onchange("remove", this.dump()));
				}
			}

			return result;
		}

		reset () {
			this.cache = {};
			this.first = empty;
			this.last = empty;
			this.length = 0;

			return this;
		}

		set (key, value) {
			if (this.has(key) === true) {
				const item = this.cache[key];

				item.value = value;
				item.next = empty;

				if (this.first !== key) {
					item.previous = this.first;
				}

				if (this.last === key && item.previous !== empty) {
					this.last = item.previous;
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
				}
			}

			if (this.first !== empty && this.first !== key) {
				const first = this.cache[this.first];

				first.next = key;

				if (first.previous === key) {
					first.previous = empty;
				}
			}

			this.first = key;

			if (this.notify === true) {
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

	function factory (max = 1000, notify = false, ttl = 0, expire = 0) {
		return new LRU(max, notify, ttl, expire);
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
