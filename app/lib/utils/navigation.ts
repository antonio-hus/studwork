/** @format */
import {UserRole} from '@/lib/domain/user'

/**
 * Represents a single navigation item in the sidebar.
 */
export type NavItem = {
    /**
     * Translation key for the item label (e.g., 'dashboard' -> 'Dashboard').
     * Used to lookup localized text in the 'dashboard.nav' namespace.
     */
    titleKey: string

    /**
     * The internal route path the link points to.
     * Also acts as the unique identifier for mapping icons in the Sidebar component.
     */
    href: string

    /**
     * List of user roles authorized to see this navigation item.
     * If the current user's role is not in this list, the item is hidden.
     */
    roles: UserRole[]
}

/**
 * Static configuration of all available navigation items in the application.
 * Defines the route structure and access control rules for the main sidebar.
 */
export const NAVIGATION_ITEMS: NavItem[] = [
    {
        titleKey: 'dashboard',
        href: '/dashboard',
        roles: [UserRole.STUDENT, UserRole.COORDINATOR, UserRole.ORGANIZATION, UserRole.ADMINISTRATOR]
    },
    {
        titleKey: 'users',
        href: '/dashboard/admin/users',
        roles: [UserRole.ADMINISTRATOR]
    },
    {
        titleKey: 'opportunities',
        href: '/dashboard/opportunities',
        roles: [UserRole.STUDENT, UserRole.COORDINATOR, UserRole.ORGANIZATION]
    },
    {
        titleKey: 'applications',
        href: '/dashboard/applications',
        roles: [UserRole.STUDENT, UserRole.ORGANIZATION]
    },
    {
        titleKey: 'profile',
        href: '/dashboard/profile',
        roles: [UserRole.STUDENT, UserRole.COORDINATOR, UserRole.ORGANIZATION]
    },
    {
        titleKey: 'settings',
        href: '/dashboard/settings',
        roles: [UserRole.STUDENT, UserRole.COORDINATOR, UserRole.ORGANIZATION, UserRole.ADMINISTRATOR]
    }
]

/**
 * Filters the global navigation items to return only those visible to a specific user role.
 *
 * @param role - The role of the currently authenticated user.
 * @returns An array of navigation items authorized for the given role.
 */
export function getNavItemsForRole(role: UserRole): NavItem[] {
    if (!role) return []
    return NAVIGATION_ITEMS.filter(item => item.roles.includes(role))
}
