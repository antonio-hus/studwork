/** @format */
import 'server-only'
import {database, TransactionClient} from '@/lib/database'
import type {
    Coordinator,
    CoordinatorCreateType,
    CoordinatorUpdateType,
    CoordinatorWithUser
} from '@/lib/domain/coordinator'
import {createLogger} from '@/lib/utils/logger'

/**
 * Repository for managing Coordinator entities.
 */
export class CoordinatorRepository {
    private static _instance: CoordinatorRepository
    private readonly logger = createLogger('CoordinatorRepository')

    private constructor() {
    }

    static get instance(): CoordinatorRepository {
        if (!CoordinatorRepository._instance) {
            CoordinatorRepository._instance = new CoordinatorRepository()
        }
        return CoordinatorRepository._instance
    }

    /**
     * Retrieves a coordinator profile by the associated user ID.
     *
     * @param userId - The ID of the user.
     * @returns The coordinator profile including the user relation.
     */
    async getByUserId(userId: string): Promise<CoordinatorWithUser | null> {
        try {
            const coordinator = await database.coordinator.findUnique({
                where: {userId},
                include: {user: true},
            })

            if (!coordinator) {
                this.logger.debug('Coordinator not found', { userId })
            }
            return coordinator
        } catch (error) {
            this.logger.error('Failed to retrieve coordinator by userId', error as Error)
            throw error
        }
    }

    /**
     * Creates a new coordinator profile.
     *
     * @param data - The data to create the coordinator with.
     * @param tx - Optional transaction client.
     * @returns The created coordinator profile.
     */
    async create(
        data: CoordinatorCreateType,
        tx: TransactionClient = database
    ): Promise<Coordinator> {
        try {
            const coordinator = await tx.coordinator.create({data})
            this.logger.info('Coordinator profile created', {
                userId: data.id,
                coordinatorId: coordinator.id
            })
            return coordinator
        } catch (error) {
            this.logger.error('Failed to create coordinator', error as Error)
            throw error
        }
    }

    /**
     * Updates a coordinator profile.
     *
     * @param userId - The ID of the user whose coordinator profile to update.
     * @param data - The data to update.
     * @param tx - Optional transaction client.
     * @returns The updated coordinator profile.
     */
    async update(
        userId: string,
        data: CoordinatorUpdateType,
        tx: TransactionClient = database
    ): Promise<Coordinator> {
        try {
            const coordinator = await tx.coordinator.update({where: {userId}, data})
            this.logger.info('Coordinator profile updated', { userId })
            return coordinator
        } catch (error) {
            this.logger.error('Failed to update coordinator', error as Error)
            throw error
        }
    }

    /**
     * Deletes a coordinator profile.
     * Note: Does not delete the parent User entity.
     *
     * @param userId - The ID of the user whose profile to delete.
     * @param tx - Optional transaction client.
     */
    async delete(userId: string, tx: TransactionClient = database): Promise<Coordinator> {
        try {
            const coordinator = await tx.coordinator.delete({where: {userId}})
            this.logger.info('Coordinator profile deleted', { userId })
            return coordinator
        } catch (error) {
            this.logger.error('Failed to delete coordinator', error as Error)
            throw error
        }
    }
}
