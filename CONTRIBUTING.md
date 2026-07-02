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

Publishing to the npm registry is automated via GitHub Actions
([`.github/workflows/publish.yml`](./.github/workflows/publish.yml)).

1. Bump the version and push the tag:

    ```sh
    npm version <patch|minor|major>
    git push --follow-tags
    ```

2. Create a **GitHub Release** for that tag (Releases → Draft a new release).
   Publishing the release triggers the workflow, which lints, type-checks,
   tests, builds and publishes the package (with provenance) automatically.

Authentication uses **npm Trusted Publishing (OIDC)** — there is no long-lived
token to store or rotate; each run mints a short-lived, workflow-scoped
credential. This requires a one-time setup on
[npmjs.com](https://www.npmjs.com): open the package page →
**Settings → Trusted Publishers**, choose GitHub Actions and enter this
repository together with the `publish.yml` workflow filename.

You can still publish manually if needed (`npm publish`); the `prepublishOnly`
hook cleans, lints, type-checks, tests and builds the package first, so only the
compiled `dist/` output ever ships.
