import { TravianApiError } from './errors.js';
import type {
	ApiEnvelope,
	GetMapDataOptions,
	MapData,
	RegisterOptions,
	RegisterResponse,
	RequestOptions,
	UpdateSiteDataOptions,
	UpdateSiteDataResponse,
} from './types.js';

/** Path of the public "external tools" endpoint on every game world. */
const EXTERNAL_ENDPOINT = '/api/external.php';

/** Query keys whose values must never be logged or surfaced verbatim. */
const SECRET_QUERY_KEYS = ['privateApiKey'] as const;

/**
 * Build a fully qualified, correctly encoded request URL for a given action.
 *
 * Unlike the original implementation, values are encoded via
 * {@link URLSearchParams}, so characters such as `&`, `=` and spaces in e-mail
 * addresses or tool names can no longer corrupt the query string.
 *
 * @param baseUrl - Base URL of the game world (trailing slash tolerated).
 * @param action - The `action` query parameter selecting the endpoint.
 * @param params - Additional query parameters; `undefined` values are skipped.
 * @returns The assembled {@link URL}.
 * @internal
 */
export function buildUrl(
	baseUrl: string,
	action: string,
	params: Record<string, string | number | boolean | undefined>,
): URL {
	const normalizedBase = baseUrl.replace(/\/+$/, '');
	const url = new URL(`${normalizedBase}${EXTERNAL_ENDPOINT}`);
	url.searchParams.set('action', action);

	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			url.searchParams.set(key, String(value));
		}
	}

	return url;
}

/**
 * Return a copy of `url` with all secret query parameters masked, safe to
 * include in error messages and logs.
 *
 * @internal
 */
export function redactUrl(url: URL): string {
	const copy = new URL(url.toString());
	for (const key of SECRET_QUERY_KEYS) {
		if (copy.searchParams.has(key)) {
			copy.searchParams.set(key, '***');
		}
	}
	return copy.toString();
}

/**
 * Perform a JSON `GET` request against the API and validate the HTTP status.
 *
 * @typeParam T - Expected shape of the `response` payload.
 * @param url - The fully built request URL.
 * @param request - Optional per-call request tuning.
 * @returns The parsed {@link ApiEnvelope}.
 * @throws {@link TravianApiError} when the server responds with a non-2xx status.
 * @internal
 */
async function requestJson<T>(url: URL, request: RequestOptions = {}): Promise<ApiEnvelope<T>> {
	const fetchImpl = request.fetch ?? globalThis.fetch;

	if (typeof fetchImpl !== 'function') {
		throw new TypeError(
			'No `fetch` implementation available. Use Node.js >= 18 or pass `fetch` explicitly.',
		);
	}

	const response = await fetchImpl(url, {
		method: 'GET',
		headers: { Accept: 'application/json' },
		...(request.signal ? { signal: request.signal } : {}),
	});

	const body = await parseBody(response);

	if (!response.ok) {
		throw new TravianApiError(
			`Travian Kingdoms API request failed with status ${response.status} (${response.statusText}).`,
			{
				status: response.status,
				statusText: response.statusText,
				url: redactUrl(url),
				body,
			},
		);
	}

	return body as ApiEnvelope<T>;
}

/**
 * Best-effort parse of a response body as JSON, falling back to text.
 *
 * @internal
 */
async function parseBody(response: Response): Promise<unknown> {
	const text = await response.text();
	if (text.length === 0) {
		return undefined;
	}
	try {
		return JSON.parse(text) as unknown;
	} catch {
		return text;
	}
}

/**
 * Register a new external tool and obtain the API keys required for all other
 * calls.
 *
 * You must call this first: the returned `privateApiKey` authenticates
 * {@link updateSiteData} and {@link getMapData}.
 *
 * @param options - Registration details.
 * @param request - Optional per-call request tuning.
 * @returns The response envelope containing the private and public keys.
 * @throws {@link TravianApiError} on a non-successful HTTP status.
 *
 * @example
 * ```ts
 * import { register } from 'travian-kingdoms-api';
 *
 * const { response } = await register({
 * 	url: 'https://cz4.kingdoms.com',
 * 	email: 'some@email.com',
 * 	siteName: 'someSiteName',
 * 	siteUrl: 'http://www.someSite.url',
 * 	isPublic: true,
 * });
 * console.log(response.privateApiKey, response.publicSiteKey);
 * ```
 */
export function register(
	options: RegisterOptions,
	request?: RequestOptions,
): Promise<ApiEnvelope<RegisterResponse>> {
	const url = buildUrl(options.url, 'requestApiKey', {
		email: options.email,
		siteName: options.siteName,
		siteUrl: options.siteUrl,
		public: options.isPublic,
	});
	return requestJson<RegisterResponse>(url, request);
}

/**
 * Update the metadata of a previously registered tool.
 *
 * @param options - Updated tool details, including the `privateApiKey`.
 * @param request - Optional per-call request tuning.
 * @returns The response envelope confirming the update.
 * @throws {@link TravianApiError} on a non-successful HTTP status.
 *
 * @example
 * ```ts
 * import { updateSiteData } from 'travian-kingdoms-api';
 *
 * await updateSiteData({
 * 	url: 'https://cz4.kingdoms.com',
 * 	privateApiKey: 'xxx',
 * 	email: 'some@email.com',
 * 	siteName: 'someSiteName',
 * 	siteUrl: 'http://www.someSite.url',
 * 	isPublic: true,
 * });
 * ```
 */
