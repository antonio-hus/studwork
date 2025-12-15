/** @format */

/**
 * Represents the state of a rate-limiting bucket.
 * Used to track and enforce API request limits.
 */
export type RateLimit = {
    /**
     * Unique identifier for the subject being rate-limited.
     * Can be an IP address, User ID, or API key.
     */
    token: string

    /**
     * The current number of requests made within the active window.
     */
    count: number

    /**
     * The maximum number of requests allowed within the window.
     */
    limit: number

    /**
     * Unix timestamp (in milliseconds) indicating when the rate limit window resets.
     */
    resetAt: number
}
