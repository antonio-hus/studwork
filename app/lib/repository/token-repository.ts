/** @format */
import 'server-only'
import {database} from '@/lib/database'
import type {
    VerificationToken,
    PasswordResetToken,
    VerificationTokenCreateType,
    PasswordResetTokenCreateType
} from '@/lib/domain/token'
import {createLogger} from '@/lib/utils/logger'

/**
 * Repository for managing verification and password reset tokens.
 */
export class TokenRepository {
    private static _instance: TokenRepository
    private readonly logger = createLogger('TokenRepository')

    private constructor() {
    }

    static get instance(): TokenRepository {
        if (!TokenRepository._instance) {
            TokenRepository._instance = new TokenRepository()
        }
        return TokenRepository._instance
    }

    /**
     * Retrieves a verification token by the token string.
     *
     * @param token - The verification token string.
     * @returns The verification token record or null if not found.
     */
    async getVerificationToken(token: string): Promise<VerificationToken | null> {
        try {
            const result = await database.verificationToken.findUnique({
                where: {token},
            })

            if (!result) {
                this.logger.debug('Verification token lookup failed (not found)')
            }
            return result
        } catch (error) {
            this.logger.error('Failed to retrieve verification token', error as Error)
            throw error
        }
    }

    /**
     * Retrieves a verification token by the user ID.
     *
     * @param userId - The ID of the user.
     * @returns The verification token record or null if not found.
     */
    async getVerificationTokenByUserId(userId: string): Promise<VerificationToken | null> {
        try {
            return await database.verificationToken.findFirst({
                where: {userId},
            })
        } catch (error) {
            this.logger.error('Failed to retrieve verification token by userId', error as Error)
            throw error
        }
    }

    /**
     * Creates a new verification token.
     * Removes any existing tokens for the user before creation.
     *
     * @param data - The data to create the token with.
     * @returns The created verification token.
     */
    async createVerificationToken(data: VerificationTokenCreateType): Promise<VerificationToken> {
        try {
            const userId = data.user?.connect?.id

            if (userId) {
                await database.verificationToken.deleteMany({
                    where: {userId},
                })
            }

            const newToken = await database.verificationToken.create({data})

            this.logger.info('Verification token created', { userId })
            return newToken
        } catch (error) {
            this.logger.error('Failed to create verification token', error as Error)
            throw error
        }
    }

    /**
     * Deletes a verification token.
     *
     * @param id - The ID of the token to delete.
     */
    async deleteVerificationToken(id: string): Promise<void> {
        try {
            await database.verificationToken.delete({
                where: {id},
            })
            this.logger.debug('Verification token deleted', { tokenId: id })
        } catch (error) {
            this.logger.error('Failed to delete verification token', error as Error)
            throw error
        }
    }

    /**
     * Retrieves a password reset token by the token string.
     *
     * @param token - The password reset token string.
     * @returns The password reset token record or null if not found.
     */
    async getPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
        try {
            const result = await database.passwordResetToken.findUnique({
                where: {token},
            })

            if (!result) {
                this.logger.debug('Password reset token lookup failed (not found)')
            }
            return result
        } catch (error) {
            this.logger.error('Failed to retrieve password reset token', error as Error)
            throw error
        }
    }

    /**
     * Creates a new password reset token.
     * Removes any existing tokens for the user before creation.
     *
     * @param data - The data to create the token with.
     * @returns The created password reset token.
     */
    async createPasswordResetToken(data: PasswordResetTokenCreateType): Promise<PasswordResetToken> {
        try {
            const userId = data.user?.connect?.id

            if (userId) {
                await database.passwordResetToken.deleteMany({
                    where: {userId},
                })
            }

            const newToken = await database.passwordResetToken.create({data})

            this.logger.info('Password reset token created', { userId })
            return newToken
        } catch (error) {
            this.logger.error('Failed to create password reset token', error as Error)
            throw error
        }
    }

    /**
     * Deletes a password reset token.
     *
     * @param id - The ID of the token to delete.
     */
    async deletePasswordResetToken(id: string): Promise<void> {
        try {
            await database.passwordResetToken.delete({
                where: {id},
            })
            this.logger.debug('Password reset token deleted', { tokenId: id })
        } catch (error) {
            this.logger.error('Failed to delete password reset token', error as Error)
            throw error
        }
    }
}
