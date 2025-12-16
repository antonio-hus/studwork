/** @format */
import 'server-only'
import {database, TransactionClient} from '@/lib/database'
import type {Administrator, AdministratorCreateType, AdministratorUpdateType} from '@/lib/domain/administrator'

/**
 * Repository for managing Administrator entities.
 */
export class AdministratorRepository {
    private static _instance: AdministratorRepository

    private constructor() {
    }

    static get instance(): AdministratorRepository {
        if (!AdministratorRepository._instance) {
            AdministratorRepository._instance = new AdministratorRepository()
        }
        return AdministratorRepository._instance
    }

    /**
     * Retrieves an administrator profile by the associated user ID.
     *
     * @param userId - The ID of the user.
     * @returns The administrator profile including the user relation.
     */
    async getByUserId(userId: string): Promise<Administrator | null> {
        return database.administrator.findUnique({
            where: {userId},
            include: {user: true},
        })
    }

    /**
     * Creates a new administrator profile.
     *
     * @param data - The data to create the administrator with.
     * @param tx - Optional transaction client.
     * @returns The created administrator profile.
     */
    async create(
        data: AdministratorCreateType,
        tx: TransactionClient = database
    ): Promise<Administrator> {
        return tx.administrator.create({data})
    }

    /**
     * Updates an administrator profile.
     *
     * @param userId - The ID of the user whose administrator profile to update.
     * @param data - The data to update.
     * @param tx - Optional transaction client.
     * @returns The updated administrator profile.
     */
    async update(
        userId: string,
        data: AdministratorUpdateType,
        tx: TransactionClient = database
    ): Promise<Administrator> {
        return tx.administrator.update({where: {userId}, data})
    }

    /**
     * Deletes an administrator profile.
     * Note: Does not delete the parent User entity.
     *
     * @param userId - The ID of the user whose profile to delete.
     * @param tx - Optional transaction client.
     */
    async delete(userId: string, tx: TransactionClient = database): Promise<Administrator> {
        return tx.administrator.delete({where: {userId}})
    }
}
