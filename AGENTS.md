# AGENTS.md

## Project Overview

`tiny-lru` is a high-performance, lightweight LRU (Least Recently Used) cache library for JavaScript with O(1) operations and optional TTL support.

## Setup Commands

```bash
npm install          # Install dependencies
npm run build        # Lint and build (runs lint then rollup)
npm run rollup       # Build with rollup
npm run test         # Run lint and tests
npm run mocha        # Run tests with coverage (c8)
npm run fmt          # Format code with oxfmt
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

## API Reference

- `lru(max, ttl, resetTtl)` - Factory function to create cache
- `LRU` class - Direct instantiation with `new LRU(max, ttl, resetTtl)`
- Key methods: `get()`, `set()`, `delete()`, `has()`, `clear()`, `evict()`
- Array methods: `keys()`, `values()`, `entries()`
- Properties: `first`, `last`, `max`, `size`, `ttl`, `resetTtl`

## Testing

- Framework: Mocha
- Coverage: 100% (c8)
- Test pattern: `tests/**/*.js`
- All tests must pass with 100% coverage before merging
