/** @format */
import {database} from '@/lib/database'
import type {CoordinatorRegistrationInput, CoordinatorUpdateType, CoordinatorWithUser} from '@/lib/domain/coordinator'
import {CoordinatorRepository} from '@/lib/repository/coordinator-repository'
import {UserRepository} from '@/lib/repository/user-repository'
import {hashPassword} from '@/lib/utils/password'
import {createLogger} from '@/lib/utils/logger'

/**
 * Service for managing Coordinator (Staff) business logic.
 */
export class CoordinatorService {
    private static _instance: CoordinatorService
    private readonly logger = createLogger('CoordinatorService')

    private constructor() {
    }

    static get instance(): CoordinatorService {
        if (!CoordinatorService._instance) {
            CoordinatorService._instance = new CoordinatorService()
        }
        return CoordinatorService._instance
    }

    /**
     * Registers a new coordinator.
     * Atomically creates the User and Coordinator entities.
     *
     * @param input - The composite registration data.
     * @returns The created coordinator profile with user details.
     */
    async registerCoordinator(
        input: CoordinatorRegistrationInput
    ): Promise<CoordinatorWithUser> {
        try {
            const result = await database.$transaction(async (tx) => {
                const {password, ...userData} = input.user
                const hashedPassword = await hashPassword(password)

                const user = await UserRepository.instance.create(
                    {...userData, hashedPassword, role: 'COORDINATOR',}, tx
                )

                const coordinator = await CoordinatorRepository.instance.create(
                    {...input.coordinator, user: {connect: {id: user.id}},}, tx
                )

                return {...coordinator, user}
            })

            this.logger.info('Coordinator registered successfully', { userId: result.user.id })
            return result
        } catch (error) {
            this.logger.error('Failed to register coordinator', error as Error)
            throw error
        }
    }

    /**
     * Retrieves a coordinator's full profile by User ID.
     */
    async getCoordinatorProfile(userId: string): Promise<CoordinatorWithUser | null> {
        return CoordinatorRepository.instance.getByUserId(userId)
    }

    /**
     * Updates a coordinator's profile.
     */
    async updateCoordinatorProfile(
        userId: string,
        data: CoordinatorUpdateType
    ): Promise<CoordinatorWithUser> {
        try {
            const existingProfile = await CoordinatorRepository.instance.getByUserId(userId)
            if (!existingProfile) {
                this.logger.warn('Attempted to update non-existent coordinator', { userId })
                throw new Error(`Coordinator profile not found for user ${userId}`)
            }

            const coordinator = await CoordinatorRepository.instance.update(userId, data)

            this.logger.info('Coordinator profile updated', { userId })
            return {...coordinator, user: existingProfile.user}
        } catch (error) {
            this.logger.error('Failed to update coordinator profile', error as Error)
            throw error
        }
    }

    /**
     * Permanently deletes a coordinator account.
     */
    async deleteCoordinatorAccount(userId: string): Promise<void> {
        try {
            await UserRepository.instance.delete(userId)
            this.logger.warn('Coordinator account permanently deleted', { userId })
        } catch (error) {
            this.logger.error('Failed to delete coordinator account', error as Error)
            throw error
        }
    }
}
