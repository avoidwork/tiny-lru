# Proposal

## Why

A code-quality audit (issue #547, rule QUAL-003, low severity) found two copy-paste patterns in `src/lru.js` that are a maintenance hazard: the insertion block in `setWithEvicted()` is byte-identical to the one in `set()`, and the "walk the linked list, skip expired, collect" pattern is near-duplicated across `keys()`, `entries()`, `values()`, and `toJSON()`. Keeping multiple copies in sync risks silent divergence that could break LRU ordering or TTL handling. Extracting shared helpers gives each pattern a single source of truth.

## What Changes

- Extract the duplicated post-eviction insertion block into a private helper `#insertItem(key, value)` that creates the item, wires the first/last pointers, sets `this.last`, and returns the item. Both `set()` and `setWithEvicted()` call it after their own eviction handling.
- Extract the shared "walk list, skip expired, collect" traversal into a private helper `#forEachLive(callback)` and rewrite `keys()`, `entries()`, `values()`, and `toJSON()` to use it.
- No public API changes. No behavior changes. No breaking changes.

## Capabilities

### New Capabilities

None. This is a pure internal refactor with no spec-level behavior change.

### Modified Capabilities

None. No requirement changes. The change opts out of specs via `skip_specs: true` in `.openspec.yaml` because behavior is unchanged — specs describe behavior, and nothing observable changes.

## Impact

- **Code:** `src/lru.js` only. Two new private methods (`#insertItem`, `#forEachLive`); call-site updates in `set()`, `setWithEvicted()`, `keys()`, `entries()`, `values()`, `toJSON()`.
- **API:** None. Public surface unchanged.
- **Dependencies:** None.
- **Tests:** Existing 173 tests must continue to pass; 100% line coverage must be maintained. No new tests required (behavior is unchanged), but coverage of the new helpers is exercised transitively by the existing suite.
