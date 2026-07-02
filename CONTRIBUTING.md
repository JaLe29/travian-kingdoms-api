# Contributing

## Development

```sh
npm install            # install dependencies
npm run build          # bundle ESM + CJS + type declarations
npm run dev            # rebuild on change
npm test               # run the test suite in watch mode
npm run test:run       # run the test suite once
npm run test:coverage  # run tests with a coverage report
npm run lint           # lint the source
npm run lint:fix       # lint and auto-fix
npm run format         # format with Prettier
npm run typecheck      # type-check without emitting
```

Please make sure `npm run lint`, `npm run typecheck` and `npm run test:run`
all pass before opening a pull request. CI runs the same checks on Node 18, 20
and 22.

## Releasing

Releases are cut entirely from GitHub Actions
([`.github/workflows/release.yml`](./.github/workflows/release.yml)) — there is
**no local `npm version` step**.

1. Go to the repository's **Actions** tab → **Release** → **Run workflow**.
2. Pick the bump level (`patch`, `minor` or `major`) and run it.

The workflow then verifies (lint, type-check, test) and builds the package,
bumps the version and creates the git tag, pushes the commit and tag back to
the branch, publishes to npm, and opens a **GitHub Release** with
auto-generated notes.

Authentication uses **npm Trusted Publishing (OIDC)** — there is no long-lived
token to store or rotate; each run mints a short-lived, workflow-scoped
credential. This requires a one-time setup on
[npmjs.com](https://www.npmjs.com): open the package page →
**Settings → Trusted Publishers**, choose GitHub Actions and enter this
repository together with the `release.yml` workflow filename.

> **Note:** the workflow pushes the version commit directly to the branch. If
> the default branch is protected, allow `github-actions[bot]` to bypass the
> restriction (or relax the rule) so the push succeeds.

You can still publish manually if needed (`npm publish`); the `prepublishOnly`
hook cleans, lints, type-checks, tests and builds the package first, so only the
compiled `dist/` output ever ships.
