# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0]

### Changed

- **Complete rewrite in modern TypeScript.** The library now ships with full
  type definitions and rich JSDoc.
- **Promise-based API.** All functions (`register`, `updateSiteData`,
  `getMapData`) now return promises and are used with `async`/`await`. This
  replaces the previous callback signature `(error, response, body) => {}`.
- **Native `fetch`.** The runtime dependency on `request` has been removed;
  the library now uses the built-in global `fetch` and has **zero runtime
  dependencies**.
- Query parameters are now correctly URL-encoded, fixing corruption for values
  containing characters such as `&`, `=` or spaces.
- The `isPublic` option is now a real `boolean` instead of a string.

### Added

- `TravianKingdomsClient` class that binds a game world `url` (and optionally a
  `privateApiKey`) so you don't repeat them on every call.
- `TravianApiError`, thrown on non-successful HTTP responses, exposing
  `status`, `statusText`, the redacted `url` and the parsed `body`.
- Per-call `RequestOptions` supporting `AbortSignal` cancellation and a custom
  `fetch` implementation.
- Dual ESM + CommonJS package output with type declarations for each.
- Test suite (Vitest), linting (ESLint), formatting (Prettier) and build
  tooling (tsup).

### Removed

- The callback-based API and the `request` dependency.

## [1.0.2]

- Legacy callback-based release. See the git history for details.
