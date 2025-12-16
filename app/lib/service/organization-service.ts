/** @format */
import 'server-only'
import {database} from '@/lib/database'
import type {
    OrganizationRegistrationInput,
    OrganizationUpdateType,
    OrganizationWithUser
} from '@/lib/domain/organization'
import {OrganizationRepository} from '@/lib/repository/organization-repository'
import {UserRepository} from '@/lib/repository/user-repository'
import {hashPassword} from '@/lib/utils/password'

/**
 * Service for managing Organization-related business logic.
 */
export class OrganizationService {
    private static _instance: OrganizationService

    private constructor() {
    }

    static get instance(): OrganizationService {
        if (!OrganizationService._instance) {
            OrganizationService._instance = new OrganizationService()
        }
        return OrganizationService._instance
    }

    /**
     * Registers a new organization.
     * Atomically creates the User and Organization entities.
     *
     * @param input - The composite registration data.
     * @returns The created organization profile with user details.
     */
    async registerOrganization(
        input: OrganizationRegistrationInput
    ): Promise<OrganizationWithUser> {
        return database.$transaction(async (tx) => {
            const {password, ...userData} = input.user
            const hashedPassword = await hashPassword(password)

            const user = await UserRepository.instance.create(
                {...userData, hashedPassword, role: 'ORGANIZATION',}, tx
            )

            const organization = await OrganizationRepository.instance.create(
                {...input.organization, user: {connect: {id: user.id}},}, tx
            )

            return {...organization, user}
        })
    }

    /**
     * Retrieves an organization's full profile by User ID.
     */
    async getOrganizationProfile(userId: string): Promise<OrganizationWithUser | null> {
        return OrganizationRepository.instance.getByUserId(userId)
    }

    /**
     * Updates an organization's profile.
     */
    async updateOrganizationProfile(
        userId: string,
        data: OrganizationUpdateType
    ): Promise<OrganizationWithUser> {
        const existingProfile = await OrganizationRepository.instance.getByUserId(userId)
        if (!existingProfile) {
            throw new Error(`Organization profile not found for user ${userId}`)
        }

        const org = await OrganizationRepository.instance.update(userId, data)
        return {...org, user: existingProfile.user}
    }

    /**
     * Verifies an organization account.
     * Restricted to Administrators.
     *
     * @param userId - The ID of the organization to verify.
     * @throws Error if the actor is not an administrator.
     */
    async verifyOrganization(userId: string): Promise<void> {
        await OrganizationRepository.instance.update(userId, {
            isVerified: true,
            verifiedAt: new Date(),
        })
    }

    /**
     * Retrieves all organizations that are pending verification.
     */
    async getPendingVerifications(): Promise<OrganizationWithUser[]> {
        return OrganizationRepository.instance.getPendingVerification()
    }

    /**
     * Permanently deletes an organization account.
     */
    async deleteOrganizationAccount(userId: string): Promise<void> {
        await UserRepository.instance.delete(userId)
    }
}
