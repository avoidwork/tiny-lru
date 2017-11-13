/**
 * Tiny LRU cache for Client or Server
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2017
 * @license BSD-3-Clause
 * @link https://github.com/avoidwork/tiny-lru
 * @version 1.4.13
 */
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (global) {
	var next = typeof process !== "undefined" ? process.nextTick : function (arg) {
		return setTimeout(arg, 1);
	};

	var LRU = function () {
		function LRU(max) {
			_classCallCheck(this, LRU);

			this.max = max;
			this.notify = false;

			return this.reset();
		}

		_createClass(LRU, [{
			key: "clear",
			value: function clear() {
				var silent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				this.reset();

				if (!silent && this.notify) {
					next(this.onchange("clear", this.dump()));
				}

				return this;
			}
		}, {
			key: "delete",
			value: function _delete(key) {
				var silent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

				return this.remove(key, silent);
			}
		}, {
			key: "dump",
			value: function dump() {
				return JSON.stringify(this, null, 0);
			}
		}, {
			key: "evict",
			value: function evict() {
				if (this.has(this.last)) {
					this.remove(this.last, true);
				}

				if (this.notify) {
					next(this.onchange("evict", this.dump()));
				}

				return this;
			}
		}, {
			key: "get",
			value: function get(key) {
				var output = void 0;

				if (this.has(key)) {
					output = this.cache[key].value;
					this.set(key, output);

					if (this.notify) {
						next(this.onchange("get", this.dump()));
					}
				}

				return output;
			}
		}, {
			key: "has",
			value: function has(key) {
				return key in this.cache;
			}
		}, {
			key: "onchange",
			value: function onchange() {}
		}, {
			key: "remove",
			value: function remove(k) {
				var silent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

				var key = typeof k !== "string" ? k.toString() : k,
				    cached = this.cache[key];

				if (cached) {
					delete this.cache[key];
					this.length--;

					if (this.has(cached.previous)) {
						this.cache[cached.previous].next = cached.next;

						if (this.first === key) {
							this.first = cached.previous;
						}
					} else if (this.first === key) {
						this.first = null;
					}

					if (this.has(cached.next)) {
						this.cache[cached.next].previous = cached.previous;

						if (this.last === key) {
							this.last = cached.next;
						}
					} else if (this.last === key) {
						this.last = null;
					}
				} else {
					if (this.first === key) {
						this.first = null;
					}

					if (this.last === key) {
						this.last = null;
					}
				}

				if (!silent && this.notify) {
					next(this.onchange("remove", this.dump()));
				}

				return cached;
			}
		}, {
			key: "reset",
			value: function reset() {
				this.cache = Object.create(null);
				this.first = null;
				this.last = null;
				this.length = 0;

				return this;
			}
		}, {
			key: "set",
			value: function set(key, value) {
				var first = void 0,
				    item = void 0;

				if (this.has(key)) {
					item = this.cache[key];
					item.value = value;
					item.next = null;

					if (this.first !== key) {
						item.previous = this.first;
					}

					if (this.last === key && item.previous !== null) {
						this.last = item.previous;
					}
				} else {
					if (++this.length > this.max) {
						this.remove(this.last, true);
					}

					if (this.length === 1) {
						this.last = key;
					}

					this.cache[key] = {
						next: null,
						previous: this.first,
						value: value
					};
				}

				if (this.first !== key && this.has(this.first)) {
					first = this.cache[this.first];
					first.next = key;

					if (first.previous === key) {
						first.previous = null;
					}
				}

				this.first = key;

				if (this.notify) {
					next(this.onchange("set", this.dump()));
				}

				return this;
			}
		}, {
			key: "update",
			value: function update(arg) {
				var _this = this;

				var obj = JSON.parse(arg);

				Object.keys(obj).forEach(function (i) {
					_this[i] = obj[i];
				});
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
	} else if (typeof define === "function" && define.amd !== void 0) {
		define(function () {
			return factory;
		});
	} else {
		global.lru = factory;
	}
})(typeof window !== "undefined" ? window : global);
