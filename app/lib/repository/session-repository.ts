/** @format */
import 'server-only'
import {cookies} from 'next/headers';
import {getIronSession, SessionOptions} from 'iron-session';
import {User} from '@/lib/domain/user';
import {SessionData} from '@/lib/domain/session';
import {createLogger} from '@/lib/utils/logger';

/**
 * Configuration options for iron-session
 * Defines cookie settings, TTL, and security options for session management
 */
const sessionOptions: SessionOptions = {
    password: process.env.SECRET_KEY!,
    cookieName: 'session',
    ttl: 60 * 60 * 24 * 7, // 7 days in seconds
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    },
}

/**
 * Repository for managing user sessions using iron-session
 * Handles session storage in encrypted, signed cookies for stateless authentication
 */
export class SessionRepository {
    private readonly logger = createLogger('SessionRepository')

    /**
     * Retrieves the current iron-session instance from browser cookies
     * Automatically decrypts and validates the session data
     *
     * @returns The current session object containing user data and authentication state
     */
    async getSession() {
        const cookieStore = await cookies()
        return getIronSession<SessionData>(cookieStore, sessionOptions)
    }

    /**
     * Creates a new authenticated session for a user
     * Sets authentication state, user data, and calculates expiration timestamp
     *
     * @param user - The user object to store in the session
     */
    async createSession(user: User) {
        try {
            const session = await this.getSession()
            const now = Date.now()

            session.user = user
            session.isAuth = true
            session.createdAt = now
            session.expiresAt = now + (sessionOptions.ttl! * 1000)

            await session.save()

            this.logger.info('Session created successfully', {
                userId: user.id,
                expiresAt: new Date(session.expiresAt).toISOString()
            })
        } catch (error) {
            this.logger.error('Failed to create session', error as Error)
            throw error
        }
    }

    /**
     * Destroys the current session by removing the encrypted cookie
     * Effectively logs out the user by clearing all session data
     */
    async destroySession() {
        try {
            const session = await this.getSession()
            const userId = session.user?.id

            session.destroy()

            this.logger.info('Session destroyed', { userId })
        } catch (error) {
            this.logger.error('Failed to destroy session', error as Error)
            throw error
        }
    }

    /**
     * Checks if the current session has expired based on the expiresAt timestamp
     *
     * @returns True if session is expired or invalid, false if session is still valid
     */
    async isSessionExpired(): Promise<boolean> {
        try {
            const session = await this.getSession()

            if (!session.isAuth || !session.expiresAt) {
                return true
            }

            const isExpired = Date.now() > session.expiresAt
            if (isExpired) {
                this.logger.debug('Session expired', {
                    userId: session.user?.id,
                    expiredAt: new Date(session.expiresAt).toISOString()
                })
            }
            return isExpired
        } catch (error) {
            this.logger.error('Error checking session expiration', error as Error)
            return true
        }
    }

    /**
     * Extends the current session's expiration time by resetting the expiresAt timestamp
     * Only refreshes if the session is currently authenticated
     */
    async refreshSession() {
        try {
            const session = await this.getSession()

            if (session.isAuth) {
                const now = Date.now()
                session.expiresAt = now + (sessionOptions.ttl! * 1000)
                await session.save()

                this.logger.debug('Session refreshed', { userId: session.user?.id })
            }
        } catch (error) {
            this.logger.error('Failed to refresh session', error as Error)
        }
    }
}
