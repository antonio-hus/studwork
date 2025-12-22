/** @format */
"use server"
import React from 'react';
import {getUsers} from '@/lib/controller/admin/user-management-controller';
import {UserManagementClient} from '@/components/dashboard/administrator/user-management/user-management-client';
import {UserRole} from '@/lib/domain/user';

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Renders the user management page.
 *
 * This async server component is responsible for fetching a paginated and
 * filtered list of users based on the URL search parameters. It then delegates
 * the rendering and interactive logic to the `UserManagementClient` component.
 *
 * @param {Props} props The component props.
 * @param {Promise<{ [key: string]: string | string[] | undefined }>} props.searchParams URL search parameters for pagination and filtering.
 * @returns {Promise<React.JSX.Element>} The user management client component hydrated with initial data.
 */
export default async function UserManagementPage({searchParams}: Props): Promise<React.JSX.Element> {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const search = (params.search as string) || '';
    const roleParam = (params.role as string) || 'ALL';

    const roleFilter = Object.values(UserRole).includes(roleParam as UserRole)
        ? (roleParam as UserRole)
        : undefined;

    const userResponse = await getUsers(
        {page, pageSize: 10},
        {search, role: roleFilter}
    );

    const userData =
        userResponse.success && userResponse.data
            ? userResponse.data
            : {items: [], total: 0, totalPages: 0};

    return (
        <UserManagementClient
            roles={UserRole}
            initialUsers={userData.items}
            initialPagination={{
                page,
                pageSize: 10,
                total: userData.total,
                totalPages: userData.totalPages
            }}
            initialFilters={{
                search,
                role: roleParam as UserRole | 'ALL'
            }}
        />
    );
}
