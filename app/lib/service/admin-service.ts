/** @format */
import 'server-only'
import type {AdministratorUpdateType, AdministratorWithUser} from '@/lib/domain/administrator'
import {AdministratorRepository} from '@/lib/repository/administrator-repository'
import {UserRepository} from '@/lib/repository/user-repository'
import {createLogger} from '@/lib/utils/logger'

/**
 * Service for managing Administrator-related business logic and transactions.
 */
export class AdministratorService {
    private static _instance: AdministratorService
    private readonly logger = createLogger('AdministratorService')

    private constructor() {
    }

    static get instance(): AdministratorService {
        if (!AdministratorService._instance) {
            AdministratorService._instance = new AdministratorService()
        }
        return AdministratorService._instance
    }

    /**
     * Retrieves a administrator's full profile by their User ID.
     *
     * @param userId - The unique identifier of the user.
     * @returns The administrator profile or null if not found.
     */
    async getAdministratorProfile(userId: string): Promise<AdministratorWithUser | null> {
        return AdministratorRepository.instance.getByUserId(userId)
    }

    /**
     * Updates a administrator's profile information.
     *
     * @param userId - The ID of the user.
     * @param data - The update payload.
     * @returns The updated administrator entity.
     * @throws Error if the user does not exist or is not a administrator.
     */
    async updateAdministratorProfile(
        userId: string,
        data: AdministratorUpdateType
    ): Promise<AdministratorWithUser> {
        try {
            const existingProfile = await AdministratorRepository.instance.getByUserId(userId)
            if (!existingProfile) {
                this.logger.warn('Attempted to update non-existent administrator profile', { userId })
                throw new Error(`Administrator profile not found for user ${userId}`)
            }

            const administrator = await AdministratorRepository.instance.update(userId, data)

            this.logger.info('Administrator profile updated', { userId })
            return {...administrator, user: existingProfile.user}
        } catch (error) {
            this.logger.error('Failed to update administrator profile', error as Error)
            throw error
        }
    }

    /**
     * Permanently deletes a administrator account and their user record.
     *
     * @param userId - The ID of the user to delete.
     */
    async deleteAdministratorAccount(userId: string): Promise<void> {
        try {
            await UserRepository.instance.delete(userId)
            this.logger.warn('Administrator account permanently deleted', { userId })
        } catch (error) {
            this.logger.error('Failed to delete administrator account', error as Error)
            throw error
        }
    }
}
