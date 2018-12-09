	class LRU {
		constructor (max, ttl) {
			this.cache = {};
			this.first = empty;
			this.last = empty;
			this.length = 0;
			this.max = max;
			this.ttl = ttl;
		}

		clear () {
			this.cache = {};
			this.first = empty;
			this.last = empty;
			this.length = 0;

			return this;
		}

		delete (key) {
			return this.remove(key);
		}

		evict () {
			this.remove(this.last, true);

			return this;
		}

		get (key) {
			let result;

			if (this.has(key) === true) {
				const item = this.cache[key];

				if (item.expiry === -1 || item.expiry > Date.now()) {
					result = item.value;
					this.set(key, result, true, true);
				} else {
					this.remove(key);
				}
			}

			return result;
		}

		has (key) {
			return key in this.cache;
		}

		remove (key, bypass = false) {
			let result;

			if (bypass === true || this.has(key) === true) {
				result = this.cache[key];

				delete this.cache[key];
				this.length--;

				if (result.previous !== empty) {
					this.cache[result.previous].next = result.next;
				}

				if (result.next !== empty) {
					this.cache[result.next].previous = result.previous;
				}

				if (this.first === key) {
					this.first = result.previous;
				}

				if (this.last === key) {
					this.last = result.next;
				}
			}

			return result;
		}

		set (key, value, bypass = false) {
			if (bypass === true || this.has(key) === true) {
				const item = this.cache[key];

				item.value = value;

				if (this.first !== key) {
					const n = item.next,
						p = item.previous;

					item.next = empty;
					item.previous = this.first;
					link(this.cache[this.first], key);

					if (n !== empty && n !== this.first) {
						if (p !== empty) {
							this.cache[p].next = n;
						}

						this.cache[n].previous = p;
					}

					if (this.last === key) {
						this.last = n;
					}
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

				if (this.first !== empty && this.first !== key) {
					link(this.cache[this.first], key);
				}
			}

			this.first = key;

			return this;
		}
	}
