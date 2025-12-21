/** @format */
"use server"

import {getTranslations} from "next-intl/server"
import {redirect} from "next/navigation"
import {AuthService} from "@/lib/service/auth-service"
import {StudentService} from "@/lib/service/student-service"
import {createLogger} from "@/lib/utils/logger"
import {ActionResponse} from "@/lib/domain/actions"
import {UserRole} from "@/lib/domain/user"
import type {StudentUpdateType, StudentWithUser} from "@/lib/domain/student"

const logger = createLogger("StudentProfileController")

/**
 * Ensures the current session user is a student.
 * Returns the authenticated student user.
 */
async function ensureStudent(t: any) {
    const currentUser = await AuthService.instance.getCurrentUser()
    if (!currentUser || currentUser.role !== UserRole.STUDENT) {
        throw new Error(t("errors.auth.student_required"))
    }
    return currentUser
}

/**
 * Retrieves the currently logged-in student's profile (self only).
 */
export async function getMyStudentProfile(): Promise<
    ActionResponse<StudentWithUser>
> {
    const t = await getTranslations()
    try {
        const studentUser = await ensureStudent(t)

        const profile = await StudentService.instance.getStudentProfile(
            studentUser.id
        )

        if (!profile) {
            return {success: false, error: t("errors.auth.user_not_found")}
        }

        return {success: true, data: profile}
    } catch (error) {
        logger.error("Failed to fetch student profile", error as Error)
        return {
            success: false,
            error: (error as Error).message || t("errors.unexpected"),
        }
    }
}

/**
 * Updates the currently logged-in student's profile (self only).
 */
export async function updateMyStudentProfile(
    data: StudentUpdateType
): Promise<ActionResponse<StudentWithUser>> {
    const t = await getTranslations()
    try {
        const studentUser = await ensureStudent(t)

        const updated =
            await StudentService.instance.updateStudentProfile(
                studentUser.id,
                data
            )

        return {success: true, data: updated}
    } catch (error) {
        logger.error("Failed to update student profile", error as Error)
        return {
            success: false,
            error: (error as Error).message || t("errors.unexpected"),
        }
    }
}

/**
 * Permanently deletes the currently logged-in student account (self only).
 */
export async function deleteMyStudentAccount(): Promise<
    ActionResponse<void>
> {
    const t = await getTranslations()
    try {
        const studentUser = await ensureStudent(t)
        await StudentService.instance.deleteStudentAccount(studentUser.id)
        await AuthService.instance.signOut()

        redirect("/")
    } catch (error) {
        logger.error("Failed to delete student account", error as Error)
        return {
            success: false,
            error: (error as Error).message || t("errors.unexpected"),
        }
    }
}
