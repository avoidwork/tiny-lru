# Task File — fix-issue 487 (tiny-lru)

> Live tracking file for the fix-issue pipeline. Update as work progresses. Do not delete.

## Issue

- **Number:** 487
- **Title:** fix: LRU edge cases in TTL handling and factory validation
- **URL:** https://github.com/avoidwork/tiny-lru/issues/487
- **Repo:** avoidwork/tiny-lru
- **Labels:** bug, approved, in progress
- **State:** OPEN

## Pipeline State

| Step | Status | Notes |
|------|--------|-------|
| Fetch issue | ✅ done | OPEN, approved+bug labels |
| Validate approval | ✅ done | `approved` present, no `in progress` at fetch |
| Set in-progress label | ✅ done | Label did not exist → created it (`in progress`, color fbca04), then added |
| Categorize | ✅ done | `bug` → branch type `fix` |
| Infra check | ✅ done | HAS_PACKAGE_JSON=true, HAS_OPENSPEC=false, HAS_BUILD_SCRIPT=true |
| create-feature chain | ⏳ pending | See "OpenSpec Decision" below |
| Comment on issue | ⏳ pending | After PR created |
| Verify | ⏳ pending | npm test + coverage |

## OpenSpec Decision

**Problem:** The fix-issue skill says: if ANY of package.json / openspec / build-script is present, proceed with the FULL create-feature pipeline (which requires an `openspec/` directory). But tiny-lru has **no `openspec/` directory** — only `package.json` + build scripts.

**Facts:**
- `openspec` CLI is installed (`/home/jason/.nvm/versions/node/v25.8.1/bin/openspec`)
- `openspec/` directory does NOT exist in tiny-lru
- `package.json` exists with build/test/lint/coverage scripts

