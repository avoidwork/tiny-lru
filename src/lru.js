	class LRU {
		constructor (max, notify, ttl) {
			this.max = max;
			this.notify = notify;
			this.ttl = ttl;

			return this.reset();
		}

		clear (silent = false) {
			this.reset();

			if (silent === false && this.notify === true) {
				next(this.onchange("clear", this.dump()));
			}

			return this;
		}

		delete (key, silent = false) {
			return this.remove(key, silent);
		}

		dump () {
			return JSON.stringify({
				cache: this.cache,
				first: this.first,
				last: this.last,
				length: this.length,
				max: this.max,
				notify: this.notify,
				ttl: this.ttl
			});
		}

		evict () {
			this.remove(this.last, true, true);

			if (this.notify === true) {
				next(this.onchange("evict", this.dump()));
			}

			return this;
		}

		get (key, silent = false) {
			let result;

			if (this.has(key) === true) {
				const item = this.cache[key];

				if (item.expiry === -1 || item.expiry > Date.now()) {
					result = item.value;
					this.set(key, result, true, true);

					if (silent === false && this.notify === true) {
						next(this.onchange("get", this.dump()));
					}
				} else {
					this.remove(key);
				}
			}

			return result;
		}

		has (key) {
			return key in this.cache;
		}

		onchange () {}

		remove (key, silent = false, bypass = false) {
			let result;

			if (bypass === true || this.has(key) === true) {
				result = this.cache[key];

				delete this.cache[key];
				this.length--;

				if (result.previous !== empty) {
					this.cache[result.previous].next = result.next;

					if (this.first === key) {
						this.first = result.previous;
					}
				} else if (this.first === key) {
					this.first = empty;
				}

				if (result.next !== empty) {
					this.cache[result.next].previous = result.previous;

					if (this.last === key) {
						this.last = result.next;
					}
				} else if (this.last === key) {
					this.last = empty;
				}

				if (silent === false && this.notify === true) {
					next(this.onchange("remove", this.dump()));
				}
			}

			return result;
		}

		reset () {
			this.cache = {};
			this.first = empty;
			this.last = empty;
			this.length = 0;

			return this;
		}

		set (key, value, silent = false, bypass = false) {
			if (bypass === true || this.has(key) === true) {
				const item = this.cache[key];

				item.value = value;
				item.next = empty;

				if (this.first !== key) {
					item.previous = this.first;
				}

				if (this.last === key && item.previous !== empty) {
					this.last = item.previous;
				}
			} else {
				if (this.length === this.max) {
					this.evict();
				}

				this.length++;
				this.cache[key] = {
					expiry: this.ttl > 0 ? new Date().getTime() + this.ttl : -1,
					next: empty,
					previous: this.first,
					value: value
				};

				if (this.length === 1) {
					this.last = key;
				}
			}

			if (this.first !== empty && this.first !== key) {
				const first = this.cache[this.first];

				first.next = key;

				if (first.previous === key) {
					first.previous = empty;
				}
			}

			this.first = key;

			if (silent === false && this.notify === true) {
				next(this.onchange("set", this.dump()));
			}

			return this;
		}

		update (arg) {
			const obj = JSON.parse(arg);

			Object.keys(obj).forEach(i => {
				this[i] = obj[i];
			});
		}
	}
