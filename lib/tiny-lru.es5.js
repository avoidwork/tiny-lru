"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Tiny LRU cache for Client or Server
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2019
 * @license BSD-3-Clause
 * @version 6.0.1
 */

(function (global) {
	var LRU = function () {
		function LRU() {
			var max = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
			var ttl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

			_classCallCheck(this, LRU);

			this.first = null;
			this.items = {};
			this.last = null;
			this.max = max;
			this.size = 0;
			this.ttl = ttl;
		}

		_createClass(LRU, [{
			key: "has",
			value: function has(key) {
				return key in this.items;
			}
		}, {
			key: "clear",
			value: function clear() {
				this.first = null;
				this.items = {};
				this.last = null;
				this.size = 0;

				return this;
			}
		}, {
			key: "delete",
			value: function _delete(key) {
				if (this.has(key)) {
					var item = this.items[key];

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
		}, {
			key: "evict",
			value: function evict() {
				var item = this.first;

				delete this.items[item.key];
				this.first = item.next;
				this.first.prev = null;
				this.size--;

				return this;
			}
		}, {
			key: "get",
			value: function get(key) {
				var result = void 0;

				if (this.has(key)) {
					var item = this.items[key];

					if (this.ttl > 0 && item.expiry <= new Date().getTime()) {
						this.delete(key);
					} else {
						result = item.value;
						this.set(key, result, true);
					}
				}

				return result;
			}
		}, {
			key: "keys",
			value: function keys() {
				return Object.keys(this.items);
			}
		}, {
			key: "set",
			value: function set(key, value) {
				var bypass = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

				var item = void 0;

				if (bypass || this.has(key)) {
					item = this.items[key];
					item.value = value;

					if (this.last !== item) {
						var last = this.last,
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
						this.evict();
					}

					item = this.items[key] = {
						expiry: this.ttl > 0 ? new Date().getTime() + this.ttl : this.ttl,
						key: key,
						prev: this.last,
						next: null,
						value: value
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
		}]);

		return LRU;
	}();

	function factory() {
		var max = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
		var ttl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

		if (isNaN(max) || max < 0) {
			throw new TypeError("Invalid max value");
		}

		if (isNaN(ttl) || ttl < 0) {
			throw new TypeError("Invalid ttl value");
		}

		return new LRU(max, ttl);
	}

	// Node, AMD & window supported
	if (typeof exports !== "undefined") {
		module.exports = factory;
	} else if (typeof define === "function" && define.amd !== void 0) {
		define(function () {
			return factory;
		});
	} else {
		global.lru = factory;
	}
})(typeof window !== "undefined" ? window : global);