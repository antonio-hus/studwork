/** @format */
"use server"

import {getTranslations} from "next-intl/server"
import {redirect} from "next/navigation"
import {AuthService} from "@/lib/service/auth-service"
import {OrganizationService} from "@/lib/service/organization-service"
import {createLogger} from "@/lib/utils/logger"
import {ActionResponse} from "@/lib/domain/actions"
import {UserRole} from "@/lib/domain/user"
import type {OrganizationUpdateType, OrganizationWithUser} from "@/lib/domain/organization"

const logger = createLogger("OrganizationProfileController")

/**
 * Ensures the current session user is an organization.
 * Returns the authenticated organization user.
 */
async function ensureOrganization(t: any) {
    const currentUser = await AuthService.instance.getCurrentUser()
    if (!currentUser || currentUser.role !== UserRole.ORGANIZATION) {
        throw new Error(t("errors.auth.organization_required"))
    }
    return currentUser
}

/**
 * Retrieves the currently logged-in organization's profile (self only).
 */
export async function getMyOrganizationProfile(): Promise<
    ActionResponse<OrganizationWithUser>
> {
    const t = await getTranslations()
    try {
        const organizationUser = await ensureOrganization(t)

        const profile = await OrganizationService.instance.getOrganizationProfile(
            organizationUser.id
        )

        if (!profile) {
            return {success: false, error: t("errors.auth.user_not_found")}
        }

        return {success: true, data: profile}
    } catch (error) {
        logger.error("Failed to fetch organization profile", error as Error)
        return {
            success: false,
            error: (error as Error).message || t("errors.unexpected"),
        }
    }
}

/**
 * Updates the currently logged-in organization's profile (self only).
 */
export async function updateMyOrganizationProfile(
    data: OrganizationUpdateType
): Promise<ActionResponse<OrganizationWithUser>> {
    const t = await getTranslations()
    try {
        const organizationUser = await ensureOrganization(t)

        const updated =
            await OrganizationService.instance.updateOrganizationProfile(
                organizationUser.id,
                data
            )

        return {success: true, data: updated}
    } catch (error) {
        logger.error("Failed to update organization profile", error as Error)
        return {
            success: false,
            error: (error as Error).message || t("errors.unexpected"),
        }
    }
}

/**
 * Permanently deletes the currently logged-in organization account (self only).
 */
export async function deleteMyOrganizationAccount(): Promise<
    ActionResponse<void>
> {
    const t = await getTranslations()
    try {
        const organizationUser = await ensureOrganization(t)
        await OrganizationService.instance.deleteOrganizationAccount(organizationUser.id)
        await AuthService.instance.signOut()

        redirect("/")
    } catch (error) {
        logger.error("Failed to delete organization account", error as Error)
        return {
            success: false,
            error: (error as Error).message || t("errors.unexpected"),
        }
    }
}
