/** @format */
import 'server-only'
import {database, TransactionClient} from '@/lib/database'
import type {
    Coordinator,
    CoordinatorCreateType,
    CoordinatorUpdateType,
    CoordinatorWithUser
} from '@/lib/domain/coordinator'

/**
 * Repository for managing Coordinator entities.
 */
export class CoordinatorRepository {
    private static _instance: CoordinatorRepository

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
        return database.coordinator.findUnique({
            where: {userId},
            include: {user: true},
        })
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
        return tx.coordinator.create({data})
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
        return tx.coordinator.update({where: {userId}, data})
    }

    /**
     * Deletes a coordinator profile.
     * Note: Does not delete the parent User entity.
     *
     * @param userId - The ID of the user whose profile to delete.
     * @param tx - Optional transaction client.
     */
    async delete(userId: string, tx: TransactionClient = database): Promise<Coordinator> {
        return tx.coordinator.delete({where: {userId}})
    }
}
