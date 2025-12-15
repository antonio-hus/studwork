/** @format */
import 'server-only'
import {database} from '@/lib/database'
import {
    Organization,
    OrganizationCreateType,
    OrganizationUpdateType,
    OrganizationWithUser
} from '@/lib/domain/organization'
import {Prisma} from '@/prisma/generated/client'

/**
 * Repository for managing Organization entities.
 */
export class OrganizationRepository {
    private static _instance: OrganizationRepository

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
        return database.organization.findUnique({
            where: {userId},
            include: {user: true},
        })
    }

    /**
     * Retrieves all organizations pending verification.
     *
     * @returns A list of organizations sorted by creation date descending.
     */
    async getPendingVerification(): Promise<OrganizationWithUser[]> {
        return database.organization.findMany({
            where: {isVerified: false},
            include: {user: true},
            orderBy: {user: {createdAt: 'desc'}},
        })
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
        tx: Prisma.TransactionClient = database
    ): Promise<Organization> {
        return tx.organization.create({data})
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
        tx: Prisma.TransactionClient = database
    ): Promise<Organization> {
        return tx.organization.update({where: {userId}, data})
    }

    /**
     * Deletes an organization profile.
     * Note: Does not delete the parent User entity.
     *
     * @param userId - The ID of the user whose profile to delete.
     * @param tx - Optional transaction client.
     */
    async delete(userId: string, tx: Prisma.TransactionClient = database): Promise<Organization> {
        return tx.organization.delete({where: {userId}})
    }
}
