/** @format */
import 'server-only'
import {database, TransactionClient} from '@/lib/database'
import type {
    Student,
    StudentCreateType,
    StudentUpdateType,
    StudentWithUser
} from '@/lib/domain/student'

/**
 * Repository for managing Student entities.
 */
export class StudentRepository {
    private static _instance: StudentRepository

    private constructor() {
    }

    static get instance(): StudentRepository {
        if (!StudentRepository._instance) {
            StudentRepository._instance = new StudentRepository()
        }
        return StudentRepository._instance
    }

    /**
     * Retrieves a student profile by the associated user ID.
     *
     * @param userId - The ID of the user.
     * @returns The student profile including the user relation.
     */
    async getByUserId(userId: string): Promise<StudentWithUser | null> {
        return database.student.findUnique({
            where: {userId},
            include: {user: true},
        })
    }

    /**
     * Creates a new student profile.
     *
     * @param data - The data to create the student with.
     * @param tx - Optional transaction client.
     * @returns The created student profile.
     */
    async create(
        data: StudentCreateType,
        tx: TransactionClient = database
    ): Promise<Student> {
        return tx.student.create({data})
    }

    /**
     * Updates a student profile.
     *
     * @param userId - The ID of the user whose student profile to update.
     * @param data - The data to update.
     * @param tx - Optional transaction client.
     * @returns The updated student profile.
     */
    async update(
        userId: string,
        data: StudentUpdateType,
        tx: TransactionClient = database
    ): Promise<Student> {
        return tx.student.update({where: {userId}, data})
    }

    /**
     * Deletes a student profile.
     * Note: Does not delete the parent User entity.
     *
     * @param userId - The ID of the user whose profile to delete.
     * @param tx - Optional transaction client.
     */
    async delete(userId: string, tx: TransactionClient = database): Promise<Student> {
        return tx.student.delete({where: {userId}})
    }
}
