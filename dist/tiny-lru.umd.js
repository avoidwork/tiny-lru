/**
 * tiny-lru
 *
 * @copyright 2025 Jason Mulligan <jason.mulligan@avoidwork.com>
 * @license BSD-3-Clause
 * @version 11.3.2
 */
(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?f(exports):typeof define==='function'&&define.amd?define(['exports'],f):(g=typeof globalThis!=='undefined'?globalThis:g||self,f(g.lru={}));})(this,(function(exports){'use strict';class LRU {
	constructor (max = 0, ttl = 0, resetTtl = false) {
		this.first = null;
		this.items = Object.create(null);
		this.last = null;
		this.max = max;
		this.resetTtl = resetTtl;
		this.size = 0;
		this.ttl = ttl;
	}

	clear () {
		this.first = null;
		this.items = Object.create(null);
		this.last = null;
		this.size = 0;

		return this;
	}

	delete (key) {
		if (this.has(key)) {
			const item = this.items[key];

			delete this.items[key];
			this.size--;

			if (item.prev !== null) {
				item.prev.next = item.next;
			}

			if (item.next !== null) {
				item.next.prev = item.prev;
			}

			if (this.first === item) {
				this.first = item.next;
			}

			if (this.last === item) {
				this.last = item.prev;
			}
		}

		return this;
	}

	entries (keys = this.keys()) {
		return keys.map(key => [key, this.get(key)]);
	}

	evict (bypass = false) {
		if (bypass || this.size > 0) {
			const item = this.first;

			delete this.items[item.key];

			if (--this.size === 0) {
				this.first = null;
				this.last = null;
			} else {
				this.first = item.next;
				this.first.prev = null;
			}
		}

		return this;
	}

	expiresAt (key) {
		let result;

		if (this.has(key)) {
			result = this.items[key].expiry;
		}

		return result;
	}

	get (key) {
		let result;

		if (this.has(key)) {
			const item = this.items[key];

			if (this.ttl > 0 && item.expiry <= Date.now()) {
				this.delete(key);
			} else {
				result = item.value;
				this.set(key, result, true);
			}
		}

		return result;
	}

	has (key) {
		return key in this.items;
	}

	keys () {
		const result = [];
		let x = this.first;

		while (x !== null) {
			result.push(x.key);
			x = x.next;
		}

		return result;
	}

	setWithEvicted (key, value, resetTtl = this.resetTtl) {
		let evicted = null;

		if (this.has(key)) {
			this.set(key, value, true, resetTtl);
		} else {
			if (this.max > 0 && this.size === this.max) {
				evicted = {...this.first};
				this.evict(true);
			}

			let item = this.items[key] = {
				expiry: this.ttl > 0 ? Date.now() + this.ttl : this.ttl,
				key: key,
				prev: this.last,
				next: null,
				value
			};

			if (++this.size === 1) {
				this.first = item;
			} else {
				this.last.next = item;
			}

			this.last = item;
		}

		return evicted;
	}

	set (key, value, bypass = false, resetTtl = this.resetTtl) {
		let item;

		if (bypass || this.has(key)) {
			item = this.items[key];
			item.value = value;

			if (bypass === false && resetTtl) {
				item.expiry = this.ttl > 0 ? Date.now() + this.ttl : this.ttl;
			}

			if (this.last !== item) {
				const last = this.last,
					next = item.next,
					prev = item.prev;

				if (this.first === item) {
					this.first = item.next;
				}

				item.next = null;
				item.prev = this.last;
				last.next = item;

				if (prev !== null) {
					prev.next = next;
				}

				if (next !== null) {
					next.prev = prev;
				}
			}
		} else {
			if (this.max > 0 && this.size === this.max) {
				this.evict(true);
			}

			item = this.items[key] = {
				expiry: this.ttl > 0 ? Date.now() + this.ttl : this.ttl,
				key: key,
				prev: this.last,
				next: null,
				value
			};

			if (++this.size === 1) {
				this.first = item;
			} else {
				this.last.next = item;
			}
		}

		this.last = item;

		return this;
	}

	values (keys = this.keys()) {
		return keys.map(key => this.get(key));
	}
}

function lru (max = 1000, ttl = 0, resetTtl = false) {
	if (isNaN(max) || max < 0) {
		throw new TypeError("Invalid max value");
	}

	if (isNaN(ttl) || ttl < 0) {
		throw new TypeError("Invalid ttl value");
	}

	if (typeof resetTtl !== "boolean") {
		throw new TypeError("Invalid resetTtl value");
	}

	return new LRU(max, ttl, resetTtl);
}exports.LRU=LRU;exports.lru=lru;}));