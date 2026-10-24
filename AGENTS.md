# AGENTS.md

Rules and principles for agents working on **this** project.

---

## 1. Core Rules

### 1.0 Document Conventions

When updating this document, append new information or sections. Do NOT delete or overwrite existing content unless explicitly directed. Always ask before making structural changes. When in doubt, keep it.

### 1.1 Forbidden Patterns

The following are **strictly prohibited**:

- Hardcoded secrets, API keys, or credentials.
- `eval()`, `exec()` at any level.
- Star imports (`import * as foo from 'bar'`).
- Mutating a list while iterating over it.
- `new Array()` — use `Array()` or `Array.from()` instead (oxlint will warn).

### 1.2 Security Rules

Follow the [OWASP Top 10](https://owasp.org/www-project-top-10/) for every piece of code written:

- Avoid unsafe operations, validate inputs, prevent injection risks.
- Never store plaintext secrets. Use `process.env` or a settings module loaded from env vars.
- Validate and sanitize all user input.
- All settings defaults must be production-safe.

### 1.3 Git Operations

- **Never rebase under any circumstance without explicit agreement from the user.** Never assume your decision is correct.
- **Never amend a commit.** Use additional commits instead.
- Never force push.
- **Skill execution is implied authorization.** When a skill is executing — standalone or as part of a chained workflow — the skill's own directives constitute the user's authorization for the git operations it performs (staging, committing, pushing, and opening a PR on the branch it created). Do not halt to request explicit agreement for these. The prohibitions above (rebase, amend, force-push) still apply and are never implied by skill execution.

### 1.4 Core Principles

- **DRY (Don't Repeat Yourself)**: Extract common logic into reusable functions; avoid duplication.
- **KISS**: Prefer simple, readable code over clever solutions.
- **YAGNI (You Ain't Gonna Need It)**: Implement only what's needed; avoid over-engineering.
- **No Unneeded Refactoring**: Do not refactor working code for style, naming, or structure unless it directly addresses a bug, improves performance, or is required by the current spec.
- **Single Responsibility**: Each module, class, and function must have one reason to change.
- **Open/Closed**: Extend via composition — not by modifying existing logic.
- **Dependency Inversion**: Depend on abstractions for external services.

---

## 2. Project Context

`tiny-lru` is a high-performance, lightweight LRU (Least Recently Used) cache library for JavaScript with O(1) operations and optional TTL support. It is a pure in-memory cache with no network or I/O surface.

### 2.0 Expected Project Layout

```
├── src/lru.js          # Main LRU cache implementation
├── tests/
│   ├── unit/           # Unit tests (lru.test.js)
│   └── integration/    # Integration tests
├── benchmarks/         # Performance benchmarks
├── dist/               # Built distribution files
│   ├── tiny-lru.js     # ES Modules
│   ├── tiny-lru.cjs    # CommonJS
│   └── tiny-lru.min.js # Minified ESM (repo only, not shipped)
├── types/              # TypeScript definitions (lru.d.ts)
├── docs/               # API.md, CODE_STYLE_GUIDE.md, TECHNICAL_DOCUMENTATION.md
├── .github/            # CI workflow, PR template, dependabot
├── .husky/             # Pre-commit hook
├── rollup.config.js    # Build configuration
├── coverage.txt        # Coverage report output
└── package.json        # Project configuration
```

Misc details: Source lives in `src/lru.js`. The build produces ESM, CommonJS, and minified ESM outputs via Rollup. The minified build (`dist/tiny-lru.min.js`) is available in the repo for local testing but is not shipped via npm.

### 2.1 Quick Commands

| Command           | Purpose                                           |
|-------------------|---------------------------------------------------|
| `npm install`     | Install dependencies                              |
| `npm run build`   | Lint and build (runs lint then rollup)            |
| `npm run rollup`  | Build with rollup                                 |
| `npm run test`    | Run lint and tests                                |
| `npm run coverage`| Run tests with coverage reporting                 |
| `npm run fix`     | Fix linting and formatting issues                 |
| `npm run lint`    | Lint code with oxlint                             |

---

## 3. JavaScript Conventions

### 3.1 Language & Tooling

- **JavaScript**: CommonJS, ESM, and minified ESM outputs via Rollup
- **Package manager**: `npm`
- **Type checking**: TypeScript definitions in `types/lru.d.ts`
- **Formatting**: `oxfmt` (via `npm run fix`)
- **Linting**: `oxlint`
- **Testing**: Node.js built-in test runner (`node --test`)
- **Git hooks**: `pre-commit` via Husky (manages oxfmt, oxlint, tests)

### 3.2 Style

- Indentation: Tabs
- Quotes: Double quotes
- Semicolons: Required
- Array constructor: Avoid `new Array()` (oxlint will warn)
- Use `Object.create(null)` for hash maps to avoid prototype pollution
- Use `===` and `!==` for comparisons
- Every exported function and class method must have JSDoc with `@param` and `@returns`

### 3.3 Error Handling

Not applicable — internal LRU operations should not surface errors; handle gracefully. Constructor validation throws `TypeError` for invalid parameters (negative numbers or wrong types).

### 3.4 Async

Not applicable — the library is synchronous. No async operations or blocking I/O.

### 3.5 Testing

- Framework: Node.js built-in test runner (`node --test`)
- Tests: 173 tests across 27 suites
- Coverage: 100% lines, 99.40% branches, 100% functions
- Test pattern: `tests/**/*.js`
- All tests must pass with 100% line coverage before merging
- Run: `npm test` (lint + tests) or `npm run coverage` for coverage report

---

## 4. API Conventions

### 4.1 API Reference

- `lru(max, ttl, resetTtl)` - Factory function to create cache
- `LRU` class - Direct instantiation with `new LRU(max, ttl, resetTtl)`
- Core methods: `get()`, `set()`, `peek()`, `delete()`, `has()`, `clear()`, `evict()`
- Array methods: `keys()`, `values()`, `entries()`
- Utility methods: `forEach()`, `getMany()`, `hasAll()`, `hasAny()`, `cleanup()`, `toJSON()`, `stats()`, `onEvict()`, `sizeByTTL()`, `keysByTTL()`, `valuesByTTL()`
- Properties: `first`, `last`, `max`, `size`, `ttl`, `resetTtl`
- `peek(key)` - Retrieve value without moving it (no LRU update, no TTL check)

---

## 5. Git Conventions

### 5.1 Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add TTL support to LRU cache
fix: correct LRU eviction order for edge case
docs: update AGENTS.md with new conventions
test: add coverage for keysByTTL method
chore: update rollup configuration
```

### 5.2 Branching

- Main branch is `master`.
- Feature branches: `feat/<short-desc>` or `fix/<short-desc>`.
- Never commit directly to `master`. Always create a feature branch first, then open a PR targeting `master`.

### 5.2.1 Agent Workflow

When auditing or modifying AGENTS.md (or any file):
1. Create a feature branch: `git checkout -b docs/<short-desc>` (or `feat/`, `fix/`).
2. Make changes and commit on the feature branch.
3. Push the feature branch and open a PR with `gh pr create --base master`.
4. Never commit or push directly to `master`.

### 5.3 Code Review

- All changes require at least one other reviewer (automated checks are mandatory but not sufficient).
- No merging without passing CI (lint → test).
- PR descriptions must reference related items from design documents.

### 5.4 Pull Request Templates

If a `.github/PULL_REQUEST_TEMPLATE.md` file exists, it MUST be used when creating PRs. Fill out every section — do not leave any section blank. If a section does not apply, write `N/A` rather than skipping it.

---

## 6. Operational Rules

Session learnings — critical gotchas that affect how code must be written and tested.

### 6.1 Coverage

Tests must maintain **100% line coverage**. Every new function or class needs test coverage. No exceptions.

```bash
npm run coverage
```

Generates `coverage.txt` via `node --test --experimental-test-coverage`.

### 6.2 Pre-commit Hook and coverage.txt

The hook is `.husky/pre-commit`, installed by husky via the `prepare` npm script (`core.hooksPath` = `.husky/_`). Its body is:

```
npm run fix && npm run coverage && git add -A
```

Because the final step is `git add -A`, files the hook regenerates — `coverage.txt`, plus anything `oxlint --fix` or `oxfmt --write` rewrote — are staged automatically, so the commit proceeds and includes them. The commit does **not** fail merely because the hook modified a file.

Do not "fix" a hook-modified file by amending: §1.3 forbids amending outright. If a commit lands with content you did not intend to stage, add a follow-up commit instead.

**Gotcha:** `git add -A` stages the *entire* working tree, not just what you staged before committing. Anything untracked and not gitignored gets swept into the commit. Stage selectively and check `git status` before committing, or expect unrelated files to ride along.

### 6.3 Pre-commit Runs Tests

The hook gates on tests indirectly: `npm run coverage` runs `node --test` across the whole suite, and `set -o pipefail` propagates a test failure through the `grep`/redirect pipeline so the commit fails. Lint failures fail the commit via `npm run fix` (oxlint exits non-zero on errors it cannot auto-fix). A commit can therefore fail on lint errors or test failures.

There is no coverage *threshold* gate — the report is regenerated and committed, but no minimum is enforced. "Maintained coverage" is a review convention, not an automated check.

### 6.4 Unreachable Code

Code that can never execute is a smell. Remove dead code to avoid coverage gaps and confusion. Always verify edge case code is actually reachable before adding special handling.

---

## 7. Session Learnings

Discovery notes about the codebase.

### 7.1 Implementation Notes

- The LRU uses a doubly-linked list with `first` and `last` pointers for O(1) operations
- TTL is stored per-item as an `expiry` timestamp; `0` means no expiration
- `moveToEnd()` is the core method for maintaining LRU order - item is always moved to the `last` position
- `setWithEvicted()` optimizes updates by avoiding the full `set()` path for existing keys
- When removing items from the linked list, always clear `prev`/`next` pointers to allow garbage collection
- Methods like `entries()` and `values()` should access items directly rather than calling `get()`, which moves items and can delete expired items mid-iteration
- Direct property access (`this.items[key]`) should be used instead of `has()` when you need to inspect expired-but-not-yet-deleted items

---

## 8. Checklist Before Marking a TODO Complete

- [ ] All code follows style conventions (tabs, double quotes, semicolons).
- [ ] No forbidden patterns used (`new Array()`, etc.).
- [ ] Unit tests written and passing.
- [ ] 100% line coverage maintained (`npm run coverage`).
- [ ] `npm run lint` passes with no errors.
- [ ] No hardcoded secrets or credentials introduced.
