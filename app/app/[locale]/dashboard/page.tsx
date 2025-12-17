/** @format */
import {redirect} from 'next/navigation';
import {requireAuth} from '@/lib/controller/auth/session-controller';
import {UserRole} from '@/lib/domain/user';
import {StudentDashboard} from '@/components/dashboard/student/student-dashboard';
import {CoordinatorDashboard} from '@/components/dashboard/coordinator/coordinator-dashboard';
import {OrganizationDashboard} from '@/components/dashboard/organization/organization-dashboard';
import {AdminDashboard} from '@/components/dashboard/administrator/admin-dashboard';
import {JSX} from "react";

/**
 * Dashboard Entry Point Page
 *
 * This Server Component acts as the main gateway for the `/dashboard` route.
 * Its primary responsibility is to authenticate the user and route them
 * to the appropriate dashboard view based on their assigned system role.
 *
 * **Flow:**
 * 1. **Authentication:** Verifies the session using `requireAuth()`.
 * 2. **Authorization:** Inspects `user.role` to determine privileges.
 * 3. **Routing:** Returns the specific dashboard component for that role.
 *
 * **Security:**
 * - If no session exists, `requireAuth` throws a redirect to `/login`.
 * - If the role is unrecognized or invalid, it defaults to redirecting to `/login`.
 *
 * @returns {Promise<JSX.Element>} The role-specific dashboard component.
 */
export default async function DashboardPage(): Promise<JSX.Element> {
    const user = await requireAuth();

    switch (user.role) {
        case UserRole.STUDENT:
            return <StudentDashboard user={user}/>;
        case UserRole.COORDINATOR:
            return <CoordinatorDashboard user={user}/>;
        case UserRole.ORGANIZATION:
            return <OrganizationDashboard user={user}/>;
        case UserRole.ADMINISTRATOR:
            return <AdminDashboard user={user}/>;
        default:
            redirect('/login');
    }
}
