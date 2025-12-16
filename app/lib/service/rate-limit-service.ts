/** @format */
import 'server-only'
import {RateLimitRepository} from '@/lib/repository/rate-limit-repository'
import {createLogger} from '@/lib/utils/logger'

/**
 * Rate Limit Service
 * Implements token bucket algorithm for rate limiting API requests.
 * Tracks request counts per token (e.g., IP address, user ID, email) within time windows.
 */
export class RateLimitService {
    private repository: RateLimitRepository
    private readonly logger = createLogger('RateLimitService')

    /**
     * Private constructor to enforce usage of static instances.
     *
     * @param repository - Repository instance configured with specific interval and cache size.
     */
    private constructor(repository: RateLimitRepository) {
        this.repository = repository
    }

    /**
     * Checks if a request is allowed under the rate limit.
     * Implements token bucket algorithm with automatic reset after interval expiration.
     *
     * @param limit - Maximum number of requests allowed within the time window.
     * @param token - Unique identifier for the rate-limited resource (e.g., IP address, user ID, email).
     * @returns Object with success status (boolean), remaining quota (number), and reset timestamp (number).
     */
    check(limit: number, token: string): { success: boolean; remaining: number; reset: number } {
        // Retrieve existing rate limit record for the token
        let rateLimit = this.repository.get(token)

        // Create a new record if none exists
        if (!rateLimit) {
            rateLimit = this.repository.create(token, limit)
        }

        // Reset the record if the current interval has expired
        if (Date.now() > rateLimit.resetAt) {
            rateLimit = this.repository.create(token, limit)
        }

        // Deny if the usage has already reached or exceeded the limit
        if (rateLimit.count >= limit) {
            this.logger.warn('Rate limit exceeded', {
                token,
                limit,
                resetAt: new Date(rateLimit.resetAt).toISOString()
            })

            return {
                success: false,
                remaining: 0,
                reset: rateLimit.resetAt,
            }
        }

        // Increment the usage count and persist the updated record
        rateLimit.count += 1
        this.repository.save(rateLimit)

        // Return the success response with remaining quota and reset time
        return {
            success: true,
            remaining: limit - rateLimit.count,
            reset: rateLimit.resetAt,
        }
    }

    /**
     * Login rate limiter instance.
     * Limits login attempts to 5 per 15 minutes per IP address.
     * Prevents brute force password attacks.
     */
    static loginLimiter = new RateLimitService(
        // 15 minutes, 500 unique tokens
        new RateLimitRepository(15 * 60 * 1000, 500)
    )

    /**
     * Signup rate limiter instance.
     * Limits signups to 3 per hour per IP address.
     * Prevents automated account creation and spam registrations.
     */
    static signupLimiter = new RateLimitService(
        // 1 hour, 500 unique tokens
        new RateLimitRepository(60 * 60 * 1000, 500)
    )

    /**
     * Password reset rate limiter instance.
     * Limits password reset requests to 3 per hour per IP address.
     * Prevents abuse of password reset functionality.
     */
    static passwordResetLimiter = new RateLimitService(
        // 1 hour, 500 unique tokens
        new RateLimitRepository(60 * 60 * 1000, 500)
    )

    /**
     * Email verification resend rate limiter instance.
     * Limits verification email resends to 3 per hour per email address.
     * Prevents email spam and abuse of verification system.
     */
    static emailResendLimiter = new RateLimitService(
        // 1 hour, 500 unique tokens
        new RateLimitRepository(60 * 60 * 1000, 500)
    )
}
