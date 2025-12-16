/** @format */
import 'server-only'
import {database, TransactionClient} from '@/lib/database'
import type {
    Organization,
    OrganizationCreateType,
    OrganizationUpdateType,
    OrganizationWithUser
} from '@/lib/domain/organization'
import {createLogger} from '@/lib/utils/logger'

/**
 * Repository for managing Organization entities.
 */
export class OrganizationRepository {
    private static _instance: OrganizationRepository
    private readonly logger = createLogger('OrganizationRepository')

    private constructor() {
    }

    static get instance(): OrganizationRepository {
        if (!OrganizationRepository._instance) {
            OrganizationRepository._instance = new OrganizationRepository()
        }
        return OrganizationRepository._instance
    }

    /**
     * Retrieves an organization profile by the associated user ID.
     *
     * @param userId - The ID of the user.
     * @returns The organization profile including the user relation.
     */
    async getByUserId(userId: string): Promise<OrganizationWithUser | null> {
        try {
            const org = await database.organization.findUnique({
                where: {userId},
                include: {user: true},
            })

            if (!org) {
                this.logger.debug('Organization not found', { userId })
            }
            return org
        } catch (error) {
            this.logger.error('Failed to retrieve organization by userId', error as Error)
            throw error
        }
    }

    /**
     * Retrieves all organizations pending verification.
     *
     * @returns A list of organizations sorted by creation date descending.
     */
    async getPendingVerification(): Promise<OrganizationWithUser[]> {
        try {
            const pendingOrgs = await database.organization.findMany({
                where: {isVerified: false},
                include: {user: true},
                orderBy: {user: {createdAt: 'desc'}},
            })

            this.logger.debug('Retrieved pending organizations', { count: pendingOrgs.length })
            return pendingOrgs
        } catch (error) {
            this.logger.error('Failed to retrieve pending organizations', error as Error)
            throw error
        }
    }

    /**
     * Creates a new organization profile.
     *
     * @param data - The data to create the organization with.
     * @param tx - Optional transaction client.
     * @returns The created organization profile.
     */
    async create(
        data: OrganizationCreateType,
        tx: TransactionClient = database
    ): Promise<Organization> {
        try {
            const org = await tx.organization.create({data})
            this.logger.info('Organization profile created', {
                userId: data.id,
                orgId: org.id
            })
            return org
        } catch (error) {
            this.logger.error('Failed to create organization', error as Error)
            throw error
        }
    }

    /**
     * Updates an organization profile.
     *
     * @param userId - The ID of the user whose organization profile to update.
     * @param data - The data to update.
     * @param tx - Optional transaction client.
     * @returns The updated organization profile.
     */
    async update(
        userId: string,
        data: OrganizationUpdateType,
        tx: TransactionClient = database
    ): Promise<Organization> {
        try {
            const org = await tx.organization.update({where: {userId}, data})
            this.logger.info('Organization profile updated', { userId })
            return org
        } catch (error) {
            this.logger.error('Failed to update organization', error as Error)
            throw error
        }
    }

    /**
     * Deletes an organization profile.
     * Note: Does not delete the parent User entity.
     *
     * @param userId - The ID of the user whose profile to delete.
     * @param tx - Optional transaction client.
     */
    async delete(userId: string, tx: TransactionClient = database): Promise<Organization> {
        try {
            const org = await tx.organization.delete({where: {userId}})
            this.logger.info('Organization profile deleted', { userId })
            return org
        } catch (error) {
            this.logger.error('Failed to delete organization', error as Error)
            throw error
        }
    }
}
