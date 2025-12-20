/** @format */
import React, {JSX} from "react";
import {redirect} from 'next/navigation';
import {requireAuth} from '@/lib/controller/auth/session-controller';
import {UserRole} from '@/lib/domain/user';
import {StudentDashboard} from '@/components/dashboard/student/student-dashboard';
import {CoordinatorDashboard} from '@/components/dashboard/coordinator/coordinator-dashboard';
import {OrganizationDashboard} from '@/components/dashboard/organization/organization-dashboard';
import {AdminSettings} from "@/components/dashboard/administrator/settings/admin-settings";
import {AdminProfile} from "@/components/dashboard/administrator/profile/administrator-profile";
import {getMyAdministratorProfile} from "@/lib/controller/admin/admin-profile-controller";

/**
 * Profile Page
 *
 * This Server Component acts as the main gateway for the `/profile` route.
 * Its primary responsibility is to authenticate the user and route them
 * to the appropriate settings view based on their assigned system role.
 *
 * **Flow:**
 * 1. **Authentication:** Verifies the session using `requireAuth()`.
 * 2. **Authorization:** Inspects `user.role` to determine privileges.
 * 3. **Routing:** Returns the specific profile component for that role.
 *
 * **Security:**
 * - If no session exists, `requireAuth` throws a redirect to `/login`.
 * - If the role is unrecognized or invalid, it defaults to redirecting to `/login`.
 *
 * @returns {Promise<JSX.Element>} The role-specific profile component.
 */
export default async function ProfilePage(): Promise<JSX.Element> {
    const user = await requireAuth();

    switch (user.role) {
        case UserRole.ADMINISTRATOR: {
            const result = await getMyAdministratorProfile();

            if (result.success) {
                return <AdminProfile admin={result.data} />;
            }

            console.error("Failed to load admin profile:", result.error);
            redirect('/dashboard');
        }

        case UserRole.STUDENT:
            // Future: const student = await getMyStudentProfile();
            // return <StudentProfile student={student.data} />;
            return <StudentDashboard user={user} />;

        case UserRole.COORDINATOR:
            // Future: const coordinator = await getMyCoordinatorProfile();
            return <CoordinatorDashboard user={user} />;

        case UserRole.ORGANIZATION:
            // Future: const org = await getMyOrganizationProfile();
            return <OrganizationDashboard user={user} />;

        default:
            redirect('/login');
    }
}