export function updateSiteData(
	options: UpdateSiteDataOptions,
	request?: RequestOptions,
): Promise<ApiEnvelope<UpdateSiteDataResponse>> {
	const url = buildUrl(options.url, 'updateSiteData', {
		privateApiKey: options.privateApiKey,
		email: options.email,
		siteName: options.siteName,
		siteUrl: options.siteUrl,
		public: options.isPublic,
	});
	return requestJson<UpdateSiteDataResponse>(url, request);
}

/**
 * Fetch a full public map snapshot of a game world for a given day.
 *
 * @param options - Query details, including the `privateApiKey` and optional `date`.
 * @param request - Optional per-call request tuning.
 * @returns The response envelope containing the map snapshot.
 * @throws {@link TravianApiError} on a non-successful HTTP status.
 *
 * @example
 * ```ts
 * import { getMapData } from 'travian-kingdoms-api';
 *
 * const { response } = await getMapData({
 * 	url: 'https://cz4.kingdoms.com',
 * 	privateApiKey: 'xxx',
 * 	date: '20.02.2018', // optional; defaults to today
 * });
 * console.log(response.gameworld.name, response.players.length);
 * ```
 */
export function getMapData(
	options: GetMapDataOptions,
	request?: RequestOptions,
): Promise<ApiEnvelope<MapData>> {
	const url = buildUrl(options.url, 'getMapData', {
		privateApiKey: options.privateApiKey,
		date: options.date,
	});
	return requestJson<MapData>(url, request);
}

/**
 * Options accepted by the {@link TravianKingdomsClient} constructor.
 */
export interface TravianKingdomsClientOptions {
	/** Base URL of the game world, for example `https://cz4.kingdoms.com`. */
	url: string;
	/**
	 * A private API key to reuse across {@link TravianKingdomsClient.updateSiteData}
	 * and {@link TravianKingdomsClient.getMapData} calls. Optional if you only
	 * intend to call {@link TravianKingdomsClient.register}.
	 */
	privateApiKey?: string;
	/** Default per-request options applied to every call. */
	request?: RequestOptions;
}

/**
 * A small convenience wrapper that binds a game world `url` (and optionally a
 * `privateApiKey`) so you do not have to repeat them on every call.
 *
 * The standalone {@link register}, {@link updateSiteData} and
 * {@link getMapData} functions remain available if you prefer a functional
 * style.
 *
 * @example
 * ```ts
 * import { TravianKingdomsClient } from 'travian-kingdoms-api';
 *
 * const client = new TravianKingdomsClient({
 * 	url: 'https://cz4.kingdoms.com',
 * 	privateApiKey: 'xxx',
 * });
 *
 * const { response } = await client.getMapData();
 * ```
 */
export class TravianKingdomsClient {
	private readonly url: string;
	private readonly privateApiKey: string | undefined;
	private readonly defaultRequest: RequestOptions | undefined;

	constructor(options: TravianKingdomsClientOptions) {
		this.url = options.url;
		this.privateApiKey = options.privateApiKey;
		this.defaultRequest = options.request;
	}

	/**
	 * Register a new external tool. See {@link register}.
	 *
	 * @param options - Registration details, minus the bound `url`.
	 * @param request - Optional per-call request tuning (merged over the defaults).
	 */
	register(
		options: Omit<RegisterOptions, 'url'>,
		request?: RequestOptions,
	): Promise<ApiEnvelope<RegisterResponse>> {
		return register({ ...options, url: this.url }, this.mergeRequest(request));
	}

	/**
	 * Update the tool metadata. See {@link updateSiteData}.
	 *
	 * The bound `url` and (if supplied) `privateApiKey` are applied automatically.
	 *
	 * @param options - Updated tool details, minus the bound `url`; `privateApiKey`
	 * is optional when one was provided to the constructor.
	 * @param request - Optional per-call request tuning (merged over the defaults).
	 */
	async updateSiteData(
		options: MakeOptional<Omit<UpdateSiteDataOptions, 'url'>, 'privateApiKey'>,
		request?: RequestOptions,
	): Promise<ApiEnvelope<UpdateSiteDataResponse>> {
		return updateSiteData(
			{
				...options,
				url: this.url,
				privateApiKey: this.requirePrivateApiKey(options.privateApiKey),
			},
			this.mergeRequest(request),
		);
	}

	/**
	 * Fetch a map snapshot. See {@link getMapData}.
	 *
	 * The bound `url` and (if supplied) `privateApiKey` are applied automatically.
	 *
	 * @param options - Query details, minus the bound `url`; both fields are optional
	 * when a `privateApiKey` was provided to the constructor.
	 * @param request - Optional per-call request tuning (merged over the defaults).
	 */
	async getMapData(
		options: Partial<Omit<GetMapDataOptions, 'url'>> = {},
		request?: RequestOptions,
	): Promise<ApiEnvelope<MapData>> {
		return getMapData(
			{
				url: this.url,
				privateApiKey: this.requirePrivateApiKey(options.privateApiKey),
				...(options.date !== undefined ? { date: options.date } : {}),
			},
			this.mergeRequest(request),
		);
	}

	/** Merge a per-call {@link RequestOptions} over the client defaults. */
	private mergeRequest(request?: RequestOptions): RequestOptions | undefined {
		if (!this.defaultRequest && !request) {
			return undefined;
		}
		return { ...this.defaultRequest, ...request };
	}

	/** Resolve the effective private API key or throw a helpful error. */
	private requirePrivateApiKey(override?: string): string {
		const key = override ?? this.privateApiKey;
		if (!key) {
			throw new Error(
				'A `privateApiKey` is required. Pass it to the client constructor or to the method call.',
			);
		}
		return key;
	}
}

/** Make the given keys of `T` optional. */
type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
