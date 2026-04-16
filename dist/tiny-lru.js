/**
 * tiny-lru
 *
 * @copyright 2026 Jason Mulligan <jason.mulligan@avoidwork.com>
 * @license BSD-3-Clause
 * @version 13.0.0
 */
/**
 * A high-performance Least Recently Used (LRU) cache implementation with optional TTL support.
 * Items are automatically evicted when the cache reaches its maximum size,
 * removing the least recently used items first. All core operations (get, set, delete) are O(1).
 *
 * @class LRU
 */
class LRU {
	#stats;
	#onEvict;

	/**
	 * Creates a new LRU cache instance.
	 * Note: Constructor does not validate parameters. Use lru() factory function for parameter validation.
	 *
	 * @constructor
	 * @param {number} [max=0] - Maximum number of items to store. 0 means unlimited.
	 * @param {number} [ttl=0] - Time to live in milliseconds. 0 means no expiration.
	 * @param {boolean} [resetTTL=false] - Whether to reset TTL when updating existing items via set().
	 */
	constructor(max = 0, ttl = 0, resetTTL = false) {
		if (isNaN(max) || max < 0) {
			throw new TypeError("Invalid max value");
		}

		if (isNaN(ttl) || ttl < 0) {
			throw new TypeError("Invalid ttl value");
		}

		if (typeof resetTTL !== "boolean") {
			throw new TypeError("Invalid resetTTL value");
		}

		this.first = null;
		this.items = Object.create(null);
		this.last = null;
		this.max = max;
		this.resetTTL = resetTTL;
		this.size = 0;
		this.ttl = ttl;
		this.#stats = { hits: 0, misses: 0, sets: 0, deletes: 0, evictions: 0 };
		this.#onEvict = null;
	}

