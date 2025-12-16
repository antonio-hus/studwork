/** @format */
import 'server-only'
import {LRUCache} from 'lru-cache';
import {RateLimit} from '@/lib/domain/rate-limit';
import {createLogger} from '@/lib/utils/logger';

/**
 * Repository for managing rate limiting state using an in-memory LRU cache
 * Tracks request counts per token (e.g., IP address, user ID, API key) within time windows
 */
export class RateLimitRepository {
    private tokenCache: LRUCache<string, RateLimit>;
    private readonly logger = createLogger('RateLimitRepository');

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
        this.logger.debug('RateLimitRepository initialized', { interval, uniqueTokenPerInterval });
    }

    /**
     * Retrieves the current rate limit state for a given token
     *
     * @param token - Unique identifier for the rate-limited resource (e.g., IP address, user ID)
     * @returns The RateLimit object if found in cache, undefined otherwise
     */
    get(token: string): RateLimit | undefined {
        const rateLimit = this.tokenCache.get(token);
        if (rateLimit) {
            this.logger.debug('Rate limit retrieved', { token, count: rateLimit.count });
        }
        return rateLimit;
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

        this.logger.debug('New rate limit entry created', { token, limit, resetAt });
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
