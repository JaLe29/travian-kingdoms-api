import { describe, expect, it } from 'vitest';
import { buildUrl, redactUrl } from '../src/client.js';

describe('buildUrl', () => {
	it('assembles the external endpoint with the action query parameter', () => {
		const url = buildUrl('https://cz4.kingdoms.com', 'getMapData', {});
		expect(url.pathname).toBe('/api/external.php');
		expect(url.searchParams.get('action')).toBe('getMapData');
	});

	it('normalizes trailing slashes on the base URL', () => {
		const url = buildUrl('https://cz4.kingdoms.com///', 'requestApiKey', {});
		expect(url.origin + url.pathname).toBe('https://cz4.kingdoms.com/api/external.php');
	});

	it('encodes query values that would otherwise corrupt the query string', () => {
		const url = buildUrl('https://cz4.kingdoms.com', 'requestApiKey', {
			email: 'a+b@example.com',
			siteName: 'Tool & Co =1',
		});
		// Reading back through the parser yields the original, un-corrupted values.
		expect(url.searchParams.get('email')).toBe('a+b@example.com');
		expect(url.searchParams.get('siteName')).toBe('Tool & Co =1');
	});

	it('serializes booleans and skips undefined values', () => {
		const url = buildUrl('https://cz4.kingdoms.com', 'requestApiKey', {
			public: true,
			date: undefined,
		});
		expect(url.searchParams.get('public')).toBe('true');
		expect(url.searchParams.has('date')).toBe(false);
	});
});

describe('redactUrl', () => {
	it('masks the privateApiKey parameter', () => {
		const url = buildUrl('https://cz4.kingdoms.com', 'getMapData', {
			privateApiKey: 'super-secret',
		});
		const redacted = redactUrl(url);
		expect(redacted).not.toContain('super-secret');
		expect(redacted).toContain('privateApiKey=***');
	});

	it('leaves non-secret parameters untouched', () => {
		const url = buildUrl('https://cz4.kingdoms.com', 'getMapData', { date: '20.02.2018' });
		expect(redactUrl(url)).toContain('date=20.02.2018');
	});
});
