/** @format */
"use server"

import {getTranslations} from "next-intl/server"
import {redirect} from "next/navigation"
import {AuthService} from "@/lib/service/auth-service"
import {AdministratorService} from "@/lib/service/admin-service"
import {createLogger} from "@/lib/utils/logger"
import {ActionResponse} from "@/lib/domain/actions"
import {UserRole} from "@/lib/domain/user"
import type {AdministratorUpdateType, AdministratorWithUser} from "@/lib/domain/administrator"

const logger = createLogger("AdminProfileController")

/**
 * Ensures the current session user is an administrator.
 * Returns the authenticated admin user.
 */
async function ensureAdmin(t: any) {
    const currentUser = await AuthService.instance.getCurrentUser()
    if (!currentUser || currentUser.role !== UserRole.ADMINISTRATOR) {
        throw new Error(t("errors.auth.admin_required"))
    }
    return currentUser
}

/**
 * Retrieves the currently logged-in administrator's profile (self only).
 */
export async function getMyAdministratorProfile(): Promise<
    ActionResponse<AdministratorWithUser>
> {
    const t = await getTranslations()
    try {
        const adminUser = await ensureAdmin(t)

        const profile = await AdministratorService.instance.getAdministratorProfile(
            adminUser.id
        )

        if (!profile) {
            return {success: false, error: t("errors.auth.user_not_found")}
        }

        return {success: true, data: profile}
    } catch (error) {
        logger.error("Failed to fetch admin profile", error as Error)
        return {
            success: false,
            error: (error as Error).message || t("errors.unexpected"),
        }
    }
}

/**
 * Updates the currently logged-in administrator's profile (self only).
 */
export async function updateMyAdministratorProfile(
    data: AdministratorUpdateType
): Promise<ActionResponse<AdministratorWithUser>> {
    const t = await getTranslations()
    try {
        const adminUser = await ensureAdmin(t)

        const updated =
            await AdministratorService.instance.updateAdministratorProfile(
                adminUser.id,
                data
            )

        return {success: true, data: updated}
    } catch (error) {
        logger.error("Failed to update admin profile", error as Error)
        return {
            success: false,
            error: (error as Error).message || t("errors.unexpected"),
        }
    }
}

/**
 * Permanently deletes the currently logged-in administrator account (self only).
 *
 * Notes:
 * - This deletes the User row; related Administrator row is cascaded by Prisma relation.
 * - After deletion, we redirect away because the session may still exist briefly.
 * - If you have an AuthService logout/invalidate method, call it before redirecting.
 */
export async function deleteMyAdministratorAccount(): Promise<
    ActionResponse<void>
> {
    const t = await getTranslations()
    try {
        const adminUser = await ensureAdmin(t)
        await AdministratorService.instance.deleteAdministratorAccount(adminUser.id)
        await AuthService.instance.signOut()

        redirect("/")
    } catch (error) {
        logger.error("Failed to delete admin account", error as Error)
        return {
            success: false,
            error: (error as Error).message || t("errors.unexpected"),
        }
    }
}
