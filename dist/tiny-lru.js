/**
 * tiny-lru
 *
 * @copyright 2025 Jason Mulligan <jason.mulligan@avoidwork.com>
 * @license BSD-3-Clause
 * @version 11.3.3
 */
/**
 * A Least Recently Used (LRU) cache implementation with optional TTL support.
 * Items are automatically evicted when the cache reaches its maximum size,
 * removing the least recently used items first.
 *
 * @class LRU
 * @example
 * // Create a cache with max 100 items
 * const cache = new LRU(100);
 * cache.set('key1', 'value1');
 * console.log(cache.get('key1')); // 'value1'
 *
 * @example
 * // Create a cache with TTL
 * const cache = new LRU(100, 5000); // 5 second TTL
 * cache.set('key1', 'value1');
 * // After 5 seconds, key1 will be expired
 */
class LRU {
	/**
	 * Creates a new LRU cache instance.
	 *
	 * @constructor
	 * @param {number} [max=0] - Maximum number of items to store. 0 means unlimited.
	 * @param {number} [ttl=0] - Time to live in milliseconds. 0 means no expiration.
	 * @param {boolean} [resetTtl=false] - Whether to reset TTL when accessing existing items.
	 * @throws {TypeError} When parameters are of invalid type.
	 * @example
	 * const cache = new LRU(1000, 60000, true); // 1000 items, 1 minute TTL, reset on access
	 * @since 1.0.0
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
	 *
	 * @method clear
	 * @memberof LRU
	 * @returns {LRU} The LRU instance for method chaining.
	 * @example
	 * cache.clear();
	 * console.log(cache.size); // 0
	 * @since 1.0.0
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
	 *
	 * @method delete
	 * @memberof LRU
	 * @param {string} key - The key of the item to delete.
	 * @returns {LRU} The LRU instance for method chaining.
	 * @example
	 * cache.set('key1', 'value1');
	 * cache.delete('key1');
	 * console.log(cache.has('key1')); // false
	 * @see {@link LRU#has}
	 * @see {@link LRU#clear}
	 * @since 1.0.0
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
	 *
	 * @method entries
	 * @memberof LRU
	 * @param {string[]} [keys=this.keys()] - Array of keys to get entries for. Defaults to all keys.
	 * @returns {Array<Array<*>>} Array of [key, value] pairs.
	 * @example
	 * cache.set('a', 1).set('b', 2);
	 * console.log(cache.entries()); // [['a', 1], ['b', 2]]
	 * console.log(cache.entries(['a'])); // [['a', 1]]
	 * @see {@link LRU#keys}
	 * @see {@link LRU#values}
	 * @since 11.1.0
	 */
	entries (keys = this.keys()) {
		return keys.map(key => [key, this.get(key)]);
	}

	/**
	 * Removes the least recently used item from the cache.
	 *
	 * @method evict
	 * @memberof LRU
	 * @param {boolean} [bypass=false] - Whether to bypass the size check and force eviction.
	 * @returns {LRU} The LRU instance for method chaining.
	 * @example
	 * cache.set('old', 'value').set('new', 'value');
	 * cache.evict(); // Removes 'old' item
	 * @see {@link LRU#setWithEvicted}
	 * @since 1.0.0
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
	 *
	 * @method expiresAt
	 * @memberof LRU
	 * @param {string} key - The key to check expiration for.
	 * @returns {number|undefined} The expiration timestamp in milliseconds, or undefined if key doesn't exist.
	 * @example
	 * const cache = new LRU(100, 5000); // 5 second TTL
	 * cache.set('key1', 'value1');
	 * console.log(cache.expiresAt('key1')); // timestamp 5 seconds from now
	 * @see {@link LRU#get}
	 * @see {@link LRU#has}
	 * @since 1.0.0
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
	 *
	 * @method get
	 * @memberof LRU
	 * @param {string} key - The key to retrieve.
	 * @returns {*} The value associated with the key, or undefined if not found or expired.
	 * @example
	 * cache.set('key1', 'value1');
	 * console.log(cache.get('key1')); // 'value1'
	 * console.log(cache.get('nonexistent')); // undefined
	 * @see {@link LRU#set}
	 * @see {@link LRU#has}
	 * @since 1.0.0
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
	 *
	 * @method has
	 * @memberof LRU
	 * @param {string} key - The key to check for.
	 * @returns {boolean} True if the key exists, false otherwise.
	 * @example
	 * cache.set('key1', 'value1');
	 * console.log(cache.has('key1')); // true
	 * console.log(cache.has('nonexistent')); // false
	 * @see {@link LRU#get}
	 * @see {@link LRU#delete}
	 * @since 9.0.0
	 */
	has (key) {
		return key in this.items;
	}

