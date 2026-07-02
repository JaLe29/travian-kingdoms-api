import { describe, expect, it } from 'vitest';
import { getMapData, register, updateSiteData } from '../src/client.js';
import { TravianApiError } from '../src/errors.js';
import { calledUrl, mockJsonFetch, mockTextFetch } from './helpers.js';

const BASE = 'https://cz4.kingdoms.com';

describe('register', () => {
	it('calls the requestApiKey action with the expected parameters', async () => {
		const fetchImpl = mockJsonFetch({
			time: 1,
			response: { privateApiKey: 'priv', publicSiteKey: 'pub' },
		});

		const result = await register(
			{
				url: BASE,
				email: 'me@example.com',
				siteName: 'My Tool',
				siteUrl: 'https://tool.example',
				isPublic: true,
			},
			{ fetch: fetchImpl },
		);

		expect(result.response.privateApiKey).toBe('priv');
		expect(result.response.publicSiteKey).toBe('pub');

		const url = new URL(calledUrl(fetchImpl));
		expect(url.searchParams.get('action')).toBe('requestApiKey');
		expect(url.searchParams.get('email')).toBe('me@example.com');
		expect(url.searchParams.get('siteName')).toBe('My Tool');
		expect(url.searchParams.get('siteUrl')).toBe('https://tool.example');
		expect(url.searchParams.get('public')).toBe('true');
	});
});

describe('updateSiteData', () => {
	it('calls the updateSiteData action including the private key', async () => {
		const fetchImpl = mockJsonFetch({ time: 2, response: { data: true } });

		const result = await updateSiteData(
			{
				url: BASE,
				privateApiKey: 'priv',
				email: 'me@example.com',
				siteName: 'My Tool',
				siteUrl: 'https://tool.example',
				isPublic: false,
			},
			{ fetch: fetchImpl },
		);

		expect(result.response.data).toBe(true);

		const url = new URL(calledUrl(fetchImpl));
		expect(url.searchParams.get('action')).toBe('updateSiteData');
		expect(url.searchParams.get('privateApiKey')).toBe('priv');
		expect(url.searchParams.get('public')).toBe('false');
	});
});

describe('getMapData', () => {
	it('includes the date parameter when supplied', async () => {
		const fetchImpl = mockJsonFetch({ time: 3, response: { gameworld: { name: 'cz4' } } });

		await getMapData(
			{ url: BASE, privateApiKey: 'priv', date: '20.02.2018' },
			{ fetch: fetchImpl },
		);

		const url = new URL(calledUrl(fetchImpl));
		expect(url.searchParams.get('action')).toBe('getMapData');
		expect(url.searchParams.get('date')).toBe('20.02.2018');
	});

	it('omits the date parameter when not supplied', async () => {
		const fetchImpl = mockJsonFetch({ time: 3, response: {} });

		await getMapData({ url: BASE, privateApiKey: 'priv' }, { fetch: fetchImpl });

		const url = new URL(calledUrl(fetchImpl));
		expect(url.searchParams.has('date')).toBe(false);
	});

	it('forwards an AbortSignal to fetch', async () => {
		const fetchImpl = mockJsonFetch({ time: 3, response: {} });
		const controller = new AbortController();

		await getMapData(
			{ url: BASE, privateApiKey: 'priv' },
			{ fetch: fetchImpl, signal: controller.signal },
		);

		const mock = fetchImpl as unknown as { mock: { calls: unknown[][] } };
		const init = mock.mock.calls[0]?.[1] as RequestInit;
		expect(init.signal).toBe(controller.signal);
	});
});

describe('error handling', () => {
	it('throws a TravianApiError on a non-2xx response', async () => {
		const fetchImpl = mockJsonFetch(
			{ error: 'nope' },
			{ status: 403, statusText: 'Forbidden' },
		);

		await expect(
			getMapData({ url: BASE, privateApiKey: 'secret-key' }, { fetch: fetchImpl }),
		).rejects.toBeInstanceOf(TravianApiError);
	});

	it('redacts the private key in the thrown error', async () => {
		const fetchImpl = mockJsonFetch({ error: 'nope' }, { status: 500, statusText: 'Boom' });

		try {
			await getMapData({ url: BASE, privateApiKey: 'secret-key' }, { fetch: fetchImpl });
			expect.unreachable('should have thrown');
		} catch (error) {
			expect(error).toBeInstanceOf(TravianApiError);
			const apiError = error as TravianApiError;
			expect(apiError.status).toBe(500);
			expect(apiError.url).not.toContain('secret-key');
			expect(apiError.body).toEqual({ error: 'nope' });
		}
	});

	it('falls back to text when the body is not valid JSON', async () => {
		const fetchImpl = mockTextFetch('gateway timeout', {
			status: 504,
			statusText: 'Gateway Timeout',
		});

		try {
			await getMapData({ url: BASE, privateApiKey: 'priv' }, { fetch: fetchImpl });
			expect.unreachable('should have thrown');
		} catch (error) {
			expect((error as TravianApiError).body).toBe('gateway timeout');
		}
	});

	it('throws a TypeError when no fetch implementation is available', async () => {
		const original = globalThis.fetch;
		// @ts-expect-error deliberately removing fetch to exercise the guard.
		delete globalThis.fetch;
		try {
			await expect(
				register({
					url: BASE,
					email: 'me@example.com',
					siteName: 'My Tool',
					siteUrl: 'https://tool.example',
					isPublic: true,
				}),
			).rejects.toBeInstanceOf(TypeError);
		} finally {
			globalThis.fetch = original;
		}
	});

	it('uses the global fetch when none is provided', async () => {
		const fetchImpl = mockJsonFetch({ time: 1, response: { data: true } });
		const original = globalThis.fetch;
		globalThis.fetch = fetchImpl;
		try {
			const result = await updateSiteData({
				url: BASE,
				privateApiKey: 'priv',
				email: 'me@example.com',
				siteName: 'My Tool',
				siteUrl: 'https://tool.example',
				isPublic: true,
			});
			expect(result.response.data).toBe(true);
			expect(fetchImpl).toHaveBeenCalledOnce();
		} finally {
			globalThis.fetch = original;
		}
	});
});
