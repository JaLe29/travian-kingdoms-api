/**
 * Error thrown when the Travian Kingdoms API responds with a non-successful
 * HTTP status code.
 *
 * The raw {@link Response} and (best-effort) parsed body are attached so that
 * callers can inspect the failure without re-issuing the request.
 */
export class TravianApiError extends Error {
	/** The HTTP status code returned by the server. */
	public readonly status: number;

	/** The HTTP status text returned by the server. */
	public readonly statusText: string;

	/** The URL that was requested (with secrets already redacted upstream). */
	public readonly url: string;

	/** The parsed response body, if one could be read. */
	public readonly body: unknown;

	/**
	 * @param message - Human readable description of the failure.
	 * @param details - Structured context about the failed request.
	 */
	constructor(
		message: string,
		details: { status: number; statusText: string; url: string; body: unknown },
	) {
		super(message);
		this.name = 'TravianApiError';
		this.status = details.status;
		this.statusText = details.statusText;
		this.url = details.url;
		this.body = details.body;

		// Restore the prototype chain for correct `instanceof` checks when the
		// output is transpiled down to ES5-style constructors.
		Object.setPrototypeOf(this, TravianApiError.prototype);
	}
}