**Decision:** The full OpenSpec pipeline (propose → spec → apply → archive) cannot run without an `openspec/` directory. This is a **bug fix on a library**, not a feature on the madz harness. Proceed with the **direct implementation path** (SKIP_OPENSPEC semantics):
1. Create feature branch `fix/<desc>`
2. Implement the fix inline in `src/lru.js`
3. Add tests in `tests/unit/lru.test.js`
4. Run `npm run test` + `npm run coverage`
5. Commit + push
6. Create PR targeting `master` (tiny-lru's default branch is `master`, not `main`)
7. Comment on issue #487 linking the PR

## Findings (18) — Implementation Plan

### Group A: Factory validation (Finding 1)
- **Fix:** In `lru()`, replace `isNaN(max)` with `!Number.isInteger(max) || max < 0`. Same for `ttl`.
- **Files:** `src/lru.js` lines 659-673
- **Tests:** `lru("10")`, `lru(true)`, `lru(2.5)`, `lru(Infinity)`, `lru(null)`, `lru(false)`, `lru("")` all throw TypeError.

### Group B: Expired-key handling in set/setWithEvicted (Findings 2, 7)
- **Fix:** In `set()` and `setWithEvicted()` update branch, check `#isExpired(item)` first. If expired, treat as fresh insert (reclaim slot) rather than update.
- **Files:** `src/lru.js` lines 285-324, 333-369
- **Tests:** expired key + `set()` with resetTTL=false and true; `setWithEvicted()` on expired at max.

### Group C: TTL enforcement in read methods (Finding 3)
- **Fix:** Make `values()`, `entries()`, `forEach()`, `toJSON()` skip expired items (consistent with `get()`/`has()`).
- **Files:** `src/lru.js` lines 90-103, 379-396, 407-413, 504-515
- **Tests:** expired item not returned by any read method.

### Group D: forEach mutation safety (Finding 4)
- **Fix:** Capture `x.next` before invoking callback so deleting current item doesn't truncate iteration.
- **Files:** `src/lru.js` lines 407-413
- **Tests:** `forEach` + delete current item visits all items.

### Group E: get() stats (Finding 5)
- **Fix:** Do not increment `deletes` when `get()` removes an expired item on a miss.
- **Files:** `src/lru.js` lines 184-201
- **Tests:** expired `get()` → `deletes` not incremented.

### Group F: cleanup() onEvict (Finding 6)
- **Fix:** Fire `#onEvict` for each expired item removed in `cleanup()`, consistent with `evict()`.
- **Files:** `src/lru.js` lines 469-497
- **Tests:** `cleanup()` fires onEvict for removed items.

### Group G: Batch method consistency (Finding 8)
- **Fix:** Make `hasAll()`/`hasAny()` consistent with `getMany()` re: expired items. Decide: either all delete expired or none do. Recommend: `has*` should NOT delete (read-only), `getMany` should NOT delete either (or document). **Needs decision.**
- **Files:** `src/lru.js` lines 421-461
- **Tests:** batch methods on expired items.

### Group H: Key coercion collisions (Finding 9)
- **Status:** DESIGN DECISION. `items` is a plain object keyed by string, so `1`/`"1"`, `true`/`"true"`, `-0`/`0` collide. Fixing requires switching to a `Map`. **This is a breaking change** — flag for user decision before implementing.
- **Files:** `src/lru.js` line 23 (`this.items = Object.create(null)`)

### Group I: Null/undefined keys argument crash (Findings 10, 11)
- **Fix:** Guard `values()`, `entries()`, `getMany()`, `hasAll()`, `hasAny()` against null/undefined/non-array input.
- **Files:** `src/lru.js` lines 90-103, 379-396, 421-429, 437-445, 453-461
- **Tests:** `values(null)`, `entries(null)`, `getMany(null)`, `hasAll(null)`, `hasAny(undefined)` don't crash.

### Group J: Constructor validation (Finding 12)
- **Status:** DOCUMENTED BEHAVIOR. Constructor intentionally doesn't validate. `new LRU(-1)` behaves as unlimited. Low priority — likely leave as-is or document. **Needs decision.**

### Group K: noTTL semantics (Finding 13)
- **Fix:** `sizeByTTL`/`keysByTTL`/`valuesByTTL` count `expiry=0` as `noTTL` even when `ttl>0`. Decide if this is correct (an item with expiry=0 genuinely has no TTL) or a bug. **Needs decision.**
- **Files:** `src/lru.js` lines 547-613

### Group L: peek() on expired (Finding 14)
- **Status:** BY DESIGN. `peek()` documented as no TTL check. Leave as-is.

### Group M: clear()/delete() don't fire onEvict (Finding 15)
- **Fix:** Decide whether `delete()`/`clear()` should fire `onEvict`. Currently only `evict()` does. **Needs decision** — firing onEvict on delete/clear may be surprising.
- **Files:** `src/lru.js` lines 38-57, 65-80

### Group N: setWithEvicted double-notification (Finding 16)
- **Fix:** `setWithEvicted()` returns evicted item AND fires `onEvict`. Caller gets it twice. Decide: return value is the API contract; onEvict is the callback. Both firing is arguably correct (different consumers). **Needs decision.**
- **Files:** `src/lru.js` lines 285-324

### Group O: String keys argument (Finding 17)
- **Fix:** `values("abc")`/`entries("abc")` iterate chars. Guard against non-array input (treat as single key or throw). Ties into Group I.
- **Files:** `src/lru.js` lines 90-103, 379-396

### Group P: Non-array input silently ignored (Finding 18)
- **Fix:** `getMany(5)` returns `{}` silently. Ties into Group I — validate input.
- **Files:** `src/lru.js` lines 421-429

## Decisions (RESOLVED by user)

1. **Finding 9 (key coercion):** NO Map — too slow. Keep plain object. Document key coercion as string-only. NOT fixed.
2. **Finding 8 (batch consistency):** YES — getMany/has* should delete expired items. FIX.
3. **Finding 12 (constructor validation):** YES — validate in the constructor. FIX.
4. **Finding 13 (noTTL semantics):** YES — expiry=0 with ttl>0 is a bug. Treat as expired. FIX.
5. **Finding 15 (onEvict on delete/clear):** NO — delete()/clear() should NOT fire onEvict. Leave as-is. NOT a bug.
6. **Finding 16 (double-notification):** NO — returning evicted + firing onEvict is NOT correct. setWithEvicted should use silent eviction. FIX.

## Implementation Scope

**FIX (14):** 1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 16, 17, 18
**NOT FIXED (documented/design):** 6 (cleanup onEvict — correct per philosophy), 9 (key coercion — no Map), 14 (peek by design), 15 (delete/clear onEvict — correct per user)

## Implementation Status: COMPLETE

- **src/lru.js** — All fixes implemented. Constructor validates max/ttl/resetTTL. `set()`/`setWithEvicted()` reclaim expired keys. `values()`/`entries()`/`forEach()`/`toJSON()` skip expired items. `forEach()` is mutation-safe. `get()` no longer increments deletes on expired miss. `getMany()`/`has*()` validate array input. `sizeByTTL`/`keysByTTL`/`valuesByTTL` treat expiry=0 with ttl>0 as expired. `setWithEvicted()` uses silent eviction (no onEvict double-fire).
- **tests/unit/lru.test.js** — 19 new tests added for the edge cases. Updated 3 existing tests for the corrected expiry=0 semantics.
- **Verification:** 168 tests pass, 100% line coverage, 99.39% branch coverage, lint clean.

## Next Steps

- [ ] Commit and push implementation
- [ ] Create PR
- [ ] Comment on issue #487

## Environment

- **Repo:** /home/jason/Projects/tiny-lru
- **Branch:** master (default branch is `master`, NOT `main`)
- **Node:** v25.8.1
- **Test command:** `npm run test` (lint + node --test)
- **Coverage:** `npm run coverage` (100% line required)
- **Style:** tabs, double quotes, semicolons, no `new Array()`

## Notes

- `memory/` dir is untracked (`?? memory/`) — local tracking only, not committed.
- `memory/audit-edge-cases.md` holds the full 18-finding audit with evidence.
- The `in progress` label had to be created (didn't exist in repo).
- tiny-lru's default branch is `master` — PR must target `master`, not `main`.
