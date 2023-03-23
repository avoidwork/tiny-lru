/**
 * tiny-lru
 *
 * @copyright 2023 Jason Mulligan <jason.mulligan@avoidwork.com>
 * @license BSD-3-Clause
 * @version 10.3.0
 */
'use strict';

class LRU {
	constructor (max = 0, ttl = 0, resetTtl = false) {
		this.first = null;
		this.items = new Map();
		this.last = null;
		this.max = max;
		this.resetTtl = resetTtl;
		this.ttl = ttl;
	}

	clear () {
		this.first = null;
		this.items = new Map();
		this.last = null;

		return this;
	}

	delete (key) {
		if (this.items.has(key)) {
			const item = this.items.get(key);

			this.items.delete(key);

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

	evict (bypass = false) {
		if (bypass || this.size > 0) {
			const item = this.first;

			this.items.delete(item.key);

			if (this.size === 0) {
				this.first = null;
				this.last = null;
			} else {
				this.first = item.next;
				this.first.prev = null;
			}
		}

		return this;
	}

	get (key) {
		let result;

		if (this.items.has(key)) {
			const item = this.items.get(key);

			if (this.ttl > 0 && item.expiry <= Date.now()) {
				this.delete(key);
			} else {
				result = item.value;
				this.set(key, result, true);
			}
		}

		return result;
	}

	expiresAt (key) {
		let result;

		if (this.items.has(key)) {
			result = this.items.get(key).expiry;
		}

		return result;
	}

	keys () {
		return this.items.keys();
	}

	set (key, value, bypass = false, resetTtl = this.resetTtl) {
		let item;

		if (bypass || this.items.has(key)) {
			item = this.items.get(key);
			item.value = value;

			if (resetTtl) {
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

			item = {
				expiry: this.ttl > 0 ? Date.now() + this.ttl : this.ttl,
				key: key,
				prev: this.last,
				next: null,
				value
			};
			this.items.set(key, item);

			if (this.size === 1) {
				this.first = item;
			} else {
				this.last.next = item;
			}
		}

		this.last = item;

		return this;
	}

	get size () {
		return this.items.size;
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
}

exports.lru = lru;
