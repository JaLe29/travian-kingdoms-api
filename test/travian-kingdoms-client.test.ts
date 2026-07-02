import { describe, expect, it } from 'vitest';
import { TravianKingdomsClient } from '../src/client.js';
import { calledUrl, mockJsonFetch } from './helpers.js';

const BASE = 'https://cz4.kingdoms.com';

describe('TravianKingdomsClient', () => {
	it('binds the url across register calls', async () => {
		const fetchImpl = mockJsonFetch({
			time: 1,
			response: { privateApiKey: 'priv', publicSiteKey: 'pub' },
		});
		const client = new TravianKingdomsClient({ url: BASE, request: { fetch: fetchImpl } });

		await client.register({
			email: 'me@example.com',
			siteName: 'My Tool',
			siteUrl: 'https://tool.example',
			isPublic: true,
		});

		const url = new URL(calledUrl(fetchImpl));
		expect(url.origin).toBe(BASE);
		expect(url.searchParams.get('action')).toBe('requestApiKey');
	});

	it('reuses the bound private key for getMapData', async () => {
		const fetchImpl = mockJsonFetch({ time: 3, response: {} });
		const client = new TravianKingdomsClient({
			url: BASE,
			privateApiKey: 'bound-key',
			request: { fetch: fetchImpl },
		});

		await client.getMapData({ date: '20.02.2018' });

		const url = new URL(calledUrl(fetchImpl));
		expect(url.searchParams.get('privateApiKey')).toBe('bound-key');
		expect(url.searchParams.get('date')).toBe('20.02.2018');
	});

	it('allows overriding the bound private key per call', async () => {
		const fetchImpl = mockJsonFetch({ time: 3, response: {} });
		const client = new TravianKingdomsClient({
			url: BASE,
			privateApiKey: 'bound-key',
			request: { fetch: fetchImpl },
		});

		await client.updateSiteData({
			privateApiKey: 'override-key',
			email: 'me@example.com',
			siteName: 'My Tool',
			siteUrl: 'https://tool.example',
			isPublic: true,
		});

		const url = new URL(calledUrl(fetchImpl));
		expect(url.searchParams.get('privateApiKey')).toBe('override-key');
	});

	it('merges per-call request options over the client defaults', async () => {
		const defaultFetch = mockJsonFetch({ time: 3, response: {} });
		const perCallFetch = mockJsonFetch({ time: 3, response: {} });
		const client = new TravianKingdomsClient({
			url: BASE,
			privateApiKey: 'bound-key',
			request: { fetch: defaultFetch },
		});

		await client.getMapData({}, { fetch: perCallFetch });

		expect(perCallFetch).toHaveBeenCalledOnce();
		expect(defaultFetch).not.toHaveBeenCalled();
	});

	it('throws a helpful error when no private key is available', async () => {
		const client = new TravianKingdomsClient({ url: BASE });
		await expect(client.getMapData()).rejects.toThrow(/privateApiKey/);
	});
});
