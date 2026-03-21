# Code Style Guide

Coding conventions for tiny-lru source code.

## Editor Configuration

Set your editor to use **tabs** for indentation.

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
function myFunction() { }
const arrowFn = () => { };
const x = function() { };
```

### Comparisons

```javascript
// Use === and !== for comparisons
if (item !== undefined) { }
if (this.first === null) { }
```

### Object Creation

```javascript
// Use Object.create(null) for hash maps - avoids prototype pollution
this.items = Object.create(null);

// Use Array.from() for pre-allocated arrays
const result = Array.from({ length: this.size });
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

// Constants: camelCase (not UPPER_SNAKE)
const defaultMax = 1000;
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
	clear() { }
	get(key) { }
	set(key, value) { }

	// Private methods at end (if any)
	moveToEnd(item) { }
}
```

## Error Handling

Use TypeError with clear messages:

```javascript
if (isNaN(max) || max < 0) {
	throw new TypeError("Invalid max value");
}
```

## ESLint Configuration

The project uses oxlint. Run `npm run lint` to check code style.
