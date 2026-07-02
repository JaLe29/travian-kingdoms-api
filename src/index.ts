/**
 * Modern, fully-typed client for the Travian Kingdoms public API endpoints.
 *
 * Every call is Promise based and works with `async`/`await`; there are no
 * runtime dependencies. Import the standalone functions for a functional
 * style, or use {@link TravianKingdomsClient} to bind a game world URL and
 * private API key once.
 *
 * @example
 * ```ts
 * import { register, getMapData } from 'travian-kingdoms-api';
 *
 * const { response } = await register({
 * 	url: 'https://cz4.kingdoms.com',
 * 	email: 'me@example.com',
 * 	siteName: 'My Tool',
 * 	siteUrl: 'https://tool.example',
 * 	isPublic: true,
 * });
 *
 * const map = await getMapData({
 * 	url: 'https://cz4.kingdoms.com',
 * 	privateApiKey: response.privateApiKey,
 * });
 * ```
 *
 * @packageDocumentation
 */

export {
	register,
	updateSiteData,
	getMapData,
	TravianKingdomsClient,
	type TravianKingdomsClientOptions,
} from './client.js';

export { TravianApiError } from './errors.js';

export type {
	ApiEnvelope,
	BaseOptions,
	RegisterOptions,
	RegisterResponse,
	UpdateSiteDataOptions,
	UpdateSiteDataResponse,
	GetMapDataOptions,
	MapData,
	GameWorld,
	Map,
	MapCell,
	Landscape,
	Player,
	Kingdom,
	RequestOptions,
} from './types.js';
