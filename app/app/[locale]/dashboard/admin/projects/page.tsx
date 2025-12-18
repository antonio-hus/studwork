/** @format */
"use server"
import React from 'react';
import {getProjects, getProjectsWithDetails} from '@/lib/controller/admin/content-moderation-controller';
import {ProjectManagementClient} from '@/components/dashboard/administrator/project-management/project-management-client';
import {ProjectStatus} from '@/lib/domain/project';

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Renders the project management page.
 *
 * This async server component is responsible for fetching a paginated and
 * filtered list of projects based on the URL search parameters. It then delegates
 * the rendering and interactive logic to the `ProjectManagementClient` component.
 *
 * @param {Props} props The component props.
 * @param {Promise<{ [key: string]: string | string[] | undefined }>} props.searchParams URL search parameters for pagination and filtering.
 * @returns {Promise<React.JSX.Element>} The project management client component hydrated with initial data.
 */
export default async function ProjectManagementPage({searchParams}: Props): Promise<React.JSX.Element> {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const search = (params.search as string) || '';
    const statusParam = (params.status as string) || 'ALL';

    const statusFilter = Object.values(ProjectStatus).includes(statusParam as ProjectStatus)
        ? (statusParam as ProjectStatus)
        : undefined;

    const projectResponse = await getProjectsWithDetails(
        {page, pageSize: 10},
        {search, status: statusFilter}
    );

    const projectData =
        projectResponse.success && projectResponse.data
            ? projectResponse.data
            : {items: [], total: 0, totalPages: 0};

    return (
        <ProjectManagementClient
            statuses={ProjectStatus}
            initialProjects={projectData.items}
            initialPagination={{
                page,
                pageSize: 10,
                total: projectData.total,
                totalPages: projectData.totalPages
            }}
            initialFilters={{
                search,
                status: statusParam as ProjectStatus | 'ALL'
            }}
        />
    );
}
