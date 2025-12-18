/** @format */
"use server"

import {getTranslations} from 'next-intl/server'
import {revalidatePath} from 'next/cache'
import {AuthService} from '@/lib/service/auth-service'
import {UserService} from '@/lib/service/user-service'
import {UserFilterOptions, UserSortField} from '@/lib/repository/user-repository'
import {createLogger} from '@/lib/utils/logger'
import {ActionResponse} from '@/lib/domain/actions'
import {User, UserRole, UserWithProfile} from '@/lib/domain/user'
import {PaginationParams, PaginationResult} from '@/lib/domain/pagination'
import {OrganizationWithUser} from "@/lib/domain/organization";
import {OrganizationService} from "@/lib/service/organization-service";
import {EmailService} from "@/lib/service/email-service";

const logger = createLogger('UserManagementController')

/**
 * Checks if the current session user has administrator privileges.
 * Throws an error if authentication fails or if the role is insufficient.
 *
 * @param t - The translation function for error messages.
 * @returns The authenticated admin user.
 */
async function ensureAdmin(t: any) {
    const currentUser = await AuthService.instance.getCurrentUser()
    if (!currentUser || currentUser.role !== UserRole.ADMINISTRATOR) {
        throw new Error(t('errors.auth.admin_required'))
    }
    return currentUser
}

/**
 * Retrieves a paginated list of users based on the provided filters.
 * Restricted to administrators.
 *
 * @param pageParams - Pagination configuration (page, pageSize).
 * @param filters - Filtering criteria (role, search, status).
 * @param sort - Sorting configuration.
 * @returns A response containing the paginated user list.
 */
export async function getUsers(
    pageParams: PaginationParams,
    filters: UserFilterOptions = {},
    sort: { field: UserSortField; direction: 'asc' | 'desc' } = {field: 'createdAt', direction: 'desc'}
): Promise<ActionResponse<PaginationResult<User>>> {
    const t = await getTranslations()
    try {
        await ensureAdmin(t)

        const result = await UserService.instance.getUsers(pageParams, filters, sort)

        return {success: true, data: result}
    } catch (error) {
        logger.error('Failed to fetch users', error as Error)
        return {success: false, error: (error as Error).message || t('errors.unexpected')}
    }
}

/**
 * Retrieves all organizations waiting for approval.
 */
export async function getPendingOrganizations(): Promise<ActionResponse<OrganizationWithUser[]>> {
    const t = await getTranslations()
    try {
        await ensureAdmin(t)
        const pending = await OrganizationService.instance.getPendingVerifications()
        return { success: true, data: pending }
    } catch (error) {
        logger.error('Failed to fetch pending organizations', error as Error)
        return { success: false, error: (error as Error).message || t('errors.unexpected') }
    }
}

/**
 * Verifies (Approves) an organization account.
 * Marks both the User as email-verified and the Organization as verified.
 */
export async function verifyOrganization(userId: string): Promise<ActionResponse<void>> {
    const t = await getTranslations()
    try {
        await ensureAdmin(t)

        const userService = UserService.instance
        const orgService = OrganizationService.instance

        const targetUser = await userService.getUserById(userId)

        if (!targetUser) return {success: false, error: t('errors.auth.user_not_found')}
        if (targetUser.role !== UserRole.ORGANIZATION) return {success: false, error: 'Not an organization'}

        await orgService.verifyOrganization(userId)

        revalidatePath('/admin/users')
        revalidatePath('/admin/organizations/pending')
        return {success: true, data: undefined}
    } catch (error) {
        logger.error('Failed to verify organization', error as Error)
        return {success: false, error: (error as Error).message || t('errors.unexpected') }
    }
}

/**
 * Rejects an organization application.
 * Deletes the account and sends a rejection email.
 */
export async function rejectOrganization(userId: string, reason: string): Promise<ActionResponse<void>> {
    const t = await getTranslations()
    try {
        await ensureAdmin(t)

        const user = await UserService.instance.getUserById(userId)
        if (!user) return { success: false, error: t('errors.auth.user_not_found') }

        // Send Rejection Email
        await EmailService.instance.sendOrganizationRejected(user.email, user.name || 'Applicant', reason)

        // Delete the account
        await OrganizationService.instance.deleteOrganizationAccount(userId)

        revalidatePath('/admin/users')
        revalidatePath('/admin/organizations/pending')
        return { success: true, data: undefined }
    } catch (error) {
        logger.error('Failed to reject organization', error as Error)
        return { success: false, error: (error as Error).message || t('errors.unexpected') }
    }
}

/**
 * Toggles the suspension status of a user account.
 * Restricted to administrators. Cannot be used on self.
 *
 * @param userId - The ID of the user to suspend/unsuspend.
 * @param suspend - True to suspend, false to restore access.
 * @param reason - Optional reason for suspension (sent via email).
 * @returns A response indicating success or failure.
 */
export async function toggleUserSuspension(
    userId: string,
    suspend: boolean,
    reason?: string
): Promise<ActionResponse<void>> {
    const t = await getTranslations()
    try {
        const admin = await ensureAdmin(t)
        if (admin.id === userId) return {success: false, error: 'Cannot suspend self'}

        const userService = UserService.instance
        const targetUser = await userService.getUserById(userId)

        if (!targetUser) return {success: false, error: t('errors.auth.user_not_found')}

        if (suspend) {
            await userService.suspendUser(userId, reason)
        } else {
            await userService.unsuspendUser(userId)
        }

        revalidatePath('/admin/users')
        return {success: true, data: undefined}
    } catch (error) {
        logger.error('Failed to toggle suspension', error as Error)
        return {success: false, error: (error as Error).message || t('errors.unexpected')}
    }
}

/**
 * Fetches the complete user profile including role-specific details.
 * Restricted to administrators.
 *
 * @param userId - The ID of the user to fetch.
 * @returns The full user object with nested profile relations.
 */
export async function getUserDetails(userId: string): Promise<ActionResponse<UserWithProfile>> {
    const t = await getTranslations()
    try {
        await ensureAdmin(t)

        const userService = UserService.instance
        const userProfile = await userService.getUserProfile(userId)

        if (!userProfile) {
            return { success: false, error: t('errors.auth.user_not_found') }
        }

        return { success: true, data: userProfile }
    } catch (error) {
        logger.error('Failed to fetch user details', error as Error)
        return { success: false, error: (error as Error).message || t('errors.unexpected') }
    }
}