	/**
	 * Removes all items from the cache.
	 *
	 * @returns {LRU} The LRU instance for method chaining.
	 */
	clear() {
		for (let x = this.first; x !== null; ) {
			const next = x.next;
			this.#unlink(x);
			x.prev = null;
			x.next = null;
			x = next;
		}

		this.first = null;
		this.items = Object.create(null);
		this.last = null;
		this.size = 0;
		this.#stats.hits = 0;
		this.#stats.misses = 0;
		this.#stats.sets = 0;
		this.#stats.deletes = 0;
		this.#stats.evictions = 0;

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
			this.#stats.deletes++;
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
		this.#stats.evictions++;

		if (--this.size === 0) {
			this.first = null;
			this.last = null;
		} else {
			this.#unlink(item);
		}

		item.prev = null;
		item.next = null;

		if (this.#onEvict !== null) {
			this.#onEvict({
				key: item.key,
				value: item.value,
				expiry: item.expiry,
			});
		}

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
	 * Checks if an item has expired.
	 *
	 * @param {Object} item - The cache item to check.
	 * @returns {boolean} True if the item has expired, false otherwise.
	 * @private
	 */
	#isExpired(item) {
		if (this.ttl === 0 || item.expiry === 0) {
			return false;
		}

		return item.expiry <= Date.now();
	}

	/**
	 * Retrieves a value from the cache by key without updating LRU order.
	 * Note: Does not perform TTL checks or remove expired items.
	 *
	 * @param {string} key - The key to retrieve.
	 * @returns {*} The value associated with the key, or undefined if not found.
	 */
	peek(key) {
		const item = this.items[key];
		return item !== undefined ? item.value : undefined;
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
			if (!this.#isExpired(item)) {
				this.moveToEnd(item);
				this.#stats.hits++;
				return item.value;
			}

			this.delete(key);
			this.#stats.misses++;
			return undefined;
		}

		this.#stats.misses++;
		return undefined;
	}

	/**
	 * Checks if a key exists in the cache.
	 *
	 * @param {string} key - The key to check for.
	 * @returns {boolean} True if the key exists and is not expired, false otherwise.
	 */
	has(key) {
		const item = this.items[key];
		return item !== undefined && !this.#isExpired(item);
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
			if (this.resetTTL) {
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

		this.#stats.sets++;
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

			if (this.resetTTL) {
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

		this.#stats.sets++;

		return this;
	}

	/**
	 * Returns an array of all values in the cache for the specified keys.
	 * When no keys provided, returns all values in LRU order.
	 * When keys provided, order matches the input array.
	 *
	 * @param {string[]} [keys] - Array of keys to get values for. Defaults to all keys.
	 * @returns {Array<*>} Array of values corresponding to the keys.
	 */
	values(keys) {
		if (keys === undefined) {
			const result = Array.from({ length: this.size });
			let i = 0;
			for (let x = this.first; x !== null; x = x.next) {
				result[i++] = x.value;
			}
			return result;
		}

		const result = Array.from({ length: keys.length });
		for (let i = 0; i < keys.length; i++) {
			const item = this.items[keys[i]];
			result[i] = item !== undefined ? item.value : undefined;
		}

		return result;
	}

	/**
	 * Iterate over cache items in LRU order (least to most recent).
	 * Note: This method directly accesses items from the linked list without calling
	 * get() or peek(), so it does not update LRU order or check TTL expiration during iteration.
	 *
	 * @param {function(*, any, LRU): void} callback - Function to call for each item. Signature: callback(value, key, cache)
	 * @param {Object} [thisArg] - Value to use as `this` when executing callback.
	 * @returns {LRU} The LRU instance for method chaining.
	 */
	forEach(callback, thisArg) {
		for (let x = this.first; x !== null; x = x.next) {
			callback.call(thisArg, x.value, x.key, this);
		}

		return this;
	}

	/**
	 * Batch retrieve multiple items.
	 *
	 * @param {string[]} keys - Array of keys to retrieve.
	 * @returns {Object} Object mapping keys to values (undefined for missing/expired keys).
	 */
	getMany(keys) {
		const result = Object.create(null);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			result[key] = this.get(key);
		}

		return result;
	}

	/**
	 * Batch existence check - returns true if ALL keys exist.
	 *
	 * @param {string[]} keys - Array of keys to check.
	 * @returns {boolean} True if all keys exist and are not expired.
	 */
	hasAll(keys) {
		for (let i = 0; i < keys.length; i++) {
			if (!this.has(keys[i])) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Batch existence check - returns true if ANY key exists.
	 *
	 * @param {string[]} keys - Array of keys to check.
	 * @returns {boolean} True if any key exists and is not expired.
	 */
	hasAny(keys) {
		for (let i = 0; i < keys.length; i++) {
			if (this.has(keys[i])) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Remove expired items without affecting LRU order.
	 * Unlike get(), this does not move items to the end.
	 *
	 * @returns {number} Number of expired items removed.
	 */
	cleanup() {
		if (this.ttl === 0 || this.size === 0) {
			return 0;
		}

		let removed = 0;

		for (let x = this.first; x !== null; ) {
			const next = x.next;
			if (this.#isExpired(x)) {
				const key = x.key;
				if (this.items[key] !== undefined) {
					delete this.items[key];
					this.size--;
					removed++;
					this.#unlink(x);
					x.prev = null;
					x.next = null;
				}
			}
			x = next;
		}

		return removed;
	}

	/**
	 * Serialize cache to JSON-compatible format.
	 *
	 * @returns {Array<{key: any, value: *, expiry: number}>} Array of cache items.
	 */
	toJSON() {
		const result = [];
		for (let x = this.first; x !== null; x = x.next) {
			result.push({
				key: x.key,
				value: x.value,
				expiry: x.expiry,
			});
		}

		return result;
	}

	/**
	 * Get cache statistics.
	 *
	 * @returns {Object} Statistics object with hits, misses, sets, deletes, evictions counts.
	 */
	stats() {
		return { ...this.#stats };
	}

	/**
	 * Register callback for evicted items.
	 *
	 * @param {function(Object): void} callback - Function called when item is evicted. Receives {key, value, expiry}.
	 * @returns {LRU} The LRU instance for method chaining.
	 */
	onEvict(callback) {
		if (typeof callback !== "function") {
			throw new TypeError("onEvict callback must be a function");
		}

		this.#onEvict = callback;

		return this;
	}

	/**
	 * Get items filtered by TTL status.
	 *
	 * @param {string} [filter] - Filter type: 'counts', 'keys', or 'values'. Defaults to 'keys'.
	 * @returns {Object} Object with valid, expired, and noTTL arrays or counts.
	 */
	byTTL(filter = "keys") {
		if (this.ttl === 0) {
			if (filter === "counts") {
				return { valid: this.size, expired: 0, noTTL: this.size };
			}
			const allKeys = this.keys();
			if (filter === "values") {
				return { valid: this.values(allKeys), expired: [], noTTL: this.values(allKeys) };
			}
			return { valid: allKeys, expired: [], noTTL: allKeys };
		}

		const now = Date.now();
		const valid = [];
		const expired = [];
		const noTTL = [];

		for (let x = this.first; x !== null; x = x.next) {
			if (x.expiry === 0) {
				noTTL.push(x);
				valid.push(x);
			} else if (x.expiry > now) {
				valid.push(x);
			} else {
				expired.push(x);
			}
		}

		if (filter === "counts") {
			return { valid: valid.length, expired: expired.length, noTTL: noTTL.length };
		}

		if (filter === "values") {
			return {
				valid: valid.map((x) => x.value),
				expired: expired.map((x) => x.value),
				noTTL: noTTL.map((x) => x.value),
			};
		}

		return {
			valid: valid.map((x) => x.key),
			expired: expired.map((x) => x.key),
			noTTL: noTTL.map((x) => x.key),
		};
	}

	/**
	 * Get counts of items by TTL status.
	 *
	 * @returns {Object} Object with valid, expired, and noTTL counts.
	 */
	sizeByTTL() {
		return this.byTTL("counts");
	}

	/**
	 * Get keys filtered by TTL status.
	 *
	 * @returns {Object} Object with valid, expired, and noTTL arrays of keys.
	 */
	keysByTTL() {
		return this.byTTL("keys");
	}

	/**
	 * Get values filtered by TTL status.
	 *
	 * @returns {Object} Object with valid, expired, and noTTL arrays of values.
	 */
	valuesByTTL() {
		return this.byTTL("values");
	}
}

/**
 * Factory function to create a new LRU cache instance with parameter validation.
 *
 * @function lru
 * @param {number} [max=1000] - Maximum number of items to store. Must be >= 0. Use 0 for unlimited size.
 * @param {number} [ttl=0] - Time to live in milliseconds. Must be >= 0. Use 0 for no expiration.
 * @param {boolean} [resetTTL=false] - Whether to reset TTL when updating existing items via set().
 * @returns {LRU} A new LRU cache instance.
 * @throws {TypeError} When parameters are invalid (negative numbers or wrong types).
 */
function lru(max = 1000, ttl = 0, resetTTL = false) {
	if (isNaN(max) || max < 0) {
		throw new TypeError("Invalid max value");
	}

	if (isNaN(ttl) || ttl < 0) {
		throw new TypeError("Invalid ttl value");
	}

	if (typeof resetTTL !== "boolean") {
		throw new TypeError("Invalid resetTTL value");
	}

	return new LRU(max, ttl, resetTTL);
}export{LRU,lru};