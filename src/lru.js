class LRU {
	constructor (max) {
		this.cache = {};
		this.max = max;
		this.first = null;
		this.last = null;
		this.length = 0;
	}

	clone (arg) {
		let output;

		if (typeof arg !== "function") {
			output = JSON.parse(JSON.stringify(arg, null, 0));
		} else {
			output = arg;
		}

		return output;
	}

	delete (key) {
		return this.remove(key);
	}

	evict () {
		if (this.last !== null) {
			this.remove(this.last);
		}

		return this;
	}

	dump (string = true) {
		return string ? JSON.stringify(this, null, 0) : this.clone(this);
	}

	get (key) {
		let cached = this.cache[key],
			output;

		if (cached) {
			output = this.clone(cached.value);
			this.set(key, cached.value);
		}

		return output;
	}

	has (key) {
		return this.cache[key] !== undefined;
	}

	merge (arg = "{}") {
		let obj = typeof arg === "string" ? JSON.parse(arg) : this.clone(arg);

		Object.keys(obj).forEach(i => {
			this[i] = obj[i];
		});

		return this;
	}

	remove (key) {
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

		return cached;
	}

	set (key, value) {
		let obj = this.remove(key);

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
}
