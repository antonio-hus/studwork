/** @format */
import React from "react";
import {getTranslations} from "next-intl/server";
import {getPendingOrganizations} from "@/lib/controller/admin/user-management-controller";
import {
    PendingOrganizationsClient
} from "@/components/dashboard/administrator/organization-management/pending-organizations-client";
import {UserRole} from "@/lib/domain/user";

export default async function PendingOrganizationsPage() {
    const t = await getTranslations("admin.organizations");

    // Fetch data server-side
    const response = await getPendingOrganizations();
    const pendingOrgs = response.success && response.data ? response.data : [];

    return (
        <PendingOrganizationsClient
            initialData={pendingOrgs}
            roles={UserRole}
        />
    );
}