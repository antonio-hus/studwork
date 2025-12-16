/** @format */
import 'server-only'
import {LRUCache} from 'lru-cache';
import {RateLimit} from '@/lib/domain/rate-limit';

/**
 * Repository for managing rate limiting state using an in-memory LRU cache
 * Tracks request counts per token (e.g., IP address, user ID, API key) within time windows
 */
export class RateLimitRepository {
    private tokenCache: LRUCache<string, RateLimit>;

    /**
     * Initializes the rate limit repository with specified options
     *
     * @param interval - Time window in milliseconds for rate limit reset
     * @param uniqueTokenPerInterval - Maximum number of unique tokens to track simultaneously in the cache
     */
    constructor(interval: number, uniqueTokenPerInterval: number) {
        this.tokenCache = new LRUCache({
            ttl: interval || 60000,
            max: uniqueTokenPerInterval || 500,
        });
    }

    /**
     * Retrieves the current rate limit state for a given token
     *
     * @param token - Unique identifier for the rate-limited resource (e.g., IP address, user ID)
     * @returns The RateLimit object if found in cache, undefined otherwise
     */
    get(token: string): RateLimit | undefined {
        return this.tokenCache.get(token);
    }

    /**
     * Creates a new rate limit entry for a token with initial count of 0
     * Automatically sets the reset timestamp based on the configured interval
     *
     * @param token - Unique identifier for the rate-limited resource
     * @param limit - Maximum number of requests allowed within the time window
     * @returns The newly created RateLimit object
     */
    create(token: string, limit: number): RateLimit {
        const resetAt = Date.now() + (this.tokenCache.ttl || 60000);
        const rateLimit: RateLimit = {token, count: 0, limit, resetAt};
        this.save(rateLimit);
        return rateLimit;
    }

    /**
     * Persists or updates a rate limit entry in the cache
     *
     * @param rateLimit - The RateLimit object to store in the cache
     */
    save(rateLimit: RateLimit): void {
        this.tokenCache.set(rateLimit.token, rateLimit);
    }
}

