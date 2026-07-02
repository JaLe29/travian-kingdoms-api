import { vi } from 'vitest';

/**
 * Build a `fetch` mock that resolves to a JSON {@link Response}.
 *
 * @param body - Object serialized as the response body.
 * @param init - Optional status/statusText overrides (defaults to `200 OK`).
 * @returns A `vi.fn()` typed as `fetch`.
 */
export function mockJsonFetch(
	body: unknown,
	init: { status?: number; statusText?: string } = {},
): typeof fetch {
	const status = init.status ?? 200;
	const statusText = init.statusText ?? 'OK';
	const impl: typeof fetch = vi.fn((_input: string | URL | Request) =>
		Promise.resolve(
			new Response(JSON.stringify(body), {
				status,
				statusText,
				headers: { 'Content-Type': 'application/json' },
			}),
		),
	);
	return impl;
}

/** Build a `fetch` mock that resolves to a raw (non-JSON) text body. */
export function mockTextFetch(
	text: string,
	init: { status?: number; statusText?: string } = {},
): typeof fetch {
	const status = init.status ?? 200;
	const statusText = init.statusText ?? 'OK';
	const impl: typeof fetch = vi.fn(() =>
		Promise.resolve(new Response(text, { status, statusText })),
	);
	return impl;
}

/** Extract the URL that a mocked `fetch` was called with, as a string. */
export function calledUrl(fetchMock: typeof fetch): string {
	const mock = fetchMock as unknown as { mock: { calls: unknown[][] } };
	const first = mock.mock.calls[0]?.[0];
	return String(first);
}
