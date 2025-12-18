/** @format */
"use server"

import {getTranslations} from 'next-intl/server'
import {revalidatePath} from 'next/cache'
import {AuthService} from '@/lib/service/auth-service'
import {ProjectService} from '@/lib/service/project-service'
import {ApplicationService} from '@/lib/service/application-service'
import {ProjectCompletionService} from '@/lib/service/project-completion-service'
import {ProjectFilterOptions, ProjectSortField} from '@/lib/repository/project-repository'
import {ApplicationFilterOptions, ApplicationSortField} from '@/lib/repository/application-repository'
import {CompletionFilterOptions, CompletionSortField} from '@/lib/repository/project-completion-repository'
import {createLogger} from '@/lib/utils/logger'
import {ActionResponse} from '@/lib/domain/actions'
import {Project, ProjectStatus, ProjectUpdateType, ProjectWithDetails} from '@/lib/domain/project'
import {Application, ApplicationUpdateType} from '@/lib/domain/application'
import {ProjectCompletion, ProjectCompletionUpdateType} from '@/lib/domain/project-completion'
import {PaginationParams, PaginationResult} from '@/lib/domain/pagination'
import {UserRole} from "@/lib/domain/user";

const logger = createLogger('ContentModerationController')

/**
 * Checks if the current session user has administrator privileges.
 * Throws an error if authentication fails or if the role is insufficient.
 *
 * @param t - The translation function for error messages.
 * @returns The authenticated admin user.
 */
async function ensureAdmin(t: any) {
    const currentUser = await AuthService.instance.getCurrentUser()
    if (!currentUser || currentUser.role !== UserRole.ADMINISTRATOR) {
        throw new Error(t('errors.auth.admin_required'))
    }
    return currentUser
}

/**
 * Retrieves a paginated list of projects based on the provided filters.
 * Restricted to administrators.
 *
 * @param pageParams - Pagination configuration (page, pageSize).
 * @param filters - Filtering criteria (role, search, status).
 * @param sort - Sorting configuration.
 * @returns A response containing the paginated project list.
 */
export async function getProjects(
    pageParams: PaginationParams,
    filters: ProjectFilterOptions = {},
    sort: { field: ProjectSortField; direction: 'asc' | 'desc' } = {field: 'createdAt', direction: 'desc'}
): Promise<ActionResponse<PaginationResult<Project>>> {
    const t = await getTranslations()
    try {
        await ensureAdmin(t)

        const result = await ProjectService.instance.getProjects(pageParams, filters, sort)

        return {success: true, data: result}
    } catch (error) {
        logger.error('Failed to fetch projects', error as Error)
        return {success: false, error: (error as Error).message || t('errors.unexpected')}
    }
}

/**
 * Updates an existing project.
 *
 * @param id - The project ID.
 * @param data - The update payload.
 * @returns The updated project.
 */
export async function updateProject(id: string, data: ProjectUpdateType): Promise<ActionResponse<Project>> {
    const t = await getTranslations()
    try {
        await ensureAdmin(t)
        const updatedProject = await ProjectService.instance.updateProject(id, data)
        revalidatePath('/admin/content')
        return {success: true, data: updatedProject}
    } catch (error) {
        logger.error('Failed to update project', error as Error)
        return {success: false, error: (error as Error).message || t('errors.unexpected')}
    }
}

/**
 * Deletes a project.
 *
 * @param projectId - The ID of the project to delete.
 */
export async function deleteProject(projectId: string): Promise<ActionResponse<void>> {
    const t = await getTranslations()
    try {
        await ensureAdmin(t)
        await ProjectService.instance.deleteProject(projectId)
        revalidatePath('/admin/content')
        return {success: true, data: undefined}
    } catch (error) {
        logger.error('Failed to delete project', error as Error)
        return {success: false, error: (error as Error).message || t('errors.unexpected')}
    }
}

/**
 * Archives a project.
 *
 * @param projectId - The ID of the project to archive.
 */
