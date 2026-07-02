/**
 * Type definitions for the Travian Kingdoms public API.
 *
 * These describe both the shape of the arguments accepted by the client and
 * the shape of the payloads returned by the remote endpoints.
 *
 * @packageDocumentation
 */

/**
 * Generic envelope every Travian Kingdoms endpoint wraps its payload in.
 *
 * @typeParam T - Shape of the endpoint specific `response` payload.
 */
export interface ApiEnvelope<T> {
	/** Server timestamp (Unix epoch, in milliseconds) of when the response was produced. */
	time: number;
	/** Endpoint specific payload. */
	response: T;
}

/**
 * Options shared by every request: they all need to know which game world to
 * talk to.
 */
export interface BaseOptions {
	/**
	 * Base URL of the game world, for example `https://cz4.kingdoms.com`.
	 *
	 * Any trailing slash is tolerated and normalized away.
	 */
	url: string;
}

/**
 * Arguments for {@link register}.
 */
export interface RegisterOptions extends BaseOptions {
	/** A valid e-mail address (max 255 characters). */
	email: string;
	/** Human readable name of the tool being registered (max 255 characters). */
	siteName: string;
	/** A valid, publicly reachable URL of the tool (max 255 characters). */
	siteUrl: string;
	/**
	 * When `true`, the tool may be included in the public tool list published
	 * by Travian Kingdoms.
	 */
	isPublic: boolean;
}

/**
 * Arguments for {@link updateSiteData}.
 */
export interface UpdateSiteDataOptions extends RegisterOptions {
	/** The private API key obtained from {@link register}. */
	privateApiKey: string;
}

/**
 * Arguments for {@link getMapData}.
 */
export interface GetMapDataOptions extends BaseOptions {
	/** The private API key obtained from {@link register}. */
	privateApiKey: string;
	/**
	 * Optional day to fetch the map snapshot for, formatted as `d.m.Y`
	 * (for example `27.08.2014`). Defaults to the current day when omitted.
	 */
	date?: string;
}

/**
 * Payload returned by {@link register}.
 */
export interface RegisterResponse {
	/** Secret key used to authenticate all subsequent API calls. */
	privateApiKey: string;
	/** Public key identifying the registered tool. */
	publicSiteKey: string;
}

/**
 * Payload returned by {@link updateSiteData}.
 */
export interface UpdateSiteDataResponse {
	/** `true` when the update was accepted. */
	data: boolean;
}

/**
 * Metadata describing the game world a map snapshot belongs to.
 */
export interface GameWorld {
	/** Short name of the game world, for example `cz4`. */
	name: string;
	/** Unix timestamp (seconds) of when the game world started. */
	startTime: number;
	/** Building/development speed multiplier. */
	speed: number;
	/** Troop movement speed multiplier. */
	speedTroops: number;
	/** Unix timestamp (seconds, as string) of the last data update. */
	lastUpdateTime: string;
	/** Unix timestamp (seconds) the snapshot represents. */
	date: number;
	/** Data format version. */
	version: string;
}

/**
 * A single map cell.
 *
 * The remote API does not publish a stable schema for individual entities, so
 * these are intentionally kept open. Cast to a narrower type in your own code
 * if you rely on specific fields.
 */
export type MapCell = Record<string, unknown>;

/** A single landscape entry on the map. */
export type Landscape = Record<string, unknown>;

/** A single player entry. */
export type Player = Record<string, unknown>;

/** A single kingdom entry. */
export type Kingdom = Record<string, unknown>;

/**
 * The map section of a {@link MapData} snapshot.
 */
export interface Map {
	/** Radius of the map in fields, as a string. */
	radius: string;
	/** All populated map cells. */
	cells: MapCell[];
	/** All landscape entries (oases, etc.). */
	landscapes: Landscape[];
}

/**
 * Payload returned by {@link getMapData}: a full snapshot of the game world.
 */
export interface MapData {
	/** Metadata about the game world. */
	gameworld: GameWorld;
	/** Every player present in the snapshot. */
	players: Player[];
	/** Every kingdom present in the snapshot. */
	kingdoms: Kingdom[];
	/** The map itself. */
	map: Map;
}

/**
 * Optional per-call request tuning shared by every client method.
 */
export interface RequestOptions {
	/**
	 * An {@link AbortSignal} allowing the caller to cancel the request, for
	 * example to enforce a timeout.
	 */
	signal?: AbortSignal;
	/**
	 * A custom `fetch` implementation. Defaults to the global `fetch`. Useful
	 * for testing or for supplying a polyfill on older runtimes.
	 */
	fetch?: typeof fetch;
}
