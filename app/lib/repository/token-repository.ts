/** @format */
import 'server-only'
import {database} from '@/lib/database'
import {
    VerificationToken,
    PasswordResetToken,
    VerificationTokenCreateType,
    PasswordResetTokenCreateType
} from '@/lib/domain/token'

/**
 * Repository for managing verification and password reset tokens.
 */
export class TokenRepository {
    private static _instance: TokenRepository

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
        return database.verificationToken.findUnique({
            where: {token},
        })
    }

    /**
     * Retrieves a verification token by the user ID.
     *
     * @param userId - The ID of the user.
     * @returns The verification token record or null if not found.
     */
    async getVerificationTokenByUserId(userId: string): Promise<VerificationToken | null> {
        return database.verificationToken.findFirst({
            where: {userId},
        })
    }

    /**
     * Creates a new verification token.
     * Removes any existing tokens for the user before creation.
     *
     * @param data - The data to create the token with.
     * @returns The created verification token.
     */
    async createVerificationToken(data: VerificationTokenCreateType): Promise<VerificationToken> {
        if (data.user?.connect?.id) {
            await database.verificationToken.deleteMany({
                where: {userId: data.user.connect.id},
            })
        }

        return database.verificationToken.create({data})
    }

    /**
     * Deletes a verification token.
     *
     * @param id - The ID of the token to delete.
     */
    async deleteVerificationToken(id: string): Promise<void> {
        await database.verificationToken.delete({
            where: {id},
        })
    }

    /**
     * Retrieves a password reset token by the token string.
     *
     * @param token - The password reset token string.
     * @returns The password reset token record or null if not found.
     */
    async getPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
        return database.passwordResetToken.findUnique({
            where: {token},
        })
    }

    /**
     * Creates a new password reset token.
     * Removes any existing tokens for the user before creation.
     *
     * @param data - The data to create the token with.
     * @returns The created password reset token.
     */
    async createPasswordResetToken(data: PasswordResetTokenCreateType): Promise<PasswordResetToken> {
        if (data.user?.connect?.id) {
            await database.passwordResetToken.deleteMany({
                where: {userId: data.user.connect.id},
            })
        }

        return database.passwordResetToken.create({data})
    }

    /**
     * Deletes a password reset token.
     *
     * @param id - The ID of the token to delete.
     */
    async deletePasswordResetToken(id: string): Promise<void> {
        await database.passwordResetToken.delete({
            where: {id},
        })
    }
}
