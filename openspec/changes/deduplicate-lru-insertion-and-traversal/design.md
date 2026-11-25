# Design

## Context

`src/lru.js` implements the `LRU` class as a doubly-linked list (`first`/`last` pointers) plus an `items` hash map (`Object.create(null)`). Two patterns are duplicated (see proposal.md - Why):

1. **Insertion block** — byte-identical in `setWithEvicted()` (lines 362-376) and `set()` (lines 410-424): create the item, wire first/last, set `this.last`.
2. **Traversal-and-skip-expired** — near-identical in `keys()`, `entries()`, `values()`, `toJSON()`: walk `first`→`last`, skip expired via `#isExpired`, collect.

Constraints (AGENTS.md §3.2, §6.1, §7.1): tabs/double-quotes/semicolons; 100% line coverage; O(1) get/set/delete; traversal must access items directly (never call `get()`, which moves items and deletes expired entries mid-iteration).

## Goals / Non-Goals

**Goals:**
- Single source of truth for the insertion block via `#insertItem(key, value)`.
- Single source of truth for the live-item traversal via `#forEachLive(callback)`.
- Byte-for-byte behavioral equivalence; 100% line coverage preserved.

**Non-Goals:**
- No change to the update-existing-key branch (already near-identical, not the flagged duplication).
- No change to the `keys`-array overloads of `entries()`/`values()`.
- No change to `forEach()`, `cleanup()`, `sizeByTTL()`, `keysByTTL()`, `valuesByTTL()` — distinct semantics.
- No public API change.

## Decisions

### D1: `#insertItem(key, value)` returns the created item

The helper performs the full insertion: `item = this.items[key] = { expiry, key, prev: this.last, next: null, value }`, then `if (++this.size === 1) this.first = item; else this.last.next = item;`, then `this.last = item;`, and returns `item`.

- **Why return the item?** Both callers already assign the result to a local `item` and the surrounding code is identical; returning keeps the call sites a one-liner and preserves the exact `prev: this.last` capture-before-reassignment ordering.
- **Eviction stays in the caller.** `set()` calls `this.evict()` (fires onEvict); `setWithEvicted()` calls `this.#evictItem()` and captures the evicted item for its return value. Only the post-eviction insertion is shared. This preserves the divergent eviction semantics while removing the duplicated block.
- **Alternative considered:** a single `#setInternal(key, value, { silent })` that also handles eviction. Rejected — it would couple the two eviction paths and risk changing onEvict firing behavior; the flagged duplication is only the insertion block.

### D2: `#forEachLive(callback)` for traversal

A private helper that walks `for (let x = this.first; x !== null; x = x.next)`, skips expired items via `#isExpired(x)`, and invokes `callback(item)` per live item. `keys()`, `entries()`, `values()`, `toJSON()` each call it with a collector callback.

- **Why a callback rather than a returned array?** The four methods collect different shapes (`x.key`, `[x.key, x.value]`, `x.value`, `{key,value,expiry}`). A callback keeps the traversal logic shared while letting each caller decide what to collect.
- **Why not a generator?** A generator would add allocation/iteration overhead to the hot path; a plain callback loop preserves the current O(1)-amortized, allocation-light traversal.
- **Direct item access (AGENTS.md §7.1):** the helper reads `x.key`/`x.value`/`x.expiry` directly and uses `#isExpired` — it never calls `get()`, so LRU order is not mutated and expired items are not deleted mid-iteration.
- **Alternative considered:** a shared `#collectLive(selector)` returning an array. Rejected — `toJSON()` builds objects and `entries()` builds pairs; a selector callback is the minimal shared surface.

### D3: Helper placement

Place `#insertItem` and `#forEachLive` adjacent to the related private helpers (`#unlink`, `#removeItem`, `#evictItem`) to keep private infrastructure grouped.

## Risks / Trade-offs

- [Ordering bug in `#insertItem`] → The `prev: this.last` capture and `++this.size === 1` first-wiring must execute in the exact original order; verified by the full 173-test suite and 100% coverage.
- [Coverage gap on new helpers] → Both helpers are exercised transitively by every existing set/keys/entries/values/toJSON test, so 100% line coverage is maintained without new tests.
- [Behavior drift] → Pure refactor; no observable change. The existing suite is the regression guard.
- [Callback allocation in `#forEachLive`] → Negligible; the callback is a small closure per call, matching the current per-method allocation profile.

## Migration Plan

Single-file change to `src/lru.js`. No migration, no data changes, no deploy steps. Rollback is a `git revert` of the commit.

## Open Questions

None.
