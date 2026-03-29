/**
 * Factory function to create a new LRU cache instance with parameter validation.
 * @param max Maximum number of items to store (default: 1000, 0 = unlimited)
 * @param ttl Time to live in milliseconds (default: 0, 0 = no expiration)
 * @param resetTTL Whether to reset TTL when updating existing items via set() (default: false)
 * @returns A new LRU cache instance
 * @throws TypeError when parameters are invalid (negative numbers or wrong types)
 */
export function lru<T = any>(max?: number, ttl?: number, resetTTL?: boolean): LRU<T>;

/**
 * Internal structure representing a cache item in the doubly-linked list.
 */
export interface LRUItem<T> {
	/** Expiration timestamp in milliseconds (0 if no TTL) */
	expiry: number;
	/** The key associated with this item */
	key: any;
	/** Pointer to the previous item in the LRU list */
	prev: LRUItem<T> | null;
	/** Pointer to the next item in the LRU list */
	next: LRUItem<T> | null;
	/** The cached value */
	value: T;
}

/**
 * Represents the evicted item returned by setWithEvicted().
 */
export interface EvictedItem<T> {
	/** The key of the evicted item */
	key: any;
	/** The value of the evicted item */
	value: T;
	/** The expiration timestamp of the evicted item */
	expiry: number;
}

/**
 * High-performance Least Recently Used (LRU) cache with optional TTL support.
 * All core operations (get, set, delete) are O(1).
 */
export class LRU<T = any> {
	/**
	 * Creates a new LRU cache instance.
	 * Note: Constructor does not validate parameters. Use lru() factory function for parameter validation.
	 * @param max Maximum number of items to store (default: 0, 0 = unlimited)
	 * @param ttl Time to live in milliseconds (default: 0, 0 = no expiration)
	 * @param resetTTL Whether to reset TTL when updating existing items via set() (default: false)
	 */
	constructor(max?: number, ttl?: number, resetTTL?: boolean);

	/** Pointer to the least recently used item (first to be evicted) */
	first: LRUItem<T> | null;
	/** Hash map for O(1) key-based access to cache nodes */
	items: Record<any, LRUItem<T> | undefined>;
	/** Pointer to the most recently used item */
	last: LRUItem<T> | null;
	/** Maximum number of items to store (0 = unlimited) */
	max: number;
	/** Whether to reset TTL on set() operations */
	resetTTL: boolean;
	/** Current number of items in the cache */
	size: number;
	/** Time-to-live in milliseconds (0 = no expiration) */
	ttl: number;

	/**
	 * Removes all items from the cache.
	 * @returns The LRU instance for method chaining
	 */
	clear(): this;

	/**
	 * Removes an item from the cache by key.
	 * @param key The key of the item to delete
	 * @returns The LRU instance for method chaining
	 */
	delete(key: any): this;

	/**
	 * Returns an array of [key, value] pairs for the specified keys.
	 * Order follows LRU order (least to most recently used).
	 * @param keys Array of keys to get entries for (defaults to all keys)
	 * @returns Array of [key, value] pairs in LRU order
	 */
	entries(keys?: any[]): [any, T | undefined][];

	/**
	 * Removes the least recently used item from the cache.
	 * @returns The LRU instance for method chaining
	 */
	evict(): this;

	/**
	 * Returns the expiration timestamp for a given key.
	 * @param key The key to check expiration for
	 * @returns The expiration timestamp in milliseconds, or undefined if key doesn't exist
	 */
	expiresAt(key: any): number | undefined;

	/**
	 * Retrieves a value from the cache by key. Updates the item's position to most recently used.
	 * @param key The key to retrieve
	 * @returns The value associated with the key, or undefined if not found or expired
	 */
	get(key: any): T | undefined;

	/**
	 * Checks if a key exists in the cache (not expired).
	 * @param key The key to check for
	 * @returns True if the key exists and is not expired, false otherwise
	 */
	has(key: any): boolean;

