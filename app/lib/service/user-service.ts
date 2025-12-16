/** @format */
import 'server-only'
import type {User, UserCreateType, UserUpdateType} from '@/lib/domain/user'
import {UserRepository, UserFilterOptions, UserSortField} from '@/lib/repository/user-repository'
import {createLogger} from '@/lib/utils/logger'
import {PaginationParams, PaginationResult} from '@/lib/domain/pagination'
import {EmailService} from '@/lib/service/email-service'

/**
 * Service for generic User operations.
 * Handles business logic related to user management, including creation, updates,
 * suspension, and notifications.
 */
export class UserService {
    private static _instance: UserService
    private readonly logger = createLogger('UserService')

    private constructor() {
    }

    static get instance(): UserService {
        if (!UserService._instance) {
            UserService._instance = new UserService()
        }
        return UserService._instance
    }

    /**
     * Retrieves paginated users with support for filtering and sorting.
     *
     * @param pageParams - Pagination settings (page, pageSize).
     * @param filters - Optional filtering criteria.
     * @param sort - Sorting configuration.
     * @returns A paginated list of users.
     */
    async getUsers(
        pageParams: PaginationParams,
        filters: UserFilterOptions = {},
        sort: { field: UserSortField; direction: 'asc' | 'desc' } = {field: 'createdAt', direction: 'desc'}
    ): Promise<PaginationResult<User>> {
        return UserRepository.instance.findMany(pageParams, filters, sort)
    }

    /**
     * Retrieves a user by their unique ID.
     *
     * @param id - The user ID.
     * @returns The user or null if not found.
     */
    async getUserById(id: string): Promise<User | null> {
        return UserRepository.instance.getById(id)
    }

    /**
     * Retrieves a user by their email address.
     *
     * @param email - The email address.
     * @returns The user or null if not found.
     */
    async getUserByEmail(email: string): Promise<User | null> {
        return UserRepository.instance.getByEmail(email)
    }

    /**
     * Retrieves a full user profile by ID, including role-specific relations.
     *
     * @param id - The user ID.
     * @returns The user with their specific profile loaded.
     */
    async getUserProfile(id: string) {
        return UserRepository.instance.getByIdWithProfile(id)
    }

    /**
     * Creates generic user details.
     *
     * @param data - The user creation payload.
     * @returns The created user.
     */
    async createUser(data: UserCreateType): Promise<User> {
        try {
            return await UserRepository.instance.create(data)
        } catch (error) {
            this.logger.error('Failed to create user', error as Error)
            throw error
        }
    }

    /**
     * Updates generic user details.
     *
     * @param id - The user ID.
     * @param data - The update payload.
     * @returns The updated user.
     */
    async updateUser(id: string, data: UserUpdateType): Promise<User> {
        try {
            return await UserRepository.instance.update(id, data)
        } catch (error) {
            this.logger.error('Failed to update user', error as Error)
            throw error
        }
    }

    /**
     * Suspends a user account, preventing login access, and sends a notification email.
     *
     * @param targetUserId - The ID of the user to suspend.
     * @param reason - Optional reason for suspension to be included in the email.
     * @returns The updated (suspended) user.
     */
    async suspendUser(targetUserId: string, reason?: string): Promise<User> {
        try {
            const user = await UserRepository.instance.update(targetUserId, {isSuspended: true})

            await EmailService.instance.sendAccountSuspended(
                user.email,
                user.name || 'User',
                reason || 'Terms Violation'
            )

            this.logger.warn('User suspended', {userId: targetUserId})
            return user
        } catch (error) {
            this.logger.error('Failed to suspend user', error as Error)
            throw error
        }
    }

    /**
     * Restores access to a suspended user account.
     *
     * @param targetUserId - The ID of the user to unsuspend.
     * @returns The updated (active) user.
     */
    async unsuspendUser(targetUserId: string): Promise<User> {
        try {
            const user = await UserRepository.instance.update(targetUserId, {isSuspended: false})
            this.logger.info('User unsuspended', {userId: targetUserId})
            return user
        } catch (error) {
            this.logger.error('Failed to unsuspend user', error as Error)
            throw error
        }
    }

    /**
     * Verifies an organization account and sends an approval email.
     *
     * @param userId - The ID of the organization user to verify.
     * @returns The updated verified user.
     */
    async verifyOrganization(userId: string): Promise<User> {
        try {
            const user = await UserRepository.instance.update(userId, {
                emailVerified: new Date()
            })

            await EmailService.instance.sendOrganizationApproved(
                user.email,
                user.name || 'Organization'
            )

            this.logger.info('Organization verified', {userId})
            return user
        } catch (error) {
            this.logger.error('Failed to verify organization', error as Error)
            throw error
        }
    }

    /**
     * Permanently deletes a user account.
     *
     * @param userId - The ID of the user to delete.
     */
    async deleteUser(userId: string): Promise<void> {
        try {
            await UserRepository.instance.delete(userId)
            this.logger.warn('User permanently deleted', {userId})
        } catch (error) {
            this.logger.error('Failed to delete user', error as Error)
            throw error
        }
    }
}
