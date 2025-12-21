/** @format */
"use server"

import {getTranslations} from "next-intl/server"
import {redirect} from "next/navigation"
import {AuthService} from "@/lib/service/auth-service"
import {CoordinatorService} from "@/lib/service/coordinator-service"
import {createLogger} from "@/lib/utils/logger"
import {ActionResponse} from "@/lib/domain/actions"
import {UserRole} from "@/lib/domain/user"
import type {CoordinatorUpdateType, CoordinatorWithUser} from "@/lib/domain/coordinator"

const logger = createLogger("CoordinatorProfileController")

/**
 * Ensures the current session user is a coordinator.
 * Returns the authenticated coordinator user.
 */
async function ensureCoordinator(t: any) {
    const currentUser = await AuthService.instance.getCurrentUser()
    if (!currentUser || currentUser.role !== UserRole.COORDINATOR) {
        throw new Error(t("errors.auth.coordinator_required"))
    }
    return currentUser
}

/**
 * Retrieves the currently logged-in coordinator's profile (self only).
 */
export async function getMyCoordinatorProfile(): Promise<
    ActionResponse<CoordinatorWithUser>
> {
    const t = await getTranslations()
    try {
        const coordinatorUser = await ensureCoordinator(t)

        const profile = await CoordinatorService.instance.getCoordinatorProfile(
            coordinatorUser.id
        )

        if (!profile) {
            return {success: false, error: t("errors.auth.user_not_found")}
        }

        return {success: true, data: profile}
    } catch (error) {
        logger.error("Failed to fetch coordinator profile", error as Error)
        return {
            success: false,
            error: (error as Error).message || t("errors.unexpected"),
        }
    }
}

/**
 * Updates the currently logged-in coordinator's profile (self only).
 */
export async function updateMyCoordinatorProfile(
    data: CoordinatorUpdateType
): Promise<ActionResponse<CoordinatorWithUser>> {
    const t = await getTranslations()
    try {
        const coordinatorUser = await ensureCoordinator(t)

        const updated =
            await CoordinatorService.instance.updateCoordinatorProfile(
                coordinatorUser.id,
                data
            )

        return {success: true, data: updated}
    } catch (error) {
        logger.error("Failed to update coordinator profile", error as Error)
        return {
            success: false,
            error: (error as Error).message || t("errors.unexpected"),
        }
    }
}

/**
 * Permanently deletes the currently logged-in coordinator account (self only).
 */
export async function deleteMyCoordinatorAccount(): Promise<
    ActionResponse<void>
> {
    const t = await getTranslations()
    try {
        const coordinatorUser = await ensureCoordinator(t)
        await CoordinatorService.instance.deleteCoordinatorAccount(coordinatorUser.id)
        await AuthService.instance.signOut()

        redirect("/")
    } catch (error) {
        logger.error("Failed to delete coordinator account", error as Error)
        return {
            success: false,
            error: (error as Error).message || t("errors.unexpected"),
        }
    }
}
