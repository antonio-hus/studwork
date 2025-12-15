/** @format */
import {UserRole} from '@/lib/domain/user'
import {UserRepository} from '@/lib/repository/user-repository'

/**
 * Helper to resolve the role of a user from the database.
 *
 * @param userId - The ID of the user to check.
 * @returns {Promise<UserRole>} The user's role.
 * @throws {Error} If user is not found.
 */
async function resolveRole(userId: string): Promise<UserRole> {
    const user = await UserRepository.instance.getByIdWithProfile(userId)
    if (!user) {
        throw new Error('errors.auth.user_not_found')
    }
    return user.role
}

/**
 * Enforces that the user has the ADMINISTRATOR role.
 *
 * @param userId - The ID of the actor.
 * @throws {Error} 'errors.auth.admin_required' if unauthorized.
 */
export async function requireAdmin(userId: string): Promise<void> {
    const role = await resolveRole(userId)
    if (role !== 'ADMINISTRATOR') {
        throw new Error('errors.auth.admin_required')
    }
}

/**
 * Enforces that the user has the COORDINATOR role.
 *
 * @param userId - The ID of the actor.
 * @throws {Error} 'errors.auth.coordinator_required' if unauthorized.
 */
export async function requireCoordinator(userId: string): Promise<void> {
    const role = await resolveRole(userId)
    if (role !== 'COORDINATOR') {
        throw new Error('errors.auth.coordinator_required')
    }
}

/**
 * Enforces that the user has the ORGANIZATION role.
 *
 * @param userId - The ID of the actor.
 * @throws {Error} 'errors.auth.organization_required' if unauthorized.
 */
export async function requireOrganization(userId: string): Promise<void> {
    const role = await resolveRole(userId)
    if (role !== 'ORGANIZATION') {
        throw new Error('errors.auth.organization_required')
    }
}

/**
 * Enforces that the user has the STUDENT role.
 *
 * @param userId - The ID of the actor.
 * @throws {Error} 'errors.auth.student_required' if unauthorized.
 */
export async function requireStudent(userId: string): Promise<void> {
    const role = await resolveRole(userId)
    if (role !== 'STUDENT') {
        throw new Error('errors.auth.student_required')
    }
}

/**
 * Enforces that the actor is either the Owner of the resource OR an Administrator.
 *
 * @param actorId - The ID of the user attempting the action.
 * @param resourceOwnerId - The ID of the user who owns the resource.
 * @throws {Error} 'errors.auth.forbidden_resource' if unauthorized.
 */
export async function requireOwnerOrAdmin(
    actorId: string,
    resourceOwnerId: string
): Promise<void> {
    // Ownership Check
    if (actorId === resourceOwnerId) {
        return
    }

    // Admin Check
    const role = await resolveRole(actorId)
    if (role === 'ADMINISTRATOR') {
        return
    }

    throw new Error('errors.auth.forbidden_resource')
}
