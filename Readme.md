# Travian Kingdoms API

[![npm version](https://badge.fury.io/js/travian-kingdoms-api.svg)](https://badge.fury.io/js/travian-kingdoms-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Modern, fully-typed JavaScript/TypeScript client for the **Travian Kingdoms public API endpoints**.

- 🟦 **TypeScript-first** — ships with complete type definitions and rich JSDoc.
- ⚡ **Promise based** — every call works with `async`/`await`.
- 🪶 **Zero runtime dependencies** — built on the native `fetch` API.
- 📦 **Dual package** — usable from both ESM (`import`) and CommonJS (`require`).

## What is a public endpoint?

Public endpoints are the external-tools endpoints published by Travian Kingdoms
so that third-party tools can read game world data.

## Requirements

- **Node.js >= 18** (for the built-in global `fetch`). On older runtimes you can
  pass your own `fetch` implementation via the per-call `request.fetch` option.

## Installation

```sh
npm install travian-kingdoms-api
```

## Quick start

```ts
import { register, getMapData } from 'travian-kingdoms-api';

// 1. Register your tool to obtain the API keys.
const { response: keys } = await register({
	url: 'https://cz4.kingdoms.com',
	email: 'me@example.com',
	siteName: 'My Tool',
	siteUrl: 'https://tool.example',
	isPublic: true,
});

// 2. Use the private key to fetch data.
const { response: map } = await getMapData({
	url: 'https://cz4.kingdoms.com',
	privateApiKey: keys.privateApiKey,
});

console.log(map.gameworld.name, map.players.length);
```

CommonJS is fully supported too:

```js
const { register } = require('travian-kingdoms-api');
```

## Migrating from v1

Version 2 is a complete rewrite. The old **callback-based** API
(`tka.register(options, (err, response, body) => { ... })`) has been replaced by
a **Promise-based** API that you `await`. The response is the parsed body
directly, and failed HTTP requests reject with a [`TravianApiError`](#error-handling)
instead of surfacing an `error` argument.

```js
// v1 (removed)
tka.register(options, (err, response, body) => {
	console.log(body);
});

// v2
const body = await register(options);
console.log(body);
```

## API

All functions return a `Promise<ApiEnvelope<T>>`, where `ApiEnvelope` is:

```ts
interface ApiEnvelope<T> {
	time: number; // server timestamp (ms)
	response: T; // endpoint-specific payload
}
```

Each function also accepts an optional second argument, `RequestOptions`, for
cancellation and dependency injection:

```ts
interface RequestOptions {
	signal?: AbortSignal; // cancel the request (e.g. for a timeout)
	fetch?: typeof fetch; // supply a custom fetch implementation
}
```

### `register(options, request?)`

Call this first to obtain a `privateApiKey` / `publicSiteKey`. The
`privateApiKey` authenticates all other calls.

| Option     | Type             | Required | Meaning                                                        |
| ---------- | ---------------- | -------- | -------------------------------------------------------------- |
| `url`      | `string`         | yes      | Game world URL, e.g. `https://cz4.kingdoms.com`                |
| `email`    | `string` (≤ 255) | yes      | A valid e-mail address                                         |
| `siteName` | `string` (≤ 255) | yes      | Name of the tool                                               |
| `siteUrl`  | `string` (≤ 255) | yes      | A valid, publicly reachable URL of the tool                    |
| `isPublic` | `boolean`        | yes      | When `true`, your tool may be included in the public tool list |

```ts
const { response } = await register({
	url: 'https://cz4.kingdoms.com',
	email: 'some@email.com',
	siteName: 'someSiteName',
	siteUrl: 'http://www.someSite.url',
	isPublic: true,
});
// response => { privateApiKey: 'xxx', publicSiteKey: 'yyy' }
```

### `updateSiteData(options, request?)`

Update the metadata of a previously registered tool.

| Option          | Type             | Required | Meaning                                     |
| --------------- | ---------------- | -------- | ------------------------------------------- |
| `url`           | `string`         | yes      | Game world URL                              |
| `privateApiKey` | `string`         | yes      | Your private API key (from `register`)      |
| `email`         | `string` (≤ 255) | yes      | A valid e-mail address                      |
| `siteName`      | `string` (≤ 255) | yes      | Name of the tool                            |
| `siteUrl`       | `string` (≤ 255) | yes      | A valid, publicly reachable URL of the tool |
| `isPublic`      | `boolean`        | yes      | Public tool list opt-in                     |

```ts
const { response } = await updateSiteData({
	url: 'https://cz4.kingdoms.com',
	privateApiKey: 'xxx',
	email: 'some@email.com',
	siteName: 'someSiteName',
	siteUrl: 'http://www.someSite.url',
	isPublic: true,
});
// response => { data: true }
```

### `getMapData(options, request?)`

Fetch a full public map snapshot (the classic `map.sql`) for a given day.

| Option          | Type     | Required | Meaning                                                                    |
| --------------- | -------- | -------- | -------------------------------------------------------------------------- |
| `url`           | `string` | yes      | Game world URL                                                             |
| `privateApiKey` | `string` | yes      | Your private API key (from `register`)                                     |
| `date`          | `string` | no       | Day in `d.m.Y` format (e.g. `27.08.2014`). Defaults to today when omitted. |

```ts
const { response } = await getMapData({
	url: 'https://cz4.kingdoms.com',
	privateApiKey: 'xxx',
	date: '20.02.2018', // optional
});
```

The `response` payload has the following shape:

```ts
{
	gameworld: {
		name: 'cz4',
		startTime: 1518008400,
		speed: 1,
		speedTroops: 1,
		lastUpdateTime: '1519167901',
		date: 1519084800,
		version: '1.0',
	},
	players: [ /* ... */ ],
	kingdoms: [ /* ... */ ],
	map: {
		radius: '60',
		cells: [ /* ... */ ],
		landscapes: [ /* ... */ ],
	},
}
```

### `TravianKingdomsClient`

A convenience wrapper that binds the game world `url` (and optionally a
`privateApiKey`) so you don't have to repeat them on every call.

```ts
import { TravianKingdomsClient } from 'travian-kingdoms-api';

const client = new TravianKingdomsClient({
	url: 'https://cz4.kingdoms.com',
	privateApiKey: 'xxx',
});

const { response } = await client.getMapData({ date: '20.02.2018' });
```

## Error handling

Non-successful HTTP responses reject with a `TravianApiError` exposing the
status, status text, requested URL (with secrets redacted) and the parsed body.

```ts
import { getMapData, TravianApiError } from 'travian-kingdoms-api';

try {
	await getMapData({ url: 'https://cz4.kingdoms.com', privateApiKey: 'xxx' });
} catch (error) {
	if (error instanceof TravianApiError) {
		console.error(error.status, error.statusText, error.body);
	}
}
```

## Cancellation & timeouts

Pass an `AbortSignal` through the second argument:

```ts
await getMapData(
	{ url: 'https://cz4.kingdoms.com', privateApiKey: 'xxx' },
	{ signal: AbortSignal.timeout(5000) },
);
```

## Development

```sh
npm install        # install dependencies
npm run build      # bundle ESM + CJS + type declarations
npm run dev        # rebuild on change
npm test           # run the test suite in watch mode
npm run test:run   # run the test suite once
npm run test:coverage  # run tests with a coverage report
npm run lint       # lint the source
npm run lint:fix   # lint and auto-fix
npm run format     # format with Prettier
npm run typecheck  # type-check without emitting
```

### Publishing

Publishing to the npm registry is **automated** via GitHub Actions
([`.github/workflows/publish.yml`](./.github/workflows/publish.yml)). To ship a
new version:

1. Bump the version and push the tag:

    ```sh
    npm version <patch|minor|major>
    git push --follow-tags
    ```

2. Create a **GitHub Release** for that tag (Releases → Draft a new release).
   Publishing the release triggers the workflow, which lints, type-checks,
   tests, builds and runs `npm publish --provenance` automatically.

The workflow authenticates with an `NPM_TOKEN` repository secret
(Settings → Secrets and variables → Actions). Create an
[npm access token](https://docs.npmjs.com/creating-and-viewing-access-tokens)
with publish rights and store it there once.

You can still publish manually if needed (`npm publish`); the `prepublishOnly`
hook cleans, lints, type-checks, tests and builds the package first, so only the
compiled `dist/` output ever ships.

## License

[MIT](./LICENSE) © JaLe
