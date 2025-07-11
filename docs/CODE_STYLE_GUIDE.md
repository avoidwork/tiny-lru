# Code Style Guide

This document outlines the coding standards and best practices for the tiny-lru project. Following these guidelines ensures consistency, maintainability, and readability across the codebase.

## Table of Contents

- [General Principles](#general-principles)
- [Naming Conventions](#naming-conventions)
- [Code Formatting](#code-formatting)
- [Documentation](#documentation)
- [Functions and Methods](#functions-and-methods)
- [Classes](#classes)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Security](#security)
- [Performance](#performance)
- [File Organization](#file-organization)

## General Principles

We adhere to the following software engineering principles:

- **DRY (Don't Repeat Yourself)**: Avoid code duplication
- **KISS (Keep It Simple, Stupid)**: Favor simple solutions over complex ones
- **YAGNI (You Aren't Gonna Need It)**: Don't implement features until they're needed
- **SOLID Principles**: Follow object-oriented design principles
- **OWASP Security Guidelines**: Implement secure coding practices

## Naming Conventions

### Variables and Functions
- Use **camelCase** for all variable and function names
- Use descriptive names that clearly indicate purpose

```javascript
// ✅ Good
const userCache = new LRU(100);
const calculateExpiry = (ttl) => Date.now() + ttl;

// ❌ Bad
const uc = new LRU(100);
const calc = (t) => Date.now() + t;
```

### Constants
- Use **UPPER_CASE_SNAKE_CASE** for constants
- Group related constants together

```javascript
// ✅ Good
const DEFAULT_MAX_SIZE = 1000;
const DEFAULT_TTL = 0;
const CACHE_MISS_PENALTY = 100;

// ❌ Bad
const defaultMaxSize = 1000;
const default_ttl = 0;
```

### Classes
- Use **PascalCase** for class names
- Use descriptive names that indicate the class purpose

```javascript
// ✅ Good
class LRU {
  // implementation
}

class CacheNode {
  // implementation
}

// ❌ Bad
class lru {
  // implementation
}
```

### Files and Directories
- Use **kebab-case** for file and directory names
- Use descriptive names that indicate content purpose

```
src/
  lru.js
  cache-utils.js
test/
  integration/
    lru-integration-test.js
  unit/
    lru-unit-test.js
```

## Code Formatting

### Indentation
- Use **tabs** for indentation (as per existing codebase)
- Be consistent throughout the project

### Line Length
- Keep lines under **120 characters** when possible
- Break long lines at logical points

### Spacing
- Use spaces around operators
- Use spaces after commas
- No trailing whitespace

```javascript
// ✅ Good
const result = a + b * c;
const array = [1, 2, 3, 4];
const object = { key: value, another: data };

// ❌ Bad
const result=a+b*c;
const array=[1,2,3,4];
const object={key:value,another:data};
```

### Semicolons
- Use semicolons consistently throughout the codebase
- Follow the existing project pattern

### Braces
- Use consistent brace style (K&R style as per existing code)

```javascript
// ✅ Good
if (condition) {
	doSomething();
} else {
	doSomethingElse();
}

// ❌ Bad
if (condition)
{
	doSomething();
}
else
{
	doSomethingElse();
}
```

## Documentation

### JSDoc Standards
- Use **JSDoc standard** for all function and class documentation
- Include comprehensive descriptions, parameters, return values, and examples

```javascript
/**
 * Retrieves a value from the cache by key.
 *
 * @method get
 * @memberof LRU
 * @param {string} key - The key to retrieve.
 * @returns {*} The value associated with the key, or undefined if not found.
 * @example
 * cache.set('key1', 'value1');
 * console.log(cache.get('key1')); // 'value1'
 * @see {@link LRU#set}
 * @since 1.0.0
 */
get(key) {
	// implementation
}
```

### Required JSDoc Tags
- `@param` for all parameters with type and description
- `@returns` for return values with type and description
- `@throws` for exceptions that may be thrown
- `@example` for usage examples
- `@since` for version information
- `@see` for related methods/classes
- `@memberof` for class methods

### Code Comments
- Use inline comments sparingly and only when code logic is complex
- Write self-documenting code when possible
- Explain **why**, not **what**

```javascript
// ✅ Good - explains why
if (this.ttl > 0 && item.expiry <= Date.now()) {
	// Item has expired, remove it from cache
	this.delete(key);
}

// ❌ Bad - explains what (obvious from code)
// Check if ttl is greater than 0 and item expiry is less than or equal to current time
if (this.ttl > 0 && item.expiry <= Date.now()) {
	this.delete(key);
}
```

## Functions and Methods

### Function Design
- Keep functions small and focused on a single responsibility
- Use pure functions when possible (no side effects)
- Limit function parameters (prefer 3 or fewer)

```javascript
// ✅ Good - single responsibility
function isExpired(item, currentTime) {
	return item.expiry > 0 && item.expiry <= currentTime;
}

// ❌ Bad - multiple responsibilities
function processItemAndUpdateCache(item, cache, currentTime) {
	if (item.expiry > 0 && item.expiry <= currentTime) {
		cache.delete(item.key);
		cache.stats.evictions++;
		return null;
	}
	cache.stats.hits++;
	return item.value;
}
```

### Method Chaining
- Return `this` from methods that modify state to enable chaining
- Document chaining capability in JSDoc

```javascript
/**
 * @returns {LRU} The LRU instance for method chaining.
 */
set(key, value) {
	// implementation
	return this;
}
```

### Parameter Validation
- Validate parameters at function entry
- Throw appropriate errors for invalid inputs
- Use meaningful error messages

```javascript
function lru(max = 1000, ttl = 0, resetTtl = false) {
	if (isNaN(max) || max < 0) {
		throw new TypeError("Invalid max value");
	}
	
	if (isNaN(ttl) || ttl < 0) {
		throw new TypeError("Invalid ttl value");
	}
	
	if (typeof resetTtl !== "boolean") {
		throw new TypeError("Invalid resetTtl value");
	}
	
	return new LRU(max, ttl, resetTtl);
}
```

## Classes

### Class Structure
- Order class members logically: constructor, public methods, private methods
- Use consistent method ordering across similar classes
- Initialize all properties in constructor

```javascript
export class LRU {
	/**
	 * Constructor with full documentation
	 */
	constructor(max = 0, ttl = 0, resetTtl = false) {
		// Initialize all properties
		this.first = null;
		this.items = Object.create(null);
		this.last = null;
		this.max = max;
		this.resetTtl = resetTtl;
		this.size = 0;
		this.ttl = ttl;
	}

	// Public methods first
	get(key) { /* implementation */ }
	
	set(key, value) { /* implementation */ }
	
	// Private methods last (if any)
	_internalMethod() { /* implementation */ }
}
```

### Property Access
- Use public properties for API surface
- Use private properties (starting with underscore) for internal state
- Avoid getter/setter overhead unless necessary

## Error Handling

### Error Types
- Use built-in error types when appropriate (`TypeError`, `RangeError`, etc.)
- Create custom error classes for domain-specific errors
- Include helpful error messages

```javascript
// ✅ Good
if (typeof key !== 'string') {
	throw new TypeError(`Expected string key, got ${typeof key}`);
}

// ❌ Bad
if (typeof key !== 'string') {
	throw new Error('Bad key');
}
```

### Error Documentation
- Document all errors that functions may throw
- Include error conditions in JSDoc

```javascript
/**
 * @throws {TypeError} When key is not a string.
 * @throws {RangeError} When value exceeds maximum size.
 */
```

## Testing

### Test Organization
- **Unit tests** go in `tests/unit/` using node-assert and mocha
- **Integration tests** go in `tests/integration/` using node-assert and mocha
- Follow the same naming conventions as source files

### Test Structure
- Use descriptive test names that explain the scenario
- Follow Arrange-Act-Assert pattern
- Test both success and failure cases

```javascript
import assert from 'node:assert';
import { describe, it } from 'mocha';
import { LRU } from '../src/lru.js';

describe('LRU Cache', () => {
	it('should return undefined for non-existent keys', () => {
		// Arrange
		const cache = new LRU(10);
		
		// Act
		const result = cache.get('nonexistent');
		
		// Assert
		assert.strictEqual(result, undefined);
	});
	
	it('should throw TypeError for invalid max value', () => {
		// Assert
		assert.throws(() => {
			new LRU(-1);
		}, TypeError, 'Invalid max value');
	});
});
```

## Security

### Input Validation
- Validate all external inputs
- Sanitize data before processing
- Use parameterized queries for database operations

### Memory Safety
- Avoid memory leaks by properly cleaning up references
- Be careful with circular references
- Monitor memory usage in long-running operations

### OWASP Guidelines
- Follow OWASP security guidelines for all code
- Avoid common vulnerabilities (injection, XSS, etc.)
- Use secure coding practices

## Performance

### Algorithmic Efficiency
- Choose appropriate data structures for the use case
- Consider time and space complexity
- Profile code to identify bottlenecks

### Memory Management
- Reuse objects when possible
- Avoid unnecessary object creation in hot paths
- Use `Object.create(null)` for hash maps without prototype pollution

```javascript
// ✅ Good - no prototype pollution
this.items = Object.create(null);

// ❌ Potentially problematic
this.items = {};
```

### Micro-optimizations
- Avoid premature optimization
- Measure before optimizing
- Focus on algorithmic improvements over micro-optimizations

## File Organization

### Project Structure
```
tiny-lru/
├── src/                    # Source code
│   └── lru.js
├── test/                   # Test files
│   ├── unit/              # Unit tests
│   └── integration/       # Integration tests
├── types/                 # TypeScript definitions
├── docs/                  # Documentation
├── benchmarks/            # Performance benchmarks
└── dist/                  # Built files
```

### Import/Export
- Use ES6 modules (`import`/`export`)
- Use named exports for utilities, default exports for main classes
- Group imports logically

```javascript
// ✅ Good - grouped imports
import assert from 'node:assert';
import { describe, it } from 'mocha';

import { LRU, lru } from '../src/lru.js';
import { helper } from './test-utils.js';

// ❌ Bad - mixed import order
import { LRU } from '../src/lru.js';
import assert from 'node:assert';
import { helper } from './test-utils.js';
import { describe, it } from 'mocha';
```

## Conclusion

This style guide ensures consistency and quality across the tiny-lru codebase. When in doubt, refer to existing code patterns and prioritize readability and maintainability over cleverness.

For questions or suggestions about this style guide, please open an issue in the project repository. 