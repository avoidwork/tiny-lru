# AGENTS.md

## Project Overview

`tiny-lru` is a high-performance, lightweight LRU (Least Recently Used) cache library for JavaScript with O(1) operations and optional TTL support.

## Setup Commands

```bash
npm install          # Install dependencies
npm run build        # Lint and build (runs lint then rollup)
npm run rollup       # Build with rollup
npm run test         # Run lint and tests
npm run coverage     # Run tests with coverage reporting
npm run fix          # Fix linting and formatting issues
npm run lint         # Lint code with oxlint
```

## Development Workflow

Source code is in `src/`.

- **lint**: Check and fix linting issues with oxlint
- **fmt**: Format code with oxfmt
- **build**: Lint + rollup build
- **mocha**: Run test suite with coverage reporting

## Project Structure

```
├── src/lru.js          # Main LRU cache implementation
├── tests/              # Test files
├── benchmarks/          # Performance benchmarks
├── dist/               # Built distribution files
├── types/              # TypeScript definitions
├── docs/               # Documentation
├── rollup.config.js    # Build configuration
└── package.json       # Project configuration
```

## Code Style

- Indentation: Tabs
- Quotes: Double quotes
- Semicolons: Required
- Array constructor: Avoid `new Array()` (oxlint will warn)

## Development Principles

- **DRY (Don't Repeat Yourself)**: Extract common logic into reusable functions; avoid duplication
- **YAGNI (You Ain't Gonna Need It)**: Implement only what's needed; avoid over-engineering
- **SOLID**: Follow single responsibility, open/closed, and interface segregation principles
- **OWASP**: Prioritize security; avoid unsafe operations, validate inputs, prevent injection risks

## API Reference

- `lru(max, ttl, resetTtl)` - Factory function to create cache
- `LRU` class - Direct instantiation with `new LRU(max, ttl, resetTtl)`
- Key methods: `get()`, `set()`, `delete()`, `has()`, `clear()`, `evict()`
- Array methods: `keys()`, `values()`, `entries()`
- Properties: `first`, `last`, `max`, `size`, `ttl`, `resetTtl`

## Testing

- Framework: Node.js built-in test runner (`node --test`)
- Coverage: 100% (c8)
- Test pattern: `tests/**/*.js`
- All tests must pass with 100% coverage before merging
- Run: `npm test` (lint + tests)

## Common Issues to Avoid

- **Memory leaks**: When removing items from the linked list, always clear `prev`/`next` pointers to allow garbage collection
- **LRU order pollution**: Methods like `entries()` and `values()` should access items directly rather than calling `get()`, which moves items and can delete expired items mid-iteration
- **TTL edge cases**: Direct property access (`this.items[key]`) should be used instead of `has()` when you need to inspect expired-but-not-yet-deleted items
- **Dead code**: Always verify edge case code is actually reachable before adding special handling
- **Constructor assignment**: Use `let` not `const` for variables that may be reassigned (e.g., in `setWithEvicted`)

## Implementation Notes

- The LRU uses a doubly-linked list with `first` and `last` pointers for O(1) operations
- TTL is stored per-item as an `expiry` timestamp; `0` means no expiration
- `moveToEnd()` is the core method for maintaining LRU order - item is always moved to the `last` position
- `setWithEvicted()` optimizes updates by avoiding the full `set()` path for existing keys
