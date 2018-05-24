/**
 * Tiny LRU cache for Client or Server
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2018
 * @license BSD-3-Clause
 * @link https://github.com/avoidwork/tiny-lru
 * @version 1.6.1
 */
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (global) {
	var next = typeof process !== "undefined" ? process.nextTick : function (arg) {
		return setTimeout(arg, 1);
	},
	    empty = "";

	var LRU = function () {
		function LRU(max, notify, ttl, expire) {
			_classCallCheck(this, LRU);

			this.expire = expire;
			this.max = max;
			this.notify = notify;
			this.ttl = ttl;

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
			key: "clearTimer",
			value: function clearTimer(key) {
				var col = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "timers";

				if (this.has(key, col)) {
					clearTimeout(this[col][key]);
					delete this[col][key];
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
				var obj = JSON.parse(JSON.stringify(this));

				delete obj.timers;

				return JSON.stringify(obj);
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

					if (this.ttl > 0) {
						this.clearTimer(key).setTimer(key);
					}
				}

				return output;
			}
		}, {
			key: "has",
			value: function has(key) {
				var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "cache";

				return key in this[type];
			}
		}, {
			key: "onchange",
			value: function onchange() {}
		}, {
			key: "remove",
			value: function remove(k) {
				var silent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

				var key = typeof k !== "string" ? k.toString() : k,
				    result = void 0;

				if (this.has(key)) {
					var cached = this.cache[key];

					delete this.cache[key];
					this.length--;

					if (this.ttl > 0) {
						this.clearTimer(key);
					}

					if (silent === false && this.expire > 0) {
						this.clearTimer(key, "expires");
					}

					if (this.has(cached.previous)) {
						this.cache[cached.previous].next = cached.next;

						if (this.first === key) {
							this.first = cached.previous;
						}
					} else if (this.first === key) {
						this.first = empty;
					}

					if (this.has(cached.next)) {
						this.cache[cached.next].previous = cached.previous;

						if (this.last === key) {
							this.last = cached.next;
						}
					} else if (this.last === key) {
						this.last = empty;
					}

					result = cached;
				} else {
					if (this.first === key) {
						this.first = empty;
					}

					if (this.last === key) {
						this.last = empty;
					}
				}

				if (!silent && this.notify) {
					next(this.onchange("remove", this.dump()));
				}

				return result;
			}
		}, {
			key: "reset",
			value: function reset() {
				var _this = this;

				if (this.expires !== void 0) {
					Object.keys(this.expires).forEach(function (i) {
						return _this.clearTimer(i, "expires");
					});
				}

				if (this.timers !== void 0) {
					Object.keys(this.timers).forEach(function (i) {
						return _this.clearTimer(i);
					});
				}

				this.cache = {};
				this.expires = {};
				this.first = empty;
				this.last = empty;
				this.length = 0;
				this.timers = {};

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
					item.next = empty;

					if (this.first !== key) {
						item.previous = this.first;
					}

					if (this.last === key && item.previous !== empty) {
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
						next: empty,
						previous: this.first,
						value: value
					};
				}

				if (this.first !== key && this.has(this.first)) {
					first = this.cache[this.first];
					first.next = key;

					if (first.previous === key) {
						first.previous = empty;
					}
				}

				this.first = key;

				if (this.notify) {
					next(this.onchange("set", this.dump()));
				}

				if (this.ttl > 0) {
					this.clearTimer(key).setTimer(key);
				}

				if (this.expire > 0 && this.has(key, "expires") === false) {
					this.setExpire(key);
				}

				return this;
			}
		}, {
			key: "setExpire",
			value: function setExpire(key) {
				var _this2 = this;

				this.expires[key] = setTimeout(function () {
					return _this2.clearTimer(key, "expires").clearTimer(key).remove(key);
				}, this.expire);
			}
		}, {
			key: "setTimer",
			value: function setTimer(key) {
				var _this3 = this;

				this.timers[key] = setTimeout(function () {
					return _this3.remove(key);
				}, this.ttl);
			}
		}, {
			key: "update",
			value: function update(arg) {
				var _this4 = this;

				var obj = JSON.parse(arg);

				Object.keys(obj).forEach(function (i) {
					_this4[i] = obj[i];
				});
			}
		}]);

		return LRU;
	}();

	function factory() {
		var max = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
		var notify = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
		var ttl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
		var expire = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

		return new LRU(max, notify, ttl, expire);
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
