/** @format */

import 'server-only'
import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
    CipherGCM,
    DecipherGCM
} from 'crypto'

/**
 * AES-256-GCM encryption algorithm identifier.
 * @type {string}
 */
const ALGORITHM: string = 'aes-256-gcm'

/**
 * 32-byte encryption key loaded from `APP_ENCRYPTION_KEY` environment variable.
 * Must be provided as a hex-encoded hex string.
 * @type {Buffer}
 */
const KEY: Buffer = Buffer.from(process.env.APP_ENCRYPTION_KEY!, 'hex')

/**
 * Encrypts a UTF-8 string using the AES-256-GCM authenticated encryption mode.
 *
 * AES-GCM provides both confidentiality and integrity. The function returns
 * a formatted string containing the IV, authentication tag, and ciphertext.
 *
 * Output format:
 * ```
 * IV:AuthTag:EncryptedData
 * ```
 * All values are hex-encoded.
 *
 * @function encrypt
 * @param {string} text - The plaintext string to encrypt.
 * @returns {string} A string formatted as `iv:authTag:data`.
 * @throws {Error} If encryption fails.
 */
export function encrypt(text: string): string {
    // 96-bit IV recommended for GCM
    const iv = randomBytes(12)

    // Explicitly assert GCM type
    const cipher = createCipheriv(ALGORITHM, KEY, iv) as CipherGCM

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag().toString('hex')

    return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

/**
 * Decrypts a string produced by the {@link encrypt} function.
 *
 * The function expects a payload formatted as:
 * ```
 * IV:AuthTag:EncryptedData
 * ```
 * where each component is hex-encoded.
 *
 * AES-GCM validates data integrity using the authentication tag. If the
 * tag does not match (e.g., due to tampering or incorrect key), decryption
 * will fail.
 *
 * @function decrypt
 * @param {string} text - The encrypted payload in `iv:authTag:data` format.
 * @returns {string} The decrypted UTF-8 plaintext.
 * @throws {Error} If authentication fails or input is malformed.
 */
export function decrypt(text: string): string {
    const [ivHex, authTagHex, encryptedHex] = text.split(':')

    const decipher = createDecipheriv(
        ALGORITHM,
        KEY,
        Buffer.from(ivHex, 'hex')
    ) as DecipherGCM

    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
}