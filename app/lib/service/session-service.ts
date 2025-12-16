/** @format */
import 'server-only'
import {SessionRepository} from '@/lib/repository/session-repository'
import type {User} from '@/lib/domain/user'

/**
 * Session Service
 * Handles session management including creation, validation, and retrieval.
 * Optimized to use session-stored user data to minimize database queries.
 */
export class SessionService {
    private static _instance: SessionService
    private sessionRepository: SessionRepository

    private constructor() {
        this.sessionRepository = new SessionRepository()
    }

    static get instance(): SessionService {
        if (!SessionService._instance) {
            SessionService._instance = new SessionService()
        }
        return SessionService._instance
    }

    /**
     * Retrieves the current session.
     * Returns the encrypted session object from iron-session.
     *
     * @returns The current session with user data and authentication state.
     */
    async getSession() {
        return this.sessionRepository.getSession()
    }

    /**
     * Creates a new authenticated session for a user.
     * Stores user data in encrypted session cookie.
     *
     * @param user - The user object to store in the session.
     */
    async createSession(user: User) {
        return this.sessionRepository.createSession(user)
    }

    /**
     * Destroys the current session.
     * Removes the encrypted session cookie and clears all session data.
     */
    async destroySession() {
        return this.sessionRepository.destroySession()
    }

    /**
     * Checks if the current session has expired.
     * Compares current timestamp with session expiration time.
     *
     * @returns True if session is expired or invalid, false if still valid.
     */
    async isSessionExpired() {
        return this.sessionRepository.isSessionExpired()
    }

    /**
     * Refreshes the session expiration time.
     * Extends the session lifetime by updating the expiresAt timestamp.
     */
    async refreshSession() {
        return this.sessionRepository.refreshSession()
    }

    /**
     * Verifies the current session and returns authentication status.
     * Checks session validity and expiration.
     *
     * @returns Boolean authentication status.
     */
    async verifySession() {
        const session = await this.getSession()

        // Check if user is authenticated
        if (!session.isAuth || !session.user?.id) {
            return false
        }

        // Check if session is expired
        const expired = await this.isSessionExpired()
        if (expired) {
            // Destroy expired session
            await this.destroySession()
            return false
        }

        return true
    }

    /**
     * Gets the current authenticated user from session.
     * Returns user data directly from session without database query for optimal performance.
     * Returns null if session is invalid or expired.
     *
     * @returns The User object from session or null if not authenticated.
     */
    async getCurrentSessionUser() {
        const session = await this.getSession()

        // Check if user is authenticated
        if (!session.isAuth || !session.user?.id) {
            return null
        }

        // Check if session is expired
        const expired = await this.isSessionExpired()
        if (expired) {
            await this.destroySession()
            return null
        }

        return session.user
    }
}
