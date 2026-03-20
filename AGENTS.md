# AGENTS.md

## Setup Commands

```bash
npm install          # Install dependencies
npm run build       # Lint and build (runs lint then rollup)
npm run rollup      # Build with rollup
npm run test        # Run lint and tests
npm run mocha       # Run tests with coverage (c8)
npm run fmt         # Format code with oxfmt
npm run lint        # Lint code with oxlint
```

## Development Workflow

Source code is in `src/`.

- **lint**: Check and fix linting issues with oxlint
- **fmt**: Format code with oxfmt
- **build**: Lint + rollup build
- **mocha**: Run test suite with coverage reporting
