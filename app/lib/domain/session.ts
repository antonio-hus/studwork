/** @format */
import {User} from '@/lib/domain/user'

/**
 * Represents the active user session structure.
 * Stores authentication state and user profile information.
 */
export type SessionData = {
    /**
     * The fully authenticated user entity.
     * Contains profile information and role data.
     */
    user: User

    /**
     * Authentication status flag.
     * True if the user has successfully logged in and the session is active.
     */
    isAuth: boolean

    /**
     * Unix timestamp (in milliseconds) representing when the session was established.
     */
    createdAt: number

    /**
     * Unix timestamp (in milliseconds) representing when the session is scheduled to expire.
     */
    expiresAt: number
}
