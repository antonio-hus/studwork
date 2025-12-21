/** @format */
import React, {JSX} from "react";
import {redirect} from 'next/navigation';
import {requireAuth} from '@/lib/controller/auth/session-controller';
import {UserRole} from '@/lib/domain/user';
import {AdminProfile} from "@/components/dashboard/administrator/profile/administrator-profile";
import {StudentProfile} from "@/components/dashboard/student/student-profile";
import {CoordinatorProfile} from "@/components/dashboard/coordinator/coordinator-profile";
import {OrganizationProfile} from "@/components/dashboard/organization/organization-profile";
import {getMyAdministratorProfile} from "@/lib/controller/admin/admin-profile-controller";
import {getMyStudentProfile} from "@/lib/controller/student/student-profile-controller";
import {getMyCoordinatorProfile} from "@/lib/controller/coordinator/coordinator-profile-controller";
import {getMyOrganizationProfile} from "@/lib/controller/organization/organization-profile-controller";
import {OrganizationType} from "@/lib/domain/organization";

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
                return <AdminProfile admin={result.data}/>;
            }

            console.error("Failed to load admin profile:", result.error);
            redirect('/dashboard');
            break;
        }

        case UserRole.STUDENT: {
            const result = await getMyStudentProfile();

            if (result.success) {
                return <StudentProfile student={result.data}/>;
            }

            console.error("Failed to load student profile:", result.error);
            redirect('/dashboard');
            break;
        }

        case UserRole.COORDINATOR: {
            const result = await getMyCoordinatorProfile();

            if (result.success) {
                return <CoordinatorProfile coordinator={result.data}/>;
            }

            console.error("Failed to load coordinator profile:", result.error);
            redirect('/dashboard');
            break;
        }

        case UserRole.ORGANIZATION: {
            const result = await getMyOrganizationProfile();

            if (result.success) {
                return <OrganizationProfile organization={result.data} organizationTypes={OrganizationType}/>;
            }

            console.error("Failed to load organization profile:", result.error);
            redirect('/dashboard');
            break;
        }

        default:
            redirect('/login');
            break;
    }
}
