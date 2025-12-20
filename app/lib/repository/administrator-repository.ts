/** @format */
import 'server-only'
import {database, TransactionClient} from '@/lib/database'
import type {
    Administrator,
    AdministratorCreateType,
    AdministratorUpdateType,
    AdministratorWithUser
} from '@/lib/domain/administrator'
import {createLogger} from '@/lib/utils/logger'

/**
 * Repository for managing Administrator entities.
 */
export class AdministratorRepository {
    private static _instance: AdministratorRepository
    private readonly logger = createLogger('AdministratorRepository')

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
    async getByUserId(userId: string): Promise<AdministratorWithUser | null> {
        try {
            const admin = await database.administrator.findUnique({
                where: {userId},
                include: {user: true},
            })

            if (!admin) {
                this.logger.debug('Administrator not found', { userId })
            }
            return admin
        } catch (error) {
            this.logger.error('Failed to retrieve administrator by userId', error as Error)
            throw error
        }
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
        try {
            const admin = await tx.administrator.create({data})
            this.logger.info('Administrator created successfully', {
                userId: data.id,
                adminId: admin.id
            })
            return admin
        } catch (error) {
            this.logger.error('Failed to create administrator', error as Error)
            throw error
        }
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
        try {
            const admin = await tx.administrator.update({where: {userId}, data})
            this.logger.info('Administrator updated successfully', { userId })
            return admin
        } catch (error) {
            this.logger.error('Failed to update administrator', error as Error)
            throw error
        }
    }

    /**
     * Deletes an administrator profile.
     * Note: Does not delete the parent User entity.
     *
     * @param userId - The ID of the user whose profile to delete.
     * @param tx - Optional transaction client.
     */
    async delete(userId: string, tx: TransactionClient = database): Promise<Administrator> {
        try {
            const admin = await tx.administrator.delete({where: {userId}})
            this.logger.info('Administrator deleted successfully', { userId })
            return admin
        } catch (error) {
            this.logger.error('Failed to delete administrator', error as Error)
            throw error
        }
    }
}
