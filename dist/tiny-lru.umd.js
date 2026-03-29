/**
 * tiny-lru
 *
 * @copyright 2026 Jason Mulligan <jason.mulligan@avoidwork.com>
 * @license BSD-3-Clause
 * @version 12.0.0
 */
(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?f(exports):typeof define==='function'&&define.amd?define(['exports'],f):(g=typeof globalThis!=='undefined'?globalThis:g||self,f(g.lru={}));})(this,(function(exports){'use strict';/**
 * A high-performance Least Recently Used (LRU) cache implementation with optional TTL support.
 * Items are automatically evicted when the cache reaches its maximum size,
 * removing the least recently used items first. All core operations (get, set, delete) are O(1).
 *
 * @class LRU
 */
class LRU {
	/**
	 * Creates a new LRU cache instance.
	 * Note: Constructor does not validate parameters. Use lru() factory function for parameter validation.
	 *
	 * @constructor
	 * @param {number} [max=0] - Maximum number of items to store. 0 means unlimited.
	 * @param {number} [ttl=0] - Time to live in milliseconds. 0 means no expiration.
	 * @param {boolean} [resetTtl=false] - Whether to reset TTL when updating existing items via set().
	 */
	constructor(max = 0, ttl = 0, resetTtl = false) {
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
	 *
	 * @returns {LRU} The LRU instance for method chaining.
	 */
	clear() {
		this.first = null;
		this.items = Object.create(null);
		this.last = null;
		this.size = 0;

		return this;
	}

	/**
	 * Removes an item from the cache by key.
	 *
	 * @param {string} key - The key of the item to delete.
	 * @returns {LRU} The LRU instance for method chaining.
	 */
	delete(key) {
		const item = this.items[key];

		if (item !== undefined) {
			delete this.items[key];
			this.size--;

			this.#unlink(item);

			item.prev = null;
			item.next = null;
		}

		return this;
	}

	/**
	 * Returns an array of [key, value] pairs for the specified keys.
	 * When no keys provided, returns all entries in LRU order.
	 * When keys provided, order matches the input array.
	 *
	 * @param {string[]} [keys=this.keys()] - Array of keys to get entries for. Defaults to all keys.
	 * @returns {Array<Array<*>>} Array of [key, value] pairs.
	 */
	entries(keys) {
		if (keys === undefined) {
			keys = this.keys();
		}

		const result = Array.from({ length: keys.length });
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const item = this.items[key];
			result[i] = [key, item !== undefined ? item.value : undefined];
		}

		return result;
	}

	/**
	 * Removes the least recently used item from the cache.
	 *
	 * @returns {LRU} The LRU instance for method chaining.
	 */
	evict() {
		if (this.size === 0) {
			return this;
		}

		const item = this.first;

		delete this.items[item.key];

		if (--this.size === 0) {
			this.first = null;
			this.last = null;
		} else {
			this.#unlink(item);
		}

		item.next = null;

		return this;
	}

	/**
	 * Returns the expiration timestamp for a given key.
	 *
	 * @param {string} key - The key to check expiration for.
	 * @returns {number|undefined} The expiration timestamp in milliseconds, or undefined if key doesn't exist.
	 */
	expiresAt(key) {
		const item = this.items[key];
		return item !== undefined ? item.expiry : undefined;
	}

	/**
	 * Retrieves a value from the cache by key. Updates the item's position to most recently used.
	 *
	 * @param {string} key - The key to retrieve.
	 * @returns {*} The value associated with the key, or undefined if not found or expired.
	 */
	get(key) {
		const item = this.items[key];

		if (item !== undefined) {
			// Check TTL only if enabled to avoid unnecessary Date.now() calls
			if (this.ttl > 0) {
				if (item.expiry <= Date.now()) {
					this.delete(key);

					return undefined;
				}
			}

			// Fast LRU update without full set() overhead
			this.moveToEnd(item);

			return item.value;
		}

		return undefined;
	}

	/**
	 * Checks if a key exists in the cache.
	 *
	 * @param {string} key - The key to check for.
	 * @returns {boolean} True if the key exists, false otherwise.
	 */
	has(key) {
		const item = this.items[key];
		return item !== undefined && (this.ttl === 0 || item.expiry > Date.now());
	}

	/**
	 * Unlinks an item from the doubly-linked list.
	 * Updates first/last pointers if needed.
	 * Does NOT clear the item's prev/next pointers or delete from items map.
	 *
	 * @private
	 */
	#unlink(item) {
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

	/**
	 * Efficiently moves an item to the end of the LRU list (most recently used position).
	 * This is an internal optimization method that avoids the overhead of the full set() operation
	 * when only LRU position needs to be updated.
	 *
	 * @param {Object} item - The cache item with prev/next pointers to reposition.
	 * @private
	 */
	moveToEnd(item) {
		if (this.last === item) {
			return;
		}

		this.#unlink(item);

		item.prev = this.last;
		item.next = null;
		this.last.next = item;
		this.last = item;
	}

	/**
	 * Returns an array of all keys in the cache, ordered from least to most recently used.
	 *
	 * @returns {string[]} Array of keys in LRU order.
	 */
	keys() {
		const result = Array.from({ length: this.size });
		let x = this.first;
		let i = 0;

		while (x !== null) {
			result[i++] = x.key;
			x = x.next;
		}

		return result;
	}

	/**
	 * Sets a value in the cache and returns any evicted item.
	 *
	 * @param {string} key - The key to set.
	 * @param {*} value - The value to store.
	 * @returns {Object|null} The evicted item (if any) with shape {key, value, expiry}, or null.
	 */
	setWithEvicted(key, value) {
		let evicted = null;
		let item = this.items[key];

		if (item !== undefined) {
			item.value = value;
			if (this.resetTtl) {
				item.expiry = this.ttl > 0 ? Date.now() + this.ttl : this.ttl;
			}
			this.moveToEnd(item);
		} else {
			if (this.max > 0 && this.size === this.max) {
				evicted = {
					key: this.first.key,
					value: this.first.value,
					expiry: this.first.expiry,
				};
				this.evict();
			}

			item = this.items[key] = {
				expiry: this.ttl > 0 ? Date.now() + this.ttl : this.ttl,
				key: key,
				prev: this.last,
				next: null,
				value,
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
	 *
	 * @param {string} key - The key to set.
	 * @param {*} value - The value to store.
	 * @returns {LRU} The LRU instance for method chaining.
	 */
	set(key, value) {
		let item = this.items[key];

		if (item !== undefined) {
			item.value = value;

			if (this.resetTtl) {
				item.expiry = this.ttl > 0 ? Date.now() + this.ttl : this.ttl;
			}

			this.moveToEnd(item);
		} else {
			if (this.max > 0 && this.size === this.max) {
				this.evict();
			}

			item = this.items[key] = {
				expiry: this.ttl > 0 ? Date.now() + this.ttl : this.ttl,
				key: key,
				prev: this.last,
				next: null,
				value,
			};

			if (++this.size === 1) {
				this.first = item;
			} else {
				this.last.next = item;
			}

			this.last = item;
		}

		return this;
	}

	/**
	 * Returns an array of all values in the cache for the specified keys.
	 * When no keys provided, returns all values in LRU order.
	 * When keys provided, order matches the input array.
	 *
	 * @param {string[]} [keys=this.keys()] - Array of keys to get values for. Defaults to all keys.
	 * @returns {Array<*>} Array of values corresponding to the keys.
	 */
	values(keys) {
		if (keys === undefined) {
			keys = this.keys();
		}

		const result = Array.from({ length: keys.length });
		for (let i = 0; i < keys.length; i++) {
			const item = this.items[keys[i]];
			result[i] = item !== undefined ? item.value : undefined;
		}

		return result;
	}
}

/**
 * Factory function to create a new LRU cache instance with parameter validation.
 *
 * @function lru
 * @param {number} [max=1000] - Maximum number of items to store. Must be >= 0. Use 0 for unlimited size.
 * @param {number} [ttl=0] - Time to live in milliseconds. Must be >= 0. Use 0 for no expiration.
 * @param {boolean} [resetTtl=false] - Whether to reset TTL when accessing existing items via get().
 * @returns {LRU} A new LRU cache instance.
 * @throws {TypeError} When parameters are invalid (negative numbers or wrong types).
 */
function lru(max = 1000, ttl = 0, resetTtl = false) {
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