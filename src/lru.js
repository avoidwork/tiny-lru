	class LRU {
		constructor (max, ttl) {
			this.clear();
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

		delete (key, bypass = false) {
			return this.remove(key, bypass);
		}

		evict () {
			if (this.length > 0) {
				this.remove(this.last, true);
			}

			return this;
		}

		get (key) {
			let result;

			if (this.has(key) === true) {
				const item = this.cache[key];

				if (item.expiry === -1 || item.expiry > Date.now()) {
					result = item.value;
					this.set(key, result, true);
				} else {
					this.remove(key, true);
				}
			}

			return result;
		}

		has (key) {
			return key in this.cache;
		}

		remove (key, bypass = false) {
			if (bypass === true || this.has(key) === true) {
				const item = this.cache[key];

				delete this.cache[key];
				this.length--;

				if (item.left !== empty) {
					this.cache[item.left].right = item.right;
				}

				if (item.right !== empty) {
					this.cache[item.right].left = item.left;
				}

				if (this.first === key) {
					this.first = item.left;
				}

				if (this.last === key) {
					this.last = item.right;
				}
			}

			return this;
		}

		set (key, value, bypass = false) {
			if (bypass === true || this.has(key) === true) {
				const item = this.cache[key];

				item.value = value;

				if (this.first !== key) {
					const r = item.right,
						l = item.left,
						f = this.cache[this.first];

					item.right = empty;
					item.left = this.first;
					f.right = key;

					if (f.left === key) {
						f.left = l;
					}

					if (r !== empty) {
						if (l !== empty) {
							this.cache[l].right = r;
						}

						this.cache[r].left = l;
					}

					if (this.last === key) {
						this.last = r;
					}
				}
			} else {
				if (this.length === this.max) {
					this.evict();
				}

				this.length++;
				this.cache[key] = {
					expiry: this.ttl > 0 ? new Date().getTime() + this.ttl : -1,
					right: empty,
					left: this.first,
					value: value
				};

				if (this.length === 1) {
					this.last = key;
				} else {
					this.cache[this.first].right = key;
				}
			}

			this.first = key;

			return this;
		}
	}