	/**
	 * Returns an array of all keys in the cache, ordered from least to most recently used.
	 *
	 * @method keys
	 * @memberof LRU
	 * @returns {string[]} Array of keys in LRU order.
	 * @example
	 * cache.set('a', 1).set('b', 2);
	 * cache.get('a'); // Move 'a' to most recent
	 * console.log(cache.keys()); // ['b', 'a']
	 * @see {@link LRU#values}
	 * @see {@link LRU#entries}
	 * @since 9.0.0
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
	 *
	 * @method setWithEvicted
	 * @memberof LRU
	 * @param {string} key - The key to set.
	 * @param {*} value - The value to store.
	 * @param {boolean} [resetTtl=this.resetTtl] - Whether to reset the TTL for this operation.
	 * @returns {Object|null} The evicted item (if any) with shape {key, value, expiry, prev, next}, or null.
	 * @example
	 * const cache = new LRU(2);
	 * cache.set('a', 1).set('b', 2);
	 * const evicted = cache.setWithEvicted('c', 3); // evicted = {key: 'a', value: 1, ...}
	 * @see {@link LRU#set}
	 * @see {@link LRU#evict}
	 * @since 11.3.0
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
	 *
	 * @method set
	 * @memberof LRU
	 * @param {string} key - The key to set.
	 * @param {*} value - The value to store.
	 * @param {boolean} [bypass=false] - Whether to bypass normal LRU positioning (internal use).
	 * @param {boolean} [resetTtl=this.resetTtl] - Whether to reset the TTL for this operation.
	 * @returns {LRU} The LRU instance for method chaining.
	 * @example
	 * cache.set('key1', 'value1')
	 *      .set('key2', 'value2')
	 *      .set('key3', 'value3');
	 * @see {@link LRU#get}
	 * @see {@link LRU#setWithEvicted}
	 * @since 1.0.0
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
	 *
	 * @method values
	 * @memberof LRU
	 * @param {string[]} [keys=this.keys()] - Array of keys to get values for. Defaults to all keys.
	 * @returns {Array<*>} Array of values corresponding to the keys.
	 * @example
	 * cache.set('a', 1).set('b', 2);
	 * console.log(cache.values()); // [1, 2]
	 * console.log(cache.values(['a'])); // [1]
	 * @see {@link LRU#keys}
	 * @see {@link LRU#entries}
	 * @since 11.1.0
	 */
	values (keys = this.keys()) {
		return keys.map(key => this.get(key));
	}
}

/**
 * Factory function to create a new LRU cache instance with validation.
 *
 * @function lru
 * @param {number} [max=1000] - Maximum number of items to store. Must be >= 0.
 * @param {number} [ttl=0] - Time to live in milliseconds. Must be >= 0.
 * @param {boolean} [resetTtl=false] - Whether to reset TTL when accessing existing items.
 * @returns {LRU} A new LRU cache instance.
 * @throws {TypeError} When parameters are invalid.
 * @example
 * // Create cache with factory function
 * const cache = lru(100, 5000, true);
 * cache.set('key', 'value');
 *
 * @example
 * // Error handling
 * try {
 *   const cache = lru(-1); // Invalid max
 * } catch (error) {
 *   console.error(error.message); // "Invalid max value"
 * }
 * @see {@link LRU}
 * @since 1.0.0
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
}export{LRU,lru};