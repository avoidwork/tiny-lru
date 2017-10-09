	class LRU {
		constructor (max) {
			this.max = max;
			this.notify = false;

			return this.reset();
		}

		clear (silent = false) {
			this.reset();

			if (!silent && this.notify) {
				next(this.onchange("clear", this.dump()));
			}

			return this;
		}

		delete (key, silent = false) {
			return this.remove(key, silent);
		}

		dump () {
			return JSON.stringify(this, null, 0);
		}

		evict () {
			if (this.has(this.last)) {
				this.remove(this.last, true);
			}

			if (this.notify) {
				next(this.onchange("evict", this.dump()));
			}

			return this;
		}

		get (key) {
			let output;

			if (this.has(key)) {
				output = this.cache[key].value;
				this.set(key, output);

				if (this.notify) {
					next(this.onchange("get", this.dump()));
				}
			}

			return output;
		}

		has (key) {
			return key in this.cache;
		}

		onchange () {}

		remove (k, silent = false) {
			let key = typeof k !== "string" ? k.toString() : k,
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

		reset () {
			this.cache = Object.create(null);
			this.first = null;
			this.last = null;
			this.length = 0;

			return this;
		}

		set (key, value) {
			let first, item;

			if (this.has(key)) {
				item = this.cache[key];
				item.value = value;
				item.next = null;
				item.previous = this.first !== key ? this.first : null;

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

		update (arg) {
			const obj = JSON.parse(arg);

			keys(obj).forEach(i => {
				this[i] = obj[i];
			});
		}
	}
