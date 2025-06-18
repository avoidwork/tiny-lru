/**
 * tiny-lru
 *
 * @copyright 2025 Jason Mulligan <jason.mulligan@avoidwork.com>
 * @license BSD-3-Clause
 * @version 11.3.3
 */
(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?f(exports):typeof define==='function'&&define.amd?define(['exports'],f):(g=typeof globalThis!=='undefined'?globalThis:g||self,f(g.lru={}));})(this,(function(exports){'use strict';/**
 * A Least Recently Used (LRU) cache implementation with optional TTL support.
 * Items are automatically evicted when the cache reaches its maximum size,
 * removing the least recently used items first.
 */
class LRU {
	/**
	 * Creates a new LRU cache instance.
	 * @param {number} [max=0] - Maximum number of items to store. 0 means unlimited.
	 * @param {number} [ttl=0] - Time to live in milliseconds. 0 means no expiration.
	 * @param {boolean} [resetTtl=false] - Whether to reset TTL when accessing existing items.
	 */
	constructor (max = 0, ttl = 0, resetTtl = false) {
		this.first = null;
		this.items = Object.create(null);
		this.last = null;
		this.max = max;
		this.resetTtl = resetTtl;
		this.size = 0;
		this.ttl = ttl;
	}

	/**
	 * Removes all items from the cache.
	 * @returns {LRU} The LRU instance for method chaining.
	 */
	clear () {
		this.first = null;
		this.items = Object.create(null);
		this.last = null;
		this.size = 0;

		return this;
	}

	/**
	 * Removes an item from the cache by key.
	 * @param {string} key - The key of the item to delete.
	 * @returns {LRU} The LRU instance for method chaining.
	 */
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

	/**
	 * Returns an array of [key, value] pairs for the specified keys.
	 * @param {string[]} [keys=this.keys()] - Array of keys to get entries for. Defaults to all keys.
	 * @returns {Array<[string, *]>} Array of [key, value] pairs.
	 */
	entries (keys = this.keys()) {
		return keys.map(key => [key, this.get(key)]);
	}

	/**
	 * Removes the least recently used item from the cache.
	 * @param {boolean} [bypass=false] - Whether to bypass the size check and force eviction.
	 * @returns {LRU} The LRU instance for method chaining.
	 */
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

	/**
	 * Returns the expiration timestamp for a given key.
	 * @param {string} key - The key to check expiration for.
	 * @returns {number|undefined} The expiration timestamp in milliseconds, or undefined if key doesn't exist.
	 */
	expiresAt (key) {
		let result;

		if (this.has(key)) {
			result = this.items[key].expiry;
		}

		return result;
	}

	/**
	 * Retrieves a value from the cache by key. Updates the item's position to most recently used.
	 * @param {string} key - The key to retrieve.
	 * @returns {*} The value associated with the key, or undefined if not found or expired.
	 */
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

	/**
	 * Checks if a key exists in the cache.
	 * @param {string} key - The key to check for.
	 * @returns {boolean} True if the key exists, false otherwise.
	 */
	has (key) {
		return key in this.items;
	}

	/**
	 * Returns an array of all keys in the cache, ordered from least to most recently used.
	 * @returns {string[]} Array of keys in LRU order.
	 */
	keys () {
		const result = [];
		let x = this.first;

		while (x !== null) {
			result.push(x.key);
			x = x.next;
		}

		return result;
	}

	/**
	 * Sets a value in the cache and returns any evicted item.
	 * @param {string} key - The key to set.
	 * @param {*} value - The value to store.
	 * @param {boolean} [resetTtl=this.resetTtl] - Whether to reset the TTL for this operation.
	 * @returns {Object|null} The evicted item (if any) with shape {key, value, expiry, prev, next}, or null.
	 */
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

	/**
	 * Sets a value in the cache. Updates the item's position to most recently used.
	 * @param {string} key - The key to set.
	 * @param {*} value - The value to store.
	 * @param {boolean} [bypass=false] - Whether to bypass normal LRU positioning (internal use).
	 * @param {boolean} [resetTtl=this.resetTtl] - Whether to reset the TTL for this operation.
	 * @returns {LRU} The LRU instance for method chaining.
	 */
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

	/**
	 * Returns an array of all values in the cache for the specified keys.
	 * @param {string[]} [keys=this.keys()] - Array of keys to get values for. Defaults to all keys.
	 * @returns {Array<*>} Array of values corresponding to the keys.
	 */
	values (keys = this.keys()) {
		return keys.map(key => this.get(key));
	}
}

/**
 * Factory function to create a new LRU cache instance with validation.
 * @param {number} [max=1000] - Maximum number of items to store. Must be >= 0.
 * @param {number} [ttl=0] - Time to live in milliseconds. Must be >= 0.
 * @param {boolean} [resetTtl=false] - Whether to reset TTL when accessing existing items.
 * @returns {LRU} A new LRU cache instance.
 * @throws {TypeError} When parameters are invalid.
 */
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