/** @format */
import {User, UserCreateType, UserUpdateType} from '@/lib/domain/user'
import {UserRepository} from '@/lib/repository/user-repository'

/**
 * Service for generic User operations (Authentication, Profile Management).
 */
export class UserService {
    private static _instance: UserService

    private constructor() {
    }

    static get instance(): UserService {
        if (!UserService._instance) {
            UserService._instance = new UserService()
        }
        return UserService._instance
    }

    /**
     * Retrieves a user by email.
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
        return UserRepository.instance.create(data)
    }

    /**
     * Updates generic user details.
     */
    async updateUser(id: string, data: UserUpdateType): Promise<User> {
        return UserRepository.instance.update(id, data)
    }

    /**
     * Suspends a user account, preventing login access.
     *
     * @param targetUserId - The ID of the user to suspend.
     * @throws Error if the actor is not an administrator.
     */
    async suspendUser(targetUserId: string): Promise<User> {
        return UserRepository.instance.update(targetUserId, { isSuspended: true })
    }

    /**
     * Restores access to a suspended user account.
     *
     * @param targetUserId - The ID of the user to unsuspend.
     * @throws Error if the actor is not an administrator.
     */
    async unsuspendUser(targetUserId: string): Promise<User> {
        return UserRepository.instance.update(targetUserId, { isSuspended: false })
    }
}
