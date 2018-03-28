/**
 * Tiny LRU cache for Client or Server
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2018
 * @license BSD-3-Clause
 * @link https://github.com/avoidwork/tiny-lru
 * @version 1.5.2
 */
"use strict";

(function (global) {
	const next = typeof process !== "undefined" ? process.nextTick : arg => setTimeout(arg, 1),
		empty = "";

	class LRU {
		constructor (max, notify, ttl) {
			this.max = max;
			this.notify = notify;
			this.ttl = ttl;

			return this.reset();
		}

		clear (silent = false) {
			this.reset();

			if (!silent && this.notify) {
				next(this.onchange("clear", this.dump()));
			}

			return this;
		}

		clearTimer (key) {
			if (this.has(key, "timers")) {
				clearTimeout(this.timers[key]);
				delete this.timers[key];
			}

			return this;
		}

		delete (key, silent = false) {
			return this.remove(key, silent);
		}

		dump () {
			const obj = JSON.parse(JSON.stringify(this));

			delete obj.timers;

			return JSON.stringify(obj);
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

				if (this.ttl > 0) {
					this.clearTimer(key).setTimer(key);
				}
			}

			return output;
		}

		has (key, type = "cache") {
			return key in this[type];
		}

		onchange () {}

		remove (k, silent = false) {
			let key = typeof k !== "string" ? k.toString() : k,
				result;

			if (this.has(key)) {
				const cached = this.cache[key];

				delete this.cache[key];
				this.length--;

				if (this.ttl > 0) {
					this.clearTimer(key);
				}

				if (this.has(cached.previous)) {
					this.cache[cached.previous].next = cached.next;

					if (this.first === key) {
						this.first = cached.previous;
					}
				} else if (this.first === key) {
					this.first = empty;
				}

				if (this.has(cached.next)) {
					this.cache[cached.next].previous = cached.previous;

					if (this.last === key) {
						this.last = cached.next;
					}
				} else if (this.last === key) {
					this.last = empty;
				}

				result = cached;
			} else {
				if (this.first === key) {
					this.first = empty;
				}

				if (this.last === key) {
					this.last = empty;
				}
			}

			if (!silent && this.notify) {
				next(this.onchange("remove", this.dump()));
			}

			return result;
		}

		reset () {
			if (this.timers !== void 0) {
				Object.keys(this.timers).forEach(i => this.clearTimer(i));
			}

			this.cache = {};
			this.first = empty;
			this.last = empty;
			this.length = 0;
			this.timers = {};

			return this;
		}

		set (key, value) {
			let first, item;

			if (this.has(key)) {
				item = this.cache[key];
				item.value = value;
				item.next = empty;

				if (this.first !== key) {
					item.previous = this.first;
				}

				if (this.last === key && item.previous !== empty) {
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
					next: empty,
					previous: this.first,
					value: value
				};
			}

			if (this.first !== key && this.has(this.first)) {
				first = this.cache[this.first];
				first.next = key;

				if (first.previous === key) {
					first.previous = empty;
				}
			}

			this.first = key;

			if (this.notify) {
				next(this.onchange("set", this.dump()));
			}

			if (this.ttl > 0) {
				this.clearTimer(key).setTimer(key);
			}

			return this;
		}

		setTimer (key) {
			this.timers[key] = setTimeout(() => this.remove(key), this.ttl);
		}

		update (arg) {
			const obj = JSON.parse(arg);

			Object.keys(obj).forEach(i => {
				this[i] = obj[i];
			});
		}
	}

	function factory (max = 1000, notify = false, ttl = 0) {
		return new LRU(max, notify, ttl);
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
