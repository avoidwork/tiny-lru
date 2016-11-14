"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Tiny LRU cache for Client or Server
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2016
 * @license BSD-3-Clause
 * @link https://github.com/avoidwork/tiny-lru
 * @version 1.2.0
 */
(function (global) {
	var LRU = function () {
		function LRU(max) {
			_classCallCheck(this, LRU);

			this.cache = {};
			this.max = max;
			this.first = null;
			this.last = null;
			this.length = 0;
		}

		_createClass(LRU, [{
			key: "clone",
			value: function clone(arg) {
				var output = void 0;

				if (typeof arg !== "function") {
					output = JSON.parse(JSON.stringify(arg, null, 0));
				} else {
					output = arg;
				}

				return output;
			}
		}, {
			key: "delete",
			value: function _delete(key) {
				return this.remove(key);
			}
		}, {
			key: "evict",
			value: function evict() {
				if (this.last !== null) {
					this.remove(this.last);
				}

				return this;
			}
		}, {
			key: "dump",
			value: function dump() {
				var string = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

				return string ? JSON.stringify(this, null, 0) : this.clone(this);
			}
		}, {
			key: "get",
			value: function get(key) {
				var cached = this.cache[key],
				    output = void 0;

				if (cached) {
					output = this.clone(cached.value);
					this.set(key, cached.value);
				}

				return output;
			}
		}, {
			key: "has",
			value: function has(key) {
				return this.cache[key] !== undefined;
			}
		}, {
			key: "remove",
			value: function remove(key) {
				var cached = this.cache[key];

				if (cached) {
					delete this.cache[key];
					this.length--;

					if (cached.previous !== null) {
						this.cache[cached.previous].next = cached.next;
					}

					if (cached.next !== null) {
						this.cache[cached.next].previous = cached.previous;
					}

					if (this.first === key) {
						this.first = cached.previous;
					}

					if (this.last === key) {
						this.last = cached.next;
					}
				}

				return cached;
			}
		}, {
			key: "set",
			value: function set(key, value) {
				var obj = this.remove(key);

				if (!obj) {
					obj = {
						next: null,
						previous: null,
						value: this.clone(value)
					};
				} else {
					obj.value = this.clone(value);
				}

				obj.next = null;
				obj.previous = this.first;
				this.cache[key] = obj;

				if (this.first) {
					this.cache[this.first].next = key;
				}

				this.first = key;

				if (!this.last) {
					this.last = key;
				}

				if (++this.length > this.max) {
					this.evict();
				}

				return this;
			}
		}]);

		return LRU;
	}();

	function factory() {
		var max = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;

		return new LRU(max);
	}

	// Node, AMD & window supported
	if (typeof exports !== "undefined") {
		module.exports = factory;
	} else if (typeof define === "function" && define.amd) {
		define(function () {
			return factory;
		});
	} else {
		global.lru = factory;
	}
})(typeof window !== "undefined" ? window : global);
