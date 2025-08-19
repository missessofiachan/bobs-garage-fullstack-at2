```markdown
# Bob's Garage — server

Minimal developer notes for running tests and linters locally.

Prerequisites
- Node.js (16+), pnpm

Install

```bash
pnpm install
```

Run tests

```bash
pnpm --filter ./server test
```

Run typecheck

```bash
pnpm --filter ./server typecheck
```

Lint (requires dev deps for eslint)

```bash
pnpm --filter ./server lint
pnpm --filter ./server lint:fix
```

Notes
- Tests are Vitest + Supertest integration tests. The test runner starts the server in-process and uses an in-memory or test DB depending on env.
- Rate limiter behavior is environment dependent; when writing deterministic rate-limit tests the suite reduces limits during test runs.

```

