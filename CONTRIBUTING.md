# Contributing to tiny-lru

Thank you for your interest in contributing to tiny-lru! This document outlines the process for contributing to the project.

## Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct. By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/tiny-lru.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development

### Setup

```bash
npm install
```

### Running Tests

```bash
npm test  # Run lint and tests
npm run mocha  # Run tests with coverage
```

### Code Style

- **Indentation**: Tabs
- **Quotes**: Double quotes
- **Semicolons**: Required
- **Formatting**: Run `npm run fix` before committing

### Linting and Formatting

```bash
npm run lint  # Check linting and formatting
npm run fix   # Fix linting and formatting issues
```

## Making Changes

### Guiding Principles

- **DRY (Don't Repeat Yourself)**: Extract common logic into reusable functions
- **YAGNI (You Ain't Gonna Need It)**: Implement only what's needed
- **SOLID**: Follow single responsibility, open/closed, and interface segregation principles
- **OWASP**: Prioritize security; validate inputs, avoid unsafe operations

### Writing Tests

- All new features must include tests
- Maintain 100% line coverage
- Tests live in `tests/unit/`
- Run `npm run mocha` to verify coverage

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
```
feat: add setWithEvicted method
fix: correct TTL expiration check
docs: update README API reference
```

## Pull Request Process

1. Ensure all tests pass: `npm test`
2. Ensure 100% test coverage: `npm run mocha`
3. Update documentation if needed
4. Squash commits if necessary
5. Submit pull request with clear description

### PR Checklist

- [ ] Tests pass with `npm test`
- [ ] 100% code coverage maintained
- [ ] Linting passes with `npm run lint`
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)

## Releasing

Releases are managed by the maintainers. If you're preparing a release:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release tag

## Questions?

Open an issue for any questions or discussions about contributions.

## License

By contributing, you agree that your contributions will be licensed under the BSD-3-Clause license.
