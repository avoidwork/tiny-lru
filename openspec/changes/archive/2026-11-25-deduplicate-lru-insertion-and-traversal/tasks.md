# Tasks

## 1. Shared insertion helper

- [ ] 1.1 Add private method `#insertItem(key, value)` to `src/lru.js` that creates the item (`this.items[key] = { expiry, key, prev: this.last, next: null, value }`), wires first/last (`if (++this.size === 1) this.first = item; else this.last.next = item;`), sets `this.last = item`, and returns `item`. Verify by reading the new method and confirming it matches the original insertion block byte-for-byte.
- [ ] 1.2 Replace the inline insertion block in `setWithEvicted()` with a call to `#insertItem(key, value)` (after the `#evictItem()` eviction handling). Verify `npm run test` passes.
- [ ] 1.3 Replace the inline insertion block in `set()` with a call to `#insertItem(key, value)` (after the `this.evict()` eviction handling). Verify `npm run test` passes.

## 2. Shared traversal helper

- [ ] 2.1 Add private method `#forEachLive(callback)` to `src/lru.js` that walks `for (let x = this.first; x !== null; x = x.next)`, skips expired items via `#isExpired(x)`, and invokes `callback(x)` per live item. Verify by reading the new method.
- [ ] 2.2 Rewrite `keys()`, `entries()`, `values()`, and `toJSON()` to use `#forEachLive` for the no-`keys`-argument traversal branch. Verify `npm run test` passes and output is unchanged.

## 3. Verification

- [ ] 3.1 Run `npm run lint` and confirm no errors.
- [ ] 3.2 Run `npm run coverage` and confirm 100% line coverage is maintained.
- [ ] 3.3 Run `npm run test` and confirm all 173 tests pass.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
