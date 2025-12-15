/** @format */
import 'server-only'
import {database} from '@/lib/database'
import {
    User,
    UserCreateType,
    UserUpdateType,
    UserWithProfile
} from '@/lib/domain/user'
import {Prisma} from '@/prisma/generated/client'

/**
 * Repository for managing User entities.
 */
export class UserRepository {
    private static _instance: UserRepository

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
        return database.user.findUnique({where: {id}})
    }

    /**
     * Retrieves a user by their email address.
     *
     * @param email - The email to search for.
     * @returns The user record or null if not found.
     */
    async getByEmail(email: string): Promise<User | null> {
        return database.user.findUnique({where: {email}})
    }

    /**
     * Retrieves a user by ID including their role-specific profile data.
     *
     * @param id - The unique identifier of the user.
     * @returns A user object with the corresponding profile relation loaded (e.g., student, organization).
     */
    async getByIdWithProfile(id: string): Promise<UserWithProfile | null> {
        const partialUser = await database.user.findUnique({
            where: {id},
            select: {role: true},
        })

        if (!partialUser) return null

        switch (partialUser.role) {
            case 'STUDENT':
                return database.user.findUnique({
                    where: {id},
                    include: {student: true}
                })
            case 'COORDINATOR':
                return database.user.findUnique({
                    where: {id},
                    include: {coordinator: true}
                })
            case 'ORGANIZATION':
                return database.user.findUnique({
                    where: {id},
                    include: {organization: true}
                })
            case 'ADMINISTRATOR':
                return database.user.findUnique({
                    where: {id},
                    include: {administrator: true}
                })
            default:
                return database.user.findUnique({
                    where: {id}
                })
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
        tx: Prisma.TransactionClient = database
    ): Promise<User> {
        return tx.user.create({data})
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
        tx: Prisma.TransactionClient = database
    ): Promise<User> {
        return tx.user.update({where: {id}, data})
    }

    /**
     * Deletes a user.
     *
     * @param id - The ID of the user to delete.
     * @param tx - Optional transaction client.
     * @returns The deleted user.
     */
    async delete(id: string, tx: Prisma.TransactionClient = database): Promise<User> {
        return tx.user.delete({where: {id}})
    }
}
