/** @format */
import 'server-only'
import {database, TransactionClient} from '@/lib/database'
import type {
    User,
    UserCreateType,
    UserUpdateType,
    UserWithProfile
} from '@/lib/domain/user'
import {UserRole} from '@/lib/domain/user'
import {createLogger} from '@/lib/utils/logger'

/**
 * Repository for managing User entities.
 */
export class UserRepository {
    private static _instance: UserRepository
    private readonly logger = createLogger('UserRepository')

    private constructor() {
    }

    static get instance(): UserRepository {
        if (!UserRepository._instance) {
            UserRepository._instance = new UserRepository()
        }
        return UserRepository._instance
    }

    /**
     * Retrieves a user by their identifier.
     *
     * @param id - The identifier to search for.
     * @returns The user record or null if not found.
     */
    async getById(id: string): Promise<User | null> {
        try {
            return await database.user.findUnique({where: {id}})
        } catch (error) {
            this.logger.error('Failed to retrieve user by ID', error as Error)
            throw error
        }
    }

    /**
     * Retrieves a user by their email address.
     *
     * @param email - The email to search for.
     * @returns The user record or null if not found.
     */
    async getByEmail(email: string): Promise<User | null> {
        try {
            return await database.user.findUnique({where: {email}})
        } catch (error) {
            this.logger.error('Failed to retrieve user by email', error as Error)
            throw error
        }
    }

    /**
     * Retrieves a user by ID including their role-specific profile data.
     *
     * @param id - The unique identifier of the user.
     * @returns A user object with the corresponding profile relation loaded (e.g., student, organization).
     */
    async getByIdWithProfile(id: string): Promise<UserWithProfile | null> {
        try {
            const partialUser = await database.user.findUnique({
                where: {id},
                select: {role: true},
            })

            if (!partialUser) {
                this.logger.debug('User profile lookup failed (user not found)', { userId: id })
                return null
            }

            switch (partialUser.role) {
                case UserRole.STUDENT:
                    return database.user.findUnique({
                        where: {id},
                        include: {student: true}
                    })
                case UserRole.COORDINATOR:
                    return database.user.findUnique({
                        where: {id},
                        include: {coordinator: true}
                    })
                case UserRole.ORGANIZATION:
                    return database.user.findUnique({
                        where: {id},
                        include: {organization: true}
                    })
                case UserRole.ADMINISTRATOR:
                    return database.user.findUnique({
                        where: {id},
                        include: {administrator: true}
                    })
                default:
                    return database.user.findUnique({
                        where: {id}
                    })
            }
        } catch (error) {
            this.logger.error('Failed to retrieve user profile', error as Error)
            throw error
        }
    }

    /**
     * Creates a new user.
     *
     * @param data - The data to create the user with.
     * @param tx - Optional transaction client.
     * @returns The created user.
     */
    async create(
        data: UserCreateType,
        tx: TransactionClient = database
    ): Promise<User> {
        try {
            const user = await tx.user.create({data})
            this.logger.info('User created', { userId: user.id, role: user.role })
            return user
        } catch (error) {
            this.logger.error('Failed to create user', error as Error)
            throw error
        }
    }

    /**
     * Updates a user.
     *
     * @param id - The ID of the user to update.
     * @param data - The data to update.
     * @param tx - Optional transaction client.
     * @returns The updated user.
     */
    async update(
        id: string,
        data: UserUpdateType,
        tx: TransactionClient = database
    ): Promise<User> {
        try {
            const user = await tx.user.update({where: {id}, data})
            this.logger.info('User updated', { userId: id })
            return user
        } catch (error) {
            this.logger.error('Failed to update user', error as Error)
            throw error
        }
    }

    /**
     * Deletes a user.
     *
     * @param id - The ID of the user to delete.
     * @param tx - Optional transaction client.
     * @returns The deleted user.
     */
    async delete(id: string, tx: TransactionClient = database): Promise<User> {
        try {
            const user = await tx.user.delete({where: {id}})
            this.logger.info('User deleted', { userId: id })
            return user
        } catch (error) {
            this.logger.error('Failed to delete user', error as Error)
            throw error
        }
    }
}
