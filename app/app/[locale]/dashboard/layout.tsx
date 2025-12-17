/** @format */
import React, {JSX} from "react";
import {redirect} from "next/navigation";
import {requireAuth} from "@/lib/controller/auth/session-controller";
import {getConfig} from "@/lib/controller/config-controller";
import {getNavItemsForRole} from "@/lib/utils/navigation";
import {DashboardShell} from "@/components/dashboard/dashboard-shell";

/**
 * Dashboard Layout Component
 *
 * This is the root layout for all authenticated dashboard pages.
 * It serves as a data controller, performing critical server-side operations
 * before rendering the client-side dashboard shell.
 *
 * **Responsibilities:**
 * 1. **Authentication Check** - Verifies user session and redirects if invalid
 * 2. **Email Verification** - Ensures users have verified their email addresses
 * 3. **Configuration Loading** - Fetches global app configuration (branding, colors, etc.)
 * 4. **Role-Based Navigation** - Determines which menu items to show based on user role
 * 5. **Shell Initialization** - Passes all required data to the interactive DashboardShell
 *
 * **Security:**
 * - Throws redirect to `/login` if session is invalid (handled by requireAuth)
 * - Restricts access to `/verify-email-pending` if email is not verified
 *
 * **Performance:**
 * - Server Component - all data fetching happens on the server
 * - Configuration is cached and shared across all dashboard pages
 * - Navigation items are generated once per role
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Dashboard page content to render within the shell
 * @returns {Promise<JSX.Element>} The dashboard shell with nested page content
 */
export default async function DashboardLayout({children,}: { children: React.ReactNode; }): Promise<JSX.Element> {
    // Verify Authentication
    const user = await requireAuth();

    // Enforce Email Verification
    if (!user.emailVerified) {
        redirect("/verify-email-pending");
    }

    // Fetch Global Configuration
    const configResult = await getConfig();
    const config = configResult.success ? configResult.data : null;

    // Determine Navigation Items
    const navItems = getNavItemsForRole(user.role);

    // Render Dashboard Shell
    return (
        <DashboardShell user={user} config={config} navItems={navItems}>
            {children}
        </DashboardShell>
    );
}
