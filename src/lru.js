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
			this.remove(this.last, true);

			if (this.notify === true) {
				next(this.onchange("evict", this.dump()));
			}

			return this;
		}

		get (key) {
			let output;

			if (this.has(key) === true) {
				const item = this.cache[key];

				if (item.expiry === -1 || item.expiry <= Date.now()) {
					output = item.value;
					//this.link(key, "first");

					if (this.notify === true) {
						next(this.onchange("get", this.dump()));
					}
				} else {
					this.remove(key);
				}
			}

			return output;
		}

		has (key) {
			return key in this.cache;
		}

		link (key, pos = "first") {
			if (this[pos] !== key) {
				if (pos === "first") {
					const item = this.cache[key];

					item.next = empty;

					if (this.last === key && item.previous !== empty) {
						this.last = item.previous;
					}

					item.previous = this.first;
					this.first = key;
				}/* else {

				}*/
			}
		}

		onchange () {}

		remove (key, silent = false) {
			let result;

			if (this.has(key) === true) {
				result = this.cache[key];

				delete this.cache[key];
				this.length--;

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

		set (key, value) {
			if (this.has(key) === true) {
				const item = this.cache[key];

				item.value = value;
				item.next = empty;
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
			}

			if (this.notify === true) {
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
