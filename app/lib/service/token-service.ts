/** @format */
import 'server-only'
import {TokenRepository} from '@/lib/repository/token-repository'
import {generateToken} from "@/lib/utils/crypto";
import {createLogger} from '@/lib/utils/logger'

/**
 * Configuration for token expiration and security.
 */
const TOKEN_CONFIG = {
    VERIFICATION: {
        EXPIRY_HOURS: 24,
    },
    PASSWORD_RESET: {
        EXPIRY_HOURS: 1,
    },
    BYTE_LENGTH: 32,
} as const

/**
 * Service for managing all authentication-related tokens.
 * Handles generation, validation, and lifecycle of Verification and Password Reset tokens.
 */
export class TokenService {
    private static _instance: TokenService
    private readonly logger = createLogger('TokenService')

    private constructor() {
    }

    static get instance(): TokenService {
        if (!TokenService._instance) {
            TokenService._instance = new TokenService()
        }
        return TokenService._instance
    }

    /**
     * Creates and stores a new email verification token.
     * Note: The Repository automatically cleans up existing tokens for this user.
     *
     * @param userId - ID of the user to create the token for.
     * @returns The created verification token entity.
     */
    async createVerificationToken(userId: string) {
        try {
            const token = generateToken(TOKEN_CONFIG.BYTE_LENGTH)
            const expiresAt = new Date(
                Date.now() + TOKEN_CONFIG.VERIFICATION.EXPIRY_HOURS * 60 * 60 * 1000
            )

            const result = await TokenRepository.instance.createVerificationToken({
                token,
                expiresAt,
                user: {connect: {id: userId}},
            })

            this.logger.debug('Generated verification token', { userId })
            return result
        } catch (error) {
            this.logger.error('Failed to generate verification token', error as Error)
            throw error
        }
    }

    /**
     * Verifies a verification token string.
     * Checks for existence and expiration.
     *
     * @param token - The token string to verify.
     * @returns Object containing validity status, userId (if valid), and potential error code.
     */
    async verifyVerificationToken(token: string) {
        try {
            const tokenRecord = await TokenRepository.instance.getVerificationToken(token)

            if (!tokenRecord) {
                this.logger.debug('Verification token invalid or not found')
                return {
                    valid: false,
                    error: 'auth.invalidToken',
                }
            }

            // Check if token is expired
            if (tokenRecord.expiresAt < new Date()) {
                await TokenRepository.instance.deleteVerificationToken(tokenRecord.id)
                this.logger.debug('Verification token expired', { userId: tokenRecord.userId })
                return {
                    valid: false,
                    error: 'auth.tokenExpired',
                }
            }

            return {
                valid: true,
                userId: tokenRecord.userId,
                tokenId: tokenRecord.id,
            }
        } catch (error) {
            this.logger.error('Error verifying verification token', error as Error)
            throw error
        }
    }

    /**
     * Deletes a verification token by its string value.
     *
     * @param token - The token string to delete.
     */
    async deleteVerificationToken(token: string): Promise<void> {
        try {
            const tokenRecord = await TokenRepository.instance.getVerificationToken(token)
            if (tokenRecord) {
                await TokenRepository.instance.deleteVerificationToken(tokenRecord.id)
            }
        } catch (error) {
            this.logger.error('Failed to delete verification token', error as Error)
        }
    }

    /**
     * Creates and stores a new password reset token.
     * Note: The Repository automatically cleans up existing tokens for this user.
     *
     * @param userId - ID of the user to create the token for.
     * @returns The created password reset token entity.
     */
    async createPasswordResetToken(userId: string) {
        try {
            const token = generateToken(TOKEN_CONFIG.BYTE_LENGTH)
            const expiresAt = new Date(
                Date.now() + TOKEN_CONFIG.PASSWORD_RESET.EXPIRY_HOURS * 60 * 60 * 1000
            )

            const result = await TokenRepository.instance.createPasswordResetToken({
                token,
                expiresAt,
                user: {connect: {id: userId}},
            })

            this.logger.debug('Generated password reset token', { userId })
            return result
        } catch (error) {
            this.logger.error('Failed to generate password reset token', error as Error)
            throw error
        }
    }

    /**
     * Verifies a password reset token string.
     * Checks for existence and expiration.
     *
     * @param token - The token string to verify.
     * @returns Object containing validity status, userId (if valid), and potential error code.
     */
    async verifyPasswordResetToken(token: string) {
        try {
            const tokenRecord = await TokenRepository.instance.getPasswordResetToken(token)

            if (!tokenRecord) {
                this.logger.debug('Password reset token invalid or not found')
                return {
                    valid: false,
                    error: 'auth.invalidResetToken',
                }
            }

            // Check if token is expired
            if (tokenRecord.expiresAt < new Date()) {
                await TokenRepository.instance.deletePasswordResetToken(tokenRecord.id)
                this.logger.debug('Password reset token expired', { userId: tokenRecord.userId })
                return {
                    valid: false,
                    error: 'auth.tokenExpired',
                }
            }

            return {
                valid: true,
                userId: tokenRecord.userId,
                tokenId: tokenRecord.id,
            }
        } catch (error) {
            this.logger.error('Error verifying password reset token', error as Error)
            throw error
        }
    }

    /**
     * Deletes a password reset token by its string value.
     *
     * @param token - The token string to delete.
     */
    async deletePasswordResetToken(token: string): Promise<void> {
        try {
            const tokenRecord = await TokenRepository.instance.getPasswordResetToken(token)
            if (tokenRecord) {
                await TokenRepository.instance.deletePasswordResetToken(tokenRecord.id)
            }
        } catch (error) {
            this.logger.error('Failed to delete password reset token', error as Error)
        }
    }
}
