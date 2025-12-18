/** @format */
import 'server-only';
import type {Project, ProjectCreateType, ProjectUpdateType} from '@/lib/domain/project';
import {ProjectRepository, ProjectFilterOptions, ProjectSortField} from '@/lib/repository/project-repository';
import {createLogger} from '@/lib/utils/logger';
import {PaginationParams, PaginationResult} from '@/lib/domain/pagination';

/**
 * Service for generic Project operations.
 * Handles business logic related to project management, including creation, updates,
 * and status changes.
 */
export class ProjectService {
    private static _instance: ProjectService;
    private readonly logger = createLogger('ProjectService');

    private constructor() {
    }

    static get instance(): ProjectService {
        if (!ProjectService._instance) {
            ProjectService._instance = new ProjectService();
        }
        return ProjectService._instance;
    }

    /**
     * Retrieves paginated projects with support for filtering and sorting.
     *
     * @param pageParams - Pagination settings (page, pageSize).
     * @param filters - Optional filtering criteria.
     * @param sort - Sorting configuration.
     * @returns A paginated list of projects.
     */
    async getProjects(
        pageParams: PaginationParams,
        filters: ProjectFilterOptions = {},
        sort: { field: ProjectSortField; direction: 'asc' | 'desc' } = {field: 'createdAt', direction: 'desc'}
    ): Promise<PaginationResult<Project>> {
        return ProjectRepository.instance.findMany(pageParams, filters, sort);
    }

    /**
     * Retrieves a project by its unique ID.
     *
     * @param id - The project ID.
     * @returns The project or null if not found.
     */
    async getProjectById(id: string): Promise<Project | null> {
        return ProjectRepository.instance.getById(id);
    }

    /**
     * Creates a new project.
     *
     * @param data - The project creation payload.
     * @returns The created project.
     */
    async createProject(data: ProjectCreateType): Promise<Project> {
        try {
            return await ProjectRepository.instance.create(data);
        } catch (error) {
            this.logger.error('Failed to create project', error as Error);
            throw error;
        }
    }

    /**
     * Updates an existing project.
     *
     * @param id - The project ID.
     * @param data - The update payload.
     * @returns The updated project.
     */
    async updateProject(id: string, data: ProjectUpdateType): Promise<Project> {
        try {
            return await ProjectRepository.instance.update(id, data);
        } catch (error) {
            this.logger.error('Failed to update project', error as Error);
            throw error;
        }
    }

    /**
     * Deletes a project.
     *
     * @param projectId - The ID of the project to delete.
     */
    async deleteProject(projectId: string): Promise<void> {
        try {
            await ProjectRepository.instance.delete(projectId);
            this.logger.warn('Project permanently deleted', {projectId});
        } catch (error) {
            this.logger.error('Failed to delete project', error as Error);
            throw error;
        }
    }
}
