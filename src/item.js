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
