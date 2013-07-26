/**
 * Least Recently Used cache
 *
 * @class lru
 */
var lru = {
	/**
	 * LRU cache factory
	 *
	 * @method factory
	 * @param  {Number} max [Optional] Max size of cache, default is 1000
	 * @return {Object}     LRU instance
	 */
	factory : function ( max ) {
		var self = new LRU();

		if ( !isNaN( max ) ) {
			self.max = max;
		}

		return self;
	},

	// Inherited by LRUs
	methods : {
		/**
		 * Evicts the least recently used item from cache
		 *
		 * @method evict
		 * @return {Object} LRU instance
		 */
		evict : function () {
			if ( this.last !== null ) {
				this.remove( this.last );
			}

			return this;
		},

		/**
		 * Gets cached item and moves it to the front
		 *
		 * @method get
		 * @param  {String} key Item key
		 * @return {Mixed}      Undefined or Item value
		 */
		get : function ( key ) {
			var item = this.cache[key];

			if ( item === undefined ) {
				return;
			}

			this.set( key, item.value );

			return item.value;
		},

		/**
		 * Removes item from cache
		 *
		 * @method remove
		 * @param  {String} key Item key
		 * @return {Object}     Item
		 */
		remove : function ( key ) {
			var item = this.cache[ key ];

			if ( item !== undefined ) {
				delete this.cache[key];

				this.length--;

				if ( item.previous !== null ) {
					this.cache[item.previous].next = item.next;
				}

				if ( item.next !== null ) {
					this.cache[item.next].previous = item.previous;
				}

				if ( this.first === key ) {
					this.first = item.previous;
				}

				if ( this.last === key ) {
					this.last = item.next;
				}
			}

			return item;
		},

		/**
		 * Sets item in cache as `first`
		 *
		 * @method set
		 * @param  {String} key   Item key
		 * @param  {Mixed}  value Item value
		 * @return {Object}       LRU instance
		 */
		set : function ( key, value ) {
			var item = this.remove( key );

			if ( item === undefined ) {
				item = new LRUItem( value );
			}

			item.next       = null;
			item.previous   = this.first;
			this.cache[key] = item;

			if ( this.first !== null ) {
				this.cache[this.first].next = key;
			}

			this.first = key;

			if ( this.last === null ) {
				this.last = key;
			}

			if ( ++this.length > this.max ) {
				this.evict();
			}

			return this;
		}
	}
};

/**
 * LRU factory
 *
 * @method LRU
 * @constructor
 */
function LRU () {
	this.cache  = {};
	this.max    = 1000;
	this.first  = null;
	this.last   = null;
	this.length = 0;
}

// Setting prototype & constructor loop
LRU.prototype = lru.methods;
LRU.prototype.constructor = LRU;