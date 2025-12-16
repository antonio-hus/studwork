/** @format */
import 'server-only'
import {database} from '@/lib/database'
import type {StudentRegistrationInput, StudentUpdateType, StudentWithUser} from '@/lib/domain/student'
import {StudentRepository} from '@/lib/repository/student-repository'
import {UserRepository} from '@/lib/repository/user-repository'
import {hashPassword} from '@/lib/utils/password'
import {createLogger} from '@/lib/utils/logger'

/**
 * Service for managing Student-related business logic and transactions.
 */
export class StudentService {
    private static _instance: StudentService
    private readonly logger = createLogger('StudentService')

    private constructor() {
    }

    static get instance(): StudentService {
        if (!StudentService._instance) {
            StudentService._instance = new StudentService()
        }
        return StudentService._instance
    }

    /**
     * Registers a new student.
     * Atomically creates the User and Student entities within a single transaction.
     *
     * @param input - The composite registration data.
     * @returns The created student profile with user details.
     */
    async registerStudent(input: StudentRegistrationInput): Promise<StudentWithUser> {
        try {
            const result = await database.$transaction(async (tx) => {
                const {password, ...userData} = input.user
                const hashedPassword = await hashPassword(password)

                const user = await UserRepository.instance.create(
                    {...userData, hashedPassword, role: 'STUDENT',}, tx
                )

                const student = await StudentRepository.instance.create(
                    {...input.student, user: {connect: {id: user.id}},}, tx
                )

                return {...student, user}
            })

            this.logger.info('Student registered successfully', { userId: result.user.id })
            return result
        } catch (error) {
            this.logger.error('Failed to register student', error as Error)
            throw error
        }
    }

    /**
     * Retrieves a student's full profile by their User ID.
     *
     * @param userId - The unique identifier of the user.
     * @returns The student profile or null if not found.
     */
    async getStudentProfile(userId: string): Promise<StudentWithUser | null> {
        return StudentRepository.instance.getByUserId(userId)
    }

    /**
     * Updates a student's profile information.
     *
     * @param userId - The ID of the user.
     * @param data - The update payload.
     * @returns The updated student entity.
     * @throws Error if the user does not exist or is not a student.
     */
    async updateStudentProfile(
        userId: string,
        data: StudentUpdateType
    ): Promise<StudentWithUser> {
        try {
            const existingProfile = await StudentRepository.instance.getByUserId(userId)
            if (!existingProfile) {
                this.logger.warn('Attempted to update non-existent student profile', { userId })
                throw new Error(`Student profile not found for user ${userId}`)
            }

            const student = await StudentRepository.instance.update(userId, data)

            this.logger.info('Student profile updated', { userId })
            return {...student, user: existingProfile.user}
        } catch (error) {
            this.logger.error('Failed to update student profile', error as Error)
            throw error
        }
    }

    /**
     * Permanently deletes a student account and their user record.
     *
     * @param userId - The ID of the user to delete.
     */
    async deleteStudentAccount(userId: string): Promise<void> {
        try {
            await UserRepository.instance.delete(userId)
            this.logger.warn('Student account permanently deleted', { userId })
        } catch (error) {
            this.logger.error('Failed to delete student account', error as Error)
            throw error
        }
    }
}