export async function archiveProject(projectId: string): Promise<ActionResponse<void>> {
    const t = await getTranslations()
    try {
        await ensureAdmin(t)
        await ProjectService.instance.updateProject(projectId, {status: ProjectStatus.ARCHIVED})
        revalidatePath('/admin/content')
        return {success: true, data: undefined}
    } catch (error) {
        logger.error('Failed to archive project', error as Error)
        return {success: false, error: (error as Error).message || t('errors.unexpected')}
    }
}

/**
 * Retrieves a paginated list of applications.
 *
 * @param pageParams - Pagination settings.
 * @param filters - Filtering criteria.
 * @param sort - Sorting configuration.
 * @returns A paginated list of applications.
 */
export async function getApplications(
    pageParams: PaginationParams,
    filters: ApplicationFilterOptions = {},
    sort: { field: ApplicationSortField; direction: 'asc' | 'desc' } = {field: 'createdAt', direction: 'desc'}
): Promise<ActionResponse<PaginationResult<Application>>> {
    const t = await getTranslations()
    try {
        await ensureAdmin(t)
        const result = await ApplicationService.instance.getApplications(pageParams, filters, sort)
        return {success: true, data: result}
    } catch (error) {
        logger.error('Failed to fetch applications', error as Error)
        return {success: false, error: (error as Error).message || t('errors.unexpected')}
    }
}

/**
 * Updates an existing application.
 *
 * @param id - The application ID.
 * @param data - The update payload.
 * @returns The updated application.
 */
export async function updateApplication(id: string, data: ApplicationUpdateType): Promise<ActionResponse<Application>> {
    const t = await getTranslations()
    try {
        await ensureAdmin(t)
        const updatedApplication = await ApplicationService.instance.updateApplication(id, data)
        revalidatePath('/admin/content')
        return {success: true, data: updatedApplication}
    } catch (error) {
        logger.error('Failed to update application', error as Error)
        return {success: false, error: (error as Error).message || t('errors.unexpected')}
    }
}

/**
 * Deletes an application.
 *
 * @param applicationId - The ID of the application to delete.
 */
export async function deleteApplication(applicationId: string): Promise<ActionResponse<void>> {
    const t = await getTranslations()
    try {
        await ensureAdmin(t)
        await ApplicationService.instance.deleteApplication(applicationId)
        revalidatePath('/admin/content')
        return {success: true, data: undefined}
    } catch (error) {
        logger.error('Failed to delete application', error as Error)
        return {success: false, error: (error as Error).message || t('errors.unexpected')}
    }
}

/**
 * Retrieves a paginated list of project completions.
 *
 * @param pageParams - Pagination settings.
 * @param filters - Filtering criteria.
 * @param sort - Sorting configuration.
 * @returns A paginated list of project completions.
 */
export async function getProjectCompletions(
    pageParams: PaginationParams,
    filters: CompletionFilterOptions = {},
    sort: { field: CompletionSortField; direction: 'asc' | 'desc' } = {field: 'submittedAt', direction: 'desc'}
): Promise<ActionResponse<PaginationResult<ProjectCompletion>>> {
    const t = await getTranslations()
    try {
        await ensureAdmin(t)
        const result = await ProjectCompletionService.instance.getProjectCompletions(pageParams, filters, sort)
        return {success: true, data: result}
    } catch (error) {
        logger.error('Failed to fetch project completions', error as Error)
        return {success: false, error: (error as Error).message || t('errors.unexpected')}
    }
}

/**
 * Updates an existing project completion.
 *
 * @param id - The project completion ID.
 * @param data - The update payload.
 * @returns The updated project completion.
 */
export async function updateProjectCompletion(id: string, data: ProjectCompletionUpdateType): Promise<ActionResponse<ProjectCompletion>> {
    const t = await getTranslations()
    try {
        await ensureAdmin(t)
        const updatedCompletion = await ProjectCompletionService.instance.updateProjectCompletion(id, data)
        revalidatePath('/admin/content')
        return {success: true, data: updatedCompletion}
    } catch (error) {
        logger.error('Failed to update project completion', error as Error)
        return {success: false, error: (error as Error).message || t('errors.unexpected')}
    }
}
