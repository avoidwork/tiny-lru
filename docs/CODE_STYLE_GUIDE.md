# Code Style Guide

Coding conventions for tiny-lru source code.

---

## Editor Configuration

Set your editor to use **tabs** for indentation.

## Forbidden Patterns

The following are **strictly prohibited**:

- Hardcoded secrets, API keys, or credentials.
- `eval()`, `exec()`, `__import__()` at any level.
- `*` imports (`from x import *`).
- Mutating a list while iterating over it.
- `new Array()` — use `Array()` or `Array.from()` instead (oxlint will warn).

## JavaScript Style

### Formatting

```javascript
// Tabs for indentation
function example() {
	const cache = new LRU();
}

// Double quotes
const name = "tiny-lru";

// Semicolons required
const result = cache.get("key");

// K&R braces
if (condition) {
	doSomething();
} else {
	doSomethingElse();
}

// Space before function parens
function myFunction() {}
const arrowFn = () => {};
const x = function () {};
```

### Comparisons

```javascript
// Use === and !== for comparisons
if (item !== undefined) {
}
if (this.first === null) {
}
```

### Object Creation

```javascript
// Use Object.create(null) for hash maps - avoids prototype pollution
this.items = Object.create(null);

// Use Array.from() for pre-allocated arrays
const result = Array.from({ length: this.size });

// Never use new Array() - use Array() or Array.from() instead
const items = Array(10); // NOT new Array(10)
```

## JSDoc Comments

Every exported function and class method must have JSDoc:

```javascript
/**
 * Short description of the method.
 *
 * @method methodName
 * @memberof LRU
 * @param {string} key - Description of parameter.
 * @returns {LRU} Description of return value.
 * @example
 * cache.set('key', 'value');
 * @see {@link LRU#get}
 * @since 1.0.0
 */
methodName(key) {
	// implementation
}
```

### JSDoc Tags

- `@method` - Method name
- `@memberof` - Parent class
- `@param` - Parameters with type and description
- `@returns` - Return value with type
- `@example` - Usage example
- `@see` - Related methods
- `@since` - Version introduced
- `@private` - For internal methods

## Naming

```javascript
// Classes: PascalCase
export class LRU { }

// Methods: camelCase
clear() { }
setWithEvicted() { }

// Variables: camelCase
const maxSize = 1000;
let currentItem = null;
```

## Method Patterns

### Method Chaining

Methods that modify state return `this`:

```javascript
clear() {
	this.size = 0;
	return this;
}
```

### Null Safety

Always check for null/undefined:

```javascript
if (item.prev !== null) {
	item.prev.next = item.next;
}

if (!item) {
	return this;
}
```

### Early Returns

Use early returns to reduce nesting:

```javascript
get(key) {
	const item = this.items[key];

	if (item === undefined) {
		return undefined;
	}

	// Main logic here
	return item.value;
}
```

## Class Structure

```javascript
export class LRU {
	// Constructor first
	constructor(max = 0, ttl = 0, resetTtl = false) {
		this.first = null;
		this.items = Object.create(null);
		this.last = null;
		this.max = max;
		this.resetTtl = resetTtl;
		this.size = 0;
		this.ttl = ttl;
	}

	// Public methods
	clear() {}
	get(key) {}
	set(key, value) {}

	// Private methods at end (if any)
	moveToEnd(item) {}
}
```

## Error Handling

Not applicable — internal LRU operations should not surface errors; handle gracefully.

## Testing and Coverage

- Framework: Node.js built-in test runner (`node --test`)
- Tests: 149 tests across 26 suites
- Coverage: 100% lines, 99.28% branches, 100% functions
- Test pattern: `tests/**/*.js`
- All tests must pass with 100% line coverage before merging
- Run: `npm test` (lint + tests) or `npm run coverage` for coverage report

### Coverage

Tests must maintain **100% line coverage**. Every new function or class needs test coverage. No exceptions.

```bash
npm run coverage
```

## Common Issues to Avoid

- **Memory leaks**: When removing items from the linked list, always clear `prev`/`next` pointers to allow garbage collection.
- **LRU order pollution**: Methods like `entries()` and `values()` should access items directly rather than calling `get()`, which moves items and can delete expired items mid-iteration.
- **TTL edge cases**: Direct property access (`this.items[key]`) should be used instead of `has()` when you need to inspect expired-but-not-yet-deleted items.
- **Dead code**: Always verify edge case code is actually reachable before adding special handling.
- **Constructor assignment**: Use `let` not `const` for variables that may be reassigned (e.g., in `setWithEvicted`).

## Lint Configuration

The project uses oxlint. Run `npm run lint` to check code style.
