/** @format */
import {redirect} from 'next/navigation';
import {requireAuth} from '@/lib/controller/auth/session-controller';
import {UserRole} from '@/lib/domain/user';
import {StudentDashboard} from '@/components/dashboard/student/student-dashboard';
import {CoordinatorDashboard} from '@/components/dashboard/coordinator/coordinator-dashboard';
import {OrganizationDashboard} from '@/components/dashboard/organization/organization-dashboard';
import {AdminDashboard} from '@/components/dashboard/administrator/admin-dashboard';
import {JSX} from "react";
import {AdminSettings} from "@/components/dashboard/administrator/settings/admin-settings";

/**
 * Settings Page
 *
 * This Server Component acts as the main gateway for the `/settings` route.
 * Its primary responsibility is to authenticate the user and route them
 * to the appropriate settings view based on their assigned system role.
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
 * @returns {Promise<JSX.Element>} The role-specific settings component.
 */
export default async function SettingsPage(): Promise<JSX.Element> {
    const user = await requireAuth();

    switch (user.role) {
        case UserRole.STUDENT:
            return <StudentDashboard user={user}/>;
        case UserRole.COORDINATOR:
            return <CoordinatorDashboard user={user}/>;
        case UserRole.ORGANIZATION:
            return <OrganizationDashboard user={user}/>;
        case UserRole.ADMINISTRATOR:
            return <AdminSettings user={user}/>;
        default:
            redirect('/login');
    }
}
