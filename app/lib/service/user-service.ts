/** @format */
import 'server-only'
import type {User, UserCreateType, UserUpdateType} from '@/lib/domain/user'
import {UserRepository} from '@/lib/repository/user-repository'
import {createLogger} from '@/lib/utils/logger'

/**
 * Service for generic User operations
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
     * Retrieves a user by ID.
     */
    async getUserById(id: string): Promise<User | null> {
        return UserRepository.instance.getById(id)
    }

    /**
     * Retrieves a user by email.
     */
    async getUserByEmail(email: string): Promise<User | null> {
        return UserRepository.instance.getByEmail(email)
    }

    /**
     * Retrieves a full user profile by ID.
     */
    async getUserProfile(id: string) {
        return UserRepository.instance.getByIdWithProfile(id)
    }

    /**
     * Creates generic user details.
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
     * Suspends a user account, preventing login access.
     *
     * @param targetUserId - The ID of the user to suspend.
     */
    async suspendUser(targetUserId: string): Promise<User> {
        try {
            const user = await UserRepository.instance.update(targetUserId, {isSuspended: true})
            this.logger.warn('User suspended', { userId: targetUserId })
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
     */
    async unsuspendUser(targetUserId: string): Promise<User> {
        try {
            const user = await UserRepository.instance.update(targetUserId, {isSuspended: false})
            this.logger.info('User unsuspended', { userId: targetUserId })
            return user
        } catch (error) {
            this.logger.error('Failed to unsuspend user', error as Error)
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
            this.logger.warn('User permanently deleted', { userId })
        } catch (error) {
            this.logger.error('Failed to delete user', error as Error)
            throw error
        }
    }
}
