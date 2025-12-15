/** @format */
import type {Prisma} from "@/prisma/generated/client";
import {UserCreateType} from "@/lib/domain/user";

/**
 * Re-exporting generated Prisma types for the Student entity.
 */
export type { Student } from "@/prisma/generated/client";

/**
 * Data Transfer Object (DTO) for creating a new Student profile.
 * Usually linked to an existing User ID.
 */
export type StudentCreateType = Prisma.StudentCreateInput;

/**
 * Data Transfer Object (DTO) for updating a Student profile.
 * Used for editing resume URLs, skills, or study programs.
 */
export type StudentUpdateType = Prisma.StudentUpdateInput;

/**
 * Composite Type: Student with their parent User data.
 * Essential for displaying a student's name and email alongside their profile.
 */
export type StudentWithUser = Prisma.StudentGetPayload<{
    include: { user: true };
}>;

/**
 * Composite DTO used by the Service Layer to orchestrate registration.
 */
export type StudentRegistrationInput = {
    user: Omit<UserCreateType, 'role' | 'hashedPassword'> & { password: string };
    student: Omit<StudentCreateType, 'user' | 'userId'>;
};
