"use server"

import {cache} from 'react';
import {redirect} from 'next/navigation';
import {SessionService} from '@/lib/service/session-service';
import {UserService} from '@/lib/service/user-service';
import {createLogger} from '@/lib/utils/logger';
import {User} from '@/lib/domain/user';

const logger = createLogger('SessionController');

/**
 * Verifies the current session and retrieves the user.
 *
 * This function is cached per-request (React Cache) to prevent redundant DB calls
 * when used across multiple Server Components. It fetches fresh data from the DB
 * to ensure the 'emailVerified' timestamp is accurate.
 *
 * @returns {Promise<User | null>} The user object or null.
 */
export const verifySession = cache(async (): Promise<User | null> => {
    const sessionService = SessionService.instance;
    const userService = UserService.instance;

    const isValid = await sessionService.verifySession();
    if (!isValid) return null;

    const sessionUser = await sessionService.getCurrentSessionUser();
    if (!sessionUser) return null;

    // We fetch from DB to get the latest emailVerified status
    // sessionUser might have stale data if it was just created
    const dbUser = await userService.getUserById(sessionUser.id);

    // If user was deleted in DB but session exists, return null
    if (!dbUser) return null;

    return dbUser;
});

/**
 * Lightweight session check for Middleware/Proxy usage.
 *
 * Unlike verifySession, this is NOT cached via React Cache because middleware
 * runs outside the React render lifecycle. It performs a basic validity check.
 *
 * @returns {Promise<User | null>} The user object or null if unauthenticated.
 */
export async function checkSessionForProxy(): Promise<User | null> {
    try {
        const sessionService = SessionService.instance;

        const isValid = await sessionService.verifySession();
        if (!isValid) return null;

        return await sessionService.getCurrentSessionUser();
    } catch (error) {
        logger.error('Proxy session check error', error as Error);
        return null;
    }
}

/**
 * Retrieves the current user directly from the session store.
 *
 * This is the fastest way to get user data as it avoids a database query,
 * relying solely on the encrypted session cookie.
 *
 * @returns {Promise<User | null>} The session user or null.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
    return await SessionService.instance.getCurrentSessionUser();
});

/**
 * Simple boolean check for authentication status.
 *
 * @returns {Promise<boolean>} True if authenticated, false otherwise.
 */
export const isAuthenticated = cache(async (): Promise<boolean> => {
    return await SessionService.instance.verifySession();
});

/**
 * Retrieves the current user with fresh data from the database.
 *
 * Use this when you need critical up-to-date information (e.g., role changes,
 * account status) that might not be reflected in the session cookie yet.
 *
 * @returns {Promise<User | null>} The fresh user record or null.
 */
export const getCurrentUserFromDatabase = cache(async (): Promise<User | null> => {
    const sessionService = SessionService.instance;
    const userService = UserService.instance;

    const sessionUser = await sessionService.getCurrentSessionUser();
    if (!sessionUser) return null;

    return await userService.getUserById(sessionUser.id);
});

/**
 * Enforces authentication for a page or action.
 *
 * If the user is authenticated, returns the user object.
 * If not, automatically redirects the user to the login page.
 *
 * @returns {Promise<User>} The authenticated user.
 */
export const requireAuth = cache(async () => {
    const user = await verifySession();

    if (!user) {
        redirect('/login');
    }

    return user;
});