	/**
	 * Iterate over cache items in LRU order (least to most recent).
	 * @param callback Function to call for each item. Signature: callback(value, key, cache)
	 * @param thisArg Value to use as `this` when executing callback
	 * @returns The LRU instance for method chaining
	 */
	forEach(callback: (value: T, key: any, cache: this) => void, thisArg?: any): this;

	/**
	 * Retrieve a value from the cache by key without updating LRU order.
	 * Note: Does not perform TTL checks or remove expired items.
	 * @param key The key to retrieve
	 * @returns The value associated with the key, or undefined if not found
	 */
	peek(key: any): T | undefined;

	/**
	 * Batch retrieve multiple items.
	 * @param keys Array of keys to retrieve
	 * @returns Object mapping keys to values (undefined for missing/expired keys)
	 */
	getMany(keys: any[]): Record<any, T | undefined>;

	/**
	 * Batch existence check - returns true if ALL keys exist.
	 * @param keys Array of keys to check
	 * @returns True if all keys exist and are not expired
	 */
	hasAll(keys: any[]): boolean;

	/**
	 * Batch existence check - returns true if ANY key exists.
	 * @param keys Array of keys to check
	 * @returns True if any key exists and is not expired
	 */
	hasAny(keys: any[]): boolean;

	/**
	 * Remove expired items without affecting LRU order.
	 * Unlike get(), this does not move items to the end.
	 * @returns Number of expired items removed
	 */
	cleanup(): number;

	/**
	 * Serialize cache to JSON-compatible format.
	 * @returns Array of cache items with key, value, and expiry
	 */
	toJSON(): Array<{ key: any; value: T; expiry: number }>;

	/**
	 * Get cache statistics.
	 * @returns Statistics object with hits, misses, sets, deletes, evictions counts
	 */
	stats(): {
			hits: number;
			misses: number;
			sets: number;
			deletes: number;
			evictions: number;
	};

	/**
	 * Register callback for evicted items.
	 * @param callback Function called when item is evicted. Receives {key, value, expiry}
	 * @returns The LRU instance for method chaining
	 */
	onEvict(callback: (item: { key: any; value: T; expiry: number }) => void): this;

	/**
	 * Get counts of items by TTL status.
	 * @returns Object with valid, expired, and noTTL counts
	 */
	sizeByTTL(): {
			valid: number;
			expired: number;
			noTTL: number;
	};

	/**
	 * Get keys filtered by TTL status.
	 * @returns Object with valid, expired, and noTTL arrays of keys
	 */
	keysByTTL(): {
			valid: any[];
			expired: any[];
			noTTL: any[];
	};

	/**
	 * Get values filtered by TTL status.
	 * @returns Object with valid, expired, and noTTL arrays of values
	 */
	valuesByTTL(): {
			valid: (T | undefined)[];
			expired: (T | undefined)[];
			noTTL: (T | undefined)[];
	};

	/**
	 * Returns an array of all keys in the cache, ordered from least to most recently used.
	 * @returns Array of keys in LRU order
	 */
	keys(): any[];

	/**
	 * Sets a value in the cache. Updates the item's position to most recently used.
	 * @param key The key to set
	 * @param value The value to store
	 * @returns The LRU instance for method chaining
	 */
	set(key: any, value: T): this;

	/**
	 * Sets a value in the cache and returns any evicted item.
	 * @param key The key to set
	 * @param value The value to store
	 * @returns The evicted item (if any) with {key, value, expiry} or null
	 */
	setWithEvicted(key: any, value: T): EvictedItem<T> | null;

	/**
	 * Returns an array of all values in the cache for the specified keys.
	 * Order follows LRU order (least to most recently used).
	 * @param keys Array of keys to get values for (defaults to all keys)
	 * @returns Array of values corresponding to the keys (undefined for missing/expired keys)
	 */
	values(keys?: any[]): (T | undefined)[];
}
