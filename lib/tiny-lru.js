/**
 * tiny-lru
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2013 Jason Mulligan
 * @license BSD-3 <https://raw.github.com/avoidwork/tiny-lru/master/LICENSE>
 * @link https://github.com/avoidwork/tiny-lru
 * @module tiny-lru
 * @version 1.0.1
 */
( function ( global ) {
"use strict";

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
			else {
				item.value = value;
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
/**
 * LRU Item factory
 *
 * @param {Mixed} value Item value
 * @constructor
 */
function LRUItem ( value ) {
	this.next     = null;
	this.previous = null;
	this.value    = value;
}

// Setting prototype & constructor loop
LRUItem.prototype.constructor = LRUItem;

// CommonJS, AMD, script tag
if ( typeof exports !== "undefined" ) {
	module.exports = lru.factory;
}
else if ( typeof define === "function" ) {
	define( function () {
		return lru.factory;
	});
}
else {
	global.lru = lru.factory;
}
})( this );
