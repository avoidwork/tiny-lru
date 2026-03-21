# Technical Documentation

Architecture and implementation details for tiny-lru.

## Architecture

The LRU cache combines a doubly-linked list with a hash map for O(1) operations.

```
LRU Cache
├── items: HashMap (Object.create(null))  → O(1) key lookup
├── first: Node (least recently used)
├── last: Node (most recently used)
└── Linked list via prev/next pointers
```

### Node Structure

```javascript
{
  key: string,
  value: *,
  expiry: number,    // timestamp or 0
  prev: Node | null,
  next: Node | null
}
```

## Data Structures

```javascript
export class LRU {
  constructor(max = 0, ttl = 0, resetTtl = false) {
    this.first = null;           // Least recently used
    this.items = Object.create(null);  // Hash map
    this.last = null;            // Most recently used
    this.max = max;              // 0 = unlimited
    this.resetTtl = resetTtl;   // Reset TTL on set()
    this.size = 0;               // Current count
    this.ttl = ttl;              // Milliseconds, 0 = no expiry
  }
}
```

## Time Complexity

| Operation | Time | Notes |
|-----------|------|-------|
| `get` | O(1) | Checks TTL, moves to end |
| `set` | O(1) | Evicts if full |
| `setWithEvicted` | O(1) | Returns evicted item |
| `delete` | O(1) | Removes from list |
| `has` | O(1) | Checks TTL |
| `evict` | O(1) | Removes first |
| `clear` | O(1) | Resets pointers |
| `keys/values/entries` | O(n) | Iterates list |
| `expiresAt` | O(1) | Direct lookup |

## TTL Behavior

### Expiration

Items expire when `Date.now() >= item.expiry`. Expired items are cleaned up on `get()` and `has()`.

```javascript
// TTL check in get()
if (this.ttl > 0 && item.expiry <= Date.now()) {
  this.delete(key);
  return undefined;
}
```

### TTL Reset

TTL only resets during `set()` when both conditions are true:
- `resetTtl = true` (constructor or method parameter)
- `bypass = false` (internal, not exposed)

```javascript
// In set()
if (bypass === false && resetTtl) {
  item.expiry = this.ttl > 0 ? Date.now() + this.ttl : this.ttl;
}
```

Important: `get()` never resets TTL, and `setWithEvicted()` always passes `bypass=true`, so TTL is never reset during `setWithEvicted()`.

## Core Operations

### get(key)

```javascript
get(key) {
  const item = this.items[key];
  
  if (item !== undefined) {
    if (this.ttl > 0 && item.expiry <= Date.now()) {
      this.delete(key);
      return undefined;
    }
    this.moveToEnd(item);
    return item.value;
  }
  
  return undefined;
}
```

### set(key, value, bypass, resetTtl)

```javascript
set(key, value, bypass = false, resetTtl = this.resetTtl) {
  let item = this.items[key];
  
  if (bypass || item !== undefined) {
    item.value = value;
    if (bypass === false && resetTtl) {
      item.expiry = this.ttl > 0 ? Date.now() + this.ttl : this.ttl;
    }
    this.moveToEnd(item);
  } else {
    if (this.max > 0 && this.size === this.max) {
      this.evict(true);
    }
    item = this.items[key] = {
      expiry: this.ttl > 0 ? Date.now() + this.ttl : this.ttl,
      key,
      prev: this.last,
      next: null,
      value
    };
    if (++this.size === 1) {
      this.first = item;
    } else {
      this.last.next = item;
    }
    this.last = item;
  }
  
  return this;
}
```

### moveToEnd(item)

```javascript
moveToEnd(item) {
  if (this.last === item) return;
  
  if (item.prev !== null) item.prev.next = item.next;
  if (item.next !== null) item.next.prev = item.prev;
  if (this.first === item) this.first = item.next;
  
  item.prev = this.last;
  item.next = null;
  if (this.last !== null) this.last.next = item;
  this.last = item;
  if (this.first === null) this.first = item;
}
```

## Mathematical Specification

### Set Operation

```
set(k, v) →
  if k ∈ H: update value, optionally reset TTL, moveToEnd
  else: evict if full, create node at end
```

### Get Operation

```
get(k) →
  if k ∉ H: undefined
  else if expired: delete(k), undefined
  else: moveToEnd, return value
```

### Eviction Policy

```
evict() →
  if size > 0:
    delete first.key from H
    first = first.next
    if size becomes 0: last = null
    else: first.prev = null
```

## Evicted Item Shape

`setWithEvicted()` returns:

```javascript
{
  key: string,
  value: *,
  expiry: number
}
```

Not the full node with `prev`/`next` pointers.

## Space Complexity

- O(n) where n = min(size, max)
- Each item: key + value + expiry + 2 pointers
- Hash map overhead for object

## Invariants

1. `first === null` iff `last === null` iff `size === 0`
2. `|items| === size`
3. List traversal from `first` reaches `last` in O(n)
4. `has()` returns false for expired items
5. `get()` cleans up expired items

## File Structure

```
tiny-lru/
├── src/lru.js           # Implementation (~500 lines)
├── types/lru.d.ts       # TypeScript definitions
├── tests/unit/lru.js    # Node test runner tests
├── docs/
│   ├── API.md           # API reference
│   ├── CODE_STYLE_GUIDE.md
│   └── TECHNICAL_DOCUMENTATION.md
├── dist/                # Built files
├── benchmarks/          # Performance tests
└── package.json
```

## Testing

```bash
npm test          # Run lint and tests
node --test tests/**/*.js   # Run tests only
```

Tests use Node's native test runner (`node:test`) with `node:assert`.
