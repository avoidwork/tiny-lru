	class LRU {
		constructor (max) {
			this.cache = {};
			this.first = null;
			this.last = null;
			this.length = 0;
			this.max = max;
			this.notify = false;
			this.onchange = () => {};
			this.update = arg => {
				let obj = JSON.parse(arg);

				Object.keys(obj).forEach(i => {
					this[i] = obj[i];
				});
			};
		}

		clear (silent = false) {
			this.cache = {};
			this.first = null;
			this.last = null;
			this.length = 0;

			if (!silent && this.notify) {
				next(this.onchange("clear", this.dump()));
			}
		}

		delete (key) {
			return this.remove(key);
		}

		dump () {
			return JSON.stringify(this, null, 0);
		}

		evict () {
			if (this.last !== null) {
				this.remove(this.last, true);
			}

			if (this.notify) {
				next(this.onchange("evict", this.dump()));
			}

			return this;
		}

		get (key) {
			let cached = this.cache[key],
				output;

			if (cached) {
				output = cached.value;
				this.set(key, cached.value);
			}

			if (this.notify) {
				next(this.onchange("get", this.dump()));
			}

			return output;
		}

		has (key) {
			return this.cache[key] !== undefined;
		}

		remove (key, silent = false) {
			let cached = this.cache[key];

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

			if (!silent && this.notify) {
				next(this.onchange("remove", this.dump()));
			}

			return cached;
		}

		set (key, value) {
			let obj = this.remove(key, true);

			if (!obj) {
				obj = {
					next: null,
					previous: null,
					value: value
				};
			} else {
				obj.value = value;
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

			if (this.notify) {
				next(this.onchange("set", this.dump()));
			}

			return this;
		}
	}
