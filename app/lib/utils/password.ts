/** @format */

/**
 * Password Security Utilities.
 *
 * Provides secure hashing and verification mechanisms using bcryptjs.
 *
 * @module utils/password
 */
import bcrypt from "bcryptjs"

/**
 * The cost factor for the bcrypt algorithm.
 * 12 rounds is currently considered the industry standard for a balance
 * between security (resistance to brute-force) and server performance.
 */
const SALT_ROUNDS = 12

/**
 * Securely hashes a plain text password.
 *
 * Uses bcrypt with a salt work factor of 12. This function is asynchronous
 * to prevent blocking the event loop during the CPU-intensive hashing process.
 *
 * @async
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} The resulting bcrypt hash string.
 *
 * @example
 * const hash = await hashPassword("mySecretPass123");
 * // Result: "$2a$12$..."
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verifies a plain text password against a stored hash.
 *
 * Securely compares the provided candidate password with the bcrypt hash
 * stored in the database.
 *
 * @async
 * @param {string} password - The plain text password input by the user.
 * @param {string} hashedPassword - The stored hash to compare against.
 * @returns {Promise<boolean>} True if the password matches, False otherwise.
 *
 * @example
 * const isValid = await verifyPassword("inputPass", storedHash);
 */
export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}
