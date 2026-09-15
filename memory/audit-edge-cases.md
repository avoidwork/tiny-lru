# tiny-lru Edge Case Audit — Findings

Audited `src/lru.js` (673 lines) and `tests/unit/lru.test.js` (1578 lines). All 149 existing tests pass. The following edge cases are NOT covered by the test suite and represent real behavioral inconsistencies. All findings reproduced with `node` probes against `src/lru.js`.

## Findings

| # | Severity | Area | Description | Evidence |
|---|----------|------|-------------|----------|
| 1 | High | `lru()` factory validation | `lru("10")`, `lru(true)`, `lru(2.5)`, `lru(Infinity)`, `lru(null)`, `lru(false)`, `lru("")` all pass validation but silently disable eviction. `this.size === this.max` uses strict equality, so a non-integer max never evicts. | `lru("10")` → size 15 after 15 sets. `lru(2.5)` → size 5 after 5 sets. `lru(Infinity)` → size 5 after 5 sets. `lru("")` accepted (`isNaN("")` is false). |
| 2 | High | `set()` on expired key | With `resetTTL=false`, `set()` on an expired key leaves the item dead but occupying a slot. `has()` false, `get()` undefined, but `size` unchanged. With `resetTTL=true` it resurrects correctly — inconsistent. | `set("k","v")`, wait 80ms, `set("k","v2")` → `has(k)=false`, `get(k)=undefined`, `size=1`. |
| 3 | High | TTL semantics across read methods | `values()`, `entries()`, `forEach()`, `toJSON()` return expired items, while `get()`/`has()` treat them as gone. Inconsistent TTL enforcement. | Expired item: `values()=["v"]`, `entries()=[["k","v"]]`, `forEach` sees it, `toJSON` includes it. `get(k)=undefined`. |
| 4 | High | `forEach()` mutation truncates iteration | Deleting the current item during `forEach()` truncates the loop — subsequent items are never visited. | `forEach((v,k)=>{seen.push(k); c.delete(k);})` on 4 items → `seen=["a"]` (only first visited). |
| 5 | Medium | `get()` stats side effect | `get()` on an expired item increments BOTH `deletes` and `misses`. A read miss triggers a delete. | After expired `get(k)`: `stats={hits:0, misses:1, sets:1, deletes:1}`. |
| 6 | Medium | `cleanup()` vs `evict()` onEvict | `cleanup()` removes expired items but does NOT fire `onEvict`; `evict()` does. Inconsistent eviction notification. | Test confirms `onEvict` not called during `cleanup()`. |
| 7 | Medium | `setWithEvicted()` on expired key at max | On an expired key at max capacity, `setWithEvicted()` returns `null` evicted and leaves a dead item in place — the expired item is never reclaimed. | `set("a",1)` at max=1, wait, `setWithEvicted("a",2)` → `evicted=null`, `get(a)=undefined`. |
| 8 | Medium | Batch method side effects | `getMany()` deletes expired items (size drops to 0), but `hasAll()`/`hasAny()` do not (size unchanged). Inconsistent. | `getMany(["a","b"])` on expired → `{}`, `size=0`. `hasAll` → false, `size=2`. |
| 9 | Medium | Key coercion collisions | `set(1)` and `set("1")` collide to the same slot. Same for `set(true)`/`set("true")` and `set(-0)`/`set(0)`. Object keys coerce to `"[object Object]"`. | `set(1,"n"); set("1","s")` → `size=1`, `get(1)="s"`. `set(true)`/`set("true")` → `size=2`, `get(true)="S"`. |
| 10 | Medium | `values(null)` / `entries(null)` crash | Passing `null` as the keys argument throws `TypeError: Cannot read properties of null (reading 'length')`. | `values(null)` → `TypeError`. `entries(null)` → `TypeError`. |
| 11 | Medium | Batch methods crash on null/undefined | `getMany(null)`, `hasAll(null)`, `hasAny(undefined)` throw `TypeError: Cannot read properties of null/undefined (reading 'length')`. | `getMany(null)` → `TypeError`. `hasAny(undefined)` → `TypeError`. |
| 12 | Low | Constructor validation | `new LRU(-1)` works and behaves as unlimited. Constructor does not validate params (documented, but class is public API). | `new LRU(-1)` → size 2 after 2 sets, no eviction. |
| 13 | Low | `sizeByTTL`/`keysByTTL`/`valuesByTTL` noTTL semantics | Items with `expiry=0` are counted as `noTTL` even when `ttl>0`. | With `ttl=100`, item with `expiry=0` → `sizeByTTL={valid:1, expired:0, noTTL:1}`. |
| 14 | Low | `peek()` on expired item | `peek()` returns expired value (documented as no TTL check). By design, but inconsistent with `get()`. | Expired item: `peek(k)="v"`. |
| 15 | Low | `clear()`/`delete()` don't fire `onEvict` | Only `evict()` fires `onEvict`. Deleting or clearing items silently skips the callback. | `onEvict` fired for `[]` after delete+clear; only `evict()` triggered it. |
| 16 | Low | `setWithEvicted()` double-notification | Returns the evicted item AND fires `onEvict` for the same eviction — caller gets it twice. | `setWithEvicted("c",3)` at max → returned `{key:"a",...}` AND `onEvict` fired once. |
| 17 | Low | String keys argument treated as char list | `values("abc")`/`entries("abc")` iterate the string as single-char keys. | `values("abc")` → `[1,2,3]` for keys a,b,c. |
| 18 | Low | Non-array input silently ignored | `getMany(5)` returns `{}` silently instead of throwing or validating. | `getMany(5)` → `{}`. |

