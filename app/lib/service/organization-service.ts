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
import {createLogger} from '@/lib/utils/logger'
import {EmailService} from "@/lib/service/email-service";

/**
 * Service for managing Organization-related business logic.
 */
export class OrganizationService {
    private static _instance: OrganizationService
    private readonly logger = createLogger('OrganizationService')

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
        try {
            const result = await database.$transaction(async (tx) => {
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

            this.logger.info('Organization registered successfully', {
                userId: result.user.id,
                orgId: result.id
            })
            return result
        } catch (error) {
            this.logger.error('Failed to register organization', error as Error)
            throw error
        }
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
        try {
            const existingProfile = await OrganizationRepository.instance.getByUserId(userId)
            if (!existingProfile) {
                this.logger.warn('Attempted to update non-existent organization', { userId })
                throw new Error(`Organization profile not found for user ${userId}`)
            }

            const org = await OrganizationRepository.instance.update(userId, data)

            this.logger.info('Organization profile updated', { userId })
            return {...org, user: existingProfile.user}
        } catch (error) {
            this.logger.error('Failed to update organization profile', error as Error)
            throw error
        }
    }

    /**
     * Verifies an organization account.
     * Restricted to Administrators.
     *
     * @param userId - The ID of the organization to verify.
     */
    async verifyOrganization(userId: string): Promise<void> {
        try {
            await OrganizationRepository.instance.update(userId, {
                isVerified: true,
                verifiedAt: new Date(),
            })

            const user = await UserRepository.instance.update(userId, {
                emailVerified: new Date()
            })

            await EmailService.instance.sendOrganizationApproved(
                user.email,
                user.name || 'Organization'
            )

            this.logger.info('Organization verified', { userId })
        } catch (error) {
            this.logger.error('Failed to verify organization', error as Error)
            throw error
        }
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
        try {
            await UserRepository.instance.delete(userId)
            this.logger.warn('Organization account permanently deleted', { userId })
        } catch (error) {
            this.logger.error('Failed to delete organization account', error as Error)
            throw error
        }
    }
}