## Reproduction

All findings reproduced with `node` probes against `src/lru.js`. See evidence column per finding.

## Root Cause Analysis

- **Finding 1**: `lru()` factory uses `isNaN(max)` which returns false for numeric-coercible strings (`"10"`), booleans (`true`), floats (`2.5`), `Infinity`, `null`, and `false`. The eviction guard `this.size === this.max` then never triggers for non-integer values.
- **Findings 2, 3, 7**: `set()` and `setWithEvicted()` check `item !== undefined` to decide update-vs-insert, but never check `#isExpired(item)`. An expired item is treated as a live update, so its stale expiry is preserved.
- **Finding 4**: `forEach()` iterates the linked list by following `x.next`. Deleting the current item nullifies its `next` pointer, so the loop terminates early.
- **Findings 5, 6, 8**: `get()` deletes expired items (incrementing `deletes`), while `cleanup()` and the batch `has*` methods do not — inconsistent TTL enforcement paths.
- **Finding 9**: `items` is a plain object keyed by `key`, so JS coerces all keys to strings. `1` and `"1"`, `true` and `"true"`, `-0` and `0` all collide.
- **Findings 10, 11**: `values()`/`entries()`/`getMany()`/`hasAll()`/`hasAny()` assume `keys` is an array and access `.length` without validation.

## Testing Strategy

- **Unit tests**: Add tests for each finding — factory validation with string/boolean/float/Infinity/null max, `set()` on expired key with both `resetTTL` values, read-method TTL enforcement, `forEach()` mutation, `get()` stats on expired, `cleanup()` onEvict, `setWithEvicted()` on expired at max, batch method side effects, key coercion, null/undefined keys argument, string keys argument.
- **Edge cases**: Expired key at max capacity, `expiry=0` with `ttl>0`, negative constructor max, `lru("")`, symbol keys, `__proto__` key, `values(null)`.

## Security Considerations

- No credential or input-handling concerns. This is a cache correctness issue. The main risk is stale data being served via `values()`/`entries()`/`forEach()`/`toJSON()` after TTL expiry. The `__proto__` key is handled safely (null-prototype `items` prevents prototype pollution — verified `Object.prototype.polluted` is undefined).

## Fix Steps

1. **Validate factory inputs** — In `lru()`, replace `isNaN(max)` with `!Number.isInteger(max) || max < 0`. Apply the same to `ttl`.
2. **Handle expired keys in `set()`/`setWithEvicted()`** — In the update branch, check `#isExpired(item)` first. If expired, treat as a fresh insert (reclaim the slot) rather than an update.
3. **Enforce TTL in read methods** — Make `values()`, `entries()`, `forEach()`, `toJSON()` skip expired items, consistent with `get()`/`has()`.
4. **Make `forEach()` mutation-safe** — Capture the next pointer before invoking the callback so deleting the current item doesn't truncate iteration.
5. **Fix `get()` stats** — Do not increment `deletes` when `get()` removes an expired item on a miss.
6. **Fire `onEvict` in `cleanup()`** — Call `#onEvict` for each expired item removed, consistent with `evict()`.
7. **Validate keys arguments** — Guard `values()`, `entries()`, `getMany()`, `hasAll()`, `hasAny()` against null/undefined/non-array input.
8. **Add tests** — Add unit tests covering all 18 findings in `tests/unit/lru.test.js`.
9. **Verify** — Run `npm run test` and `npm run coverage` to confirm 100% line coverage and no regressions.
