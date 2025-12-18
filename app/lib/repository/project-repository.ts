/** @format */
import 'server-only';
import {database, TransactionClient} from '@/lib/database';
import type {
    Project,
    ProjectCreateType,
    ProjectUpdateType,
    ProjectWhereInput,
    ProjectWithDetails
} from '@/lib/domain/project';
import {ProjectStatus} from '@/lib/domain/project';
import {createLogger} from '@/lib/utils/logger';
import {PaginationParams, PaginationResult} from '@/lib/domain/pagination';

/**
 * Filter criteria available for project queries.
 */
export type ProjectFilterOptions = {
    search?: string;
    status?: ProjectStatus;
    organizationId?: string;
};

/**
 * Valid fields for sorting project results.
 */
export type ProjectSortField = 'createdAt' | 'title' | 'deadline';

/**
 * Singleton repository handling database operations for Projects.
 *
 * Provides methods for CRUD operations, pagination, and transaction support.
 */
export class ProjectRepository {
    private static _instance: ProjectRepository;
    private readonly logger = createLogger('ProjectRepository');

    private constructor() {
    }

    /**
     * Gets the singleton instance of the repository.
     */
    static get instance(): ProjectRepository {
        if (!ProjectRepository._instance) {
            ProjectRepository._instance = new ProjectRepository();
        }
        return ProjectRepository._instance;
    }

    /**
     * Retrieves a count of projects for each status.
     * @returns A Promise resolving to a map of ProjectStatus to count.
     */
    async countByStatus(): Promise<Record<ProjectStatus, number>> {
        try {
            const counts = await database.project.groupBy({
                by: ['status'],
                _count: {
                    status: true,
                },
            });

            const result: Record<ProjectStatus, number> = {
                [ProjectStatus.DRAFT]: 0,
                [ProjectStatus.PENDING_REVIEW]: 0,
                [ProjectStatus.COORDINATOR_ASSIGNED]: 0,
                [ProjectStatus.PUBLISHED]: 0,
                [ProjectStatus.IN_PROGRESS]: 0,
                [ProjectStatus.COMPLETED]: 0,
                [ProjectStatus.ARCHIVED]: 0,
            };

            for (const count of counts) {
                result[count.status] = count._count.status;
            }

            return result;
        } catch (error) {
            this.logger.error('Failed to count projects by status', error as Error);
            throw error;
        }
    }

    /**
     * Retrieves a paginated list of projects matching the provided filters.
     *
     * @param {PaginationParams} pagination Page number and size configuration.
     * @param {ProjectFilterOptions} [filters={}] Search, status, and organization filters.
     * @param {object} [sort] Sorting configuration defaults to created descending.
     * @returns {Promise<PaginationResult<Project>>} Paginated projects with metadata.
     */
    async findMany(
        pagination: PaginationParams,
        filters: ProjectFilterOptions = {},
        sort: { field: ProjectSortField; direction: 'asc' | 'desc' } = {
            field: 'createdAt',
            direction: 'desc'
        }
    ): Promise<PaginationResult<Project>> {
        const {page, pageSize} = pagination;
        const skip = (page - 1) * pageSize;

        try {
            const where: ProjectWhereInput = {
                status: filters.status,
                organizationId: filters.organizationId,
                OR: filters.search
                    ? [
                        {title: {contains: filters.search, mode: 'insensitive'}},
                        {description: {contains: filters.search, mode: 'insensitive'}}
                    ]
                    : undefined
            };

            const [items, total] = await Promise.all([
                database.project.findMany({
                    where,
                    skip,
                    take: pageSize,
                    orderBy: {[sort.field]: sort.direction},
                }),
                database.project.count({where})
            ]);

            return {
                items,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            };
        } catch (error) {
            this.logger.error('Failed to find projects', error as Error);
            throw error;
        }
    }

    /**
     * Retrieves a paginated list of projects (with details) matching the provided filters.
     *
     * @param {PaginationParams} pagination Page number and size configuration.
     * @param {ProjectFilterOptions} [filters={}] Search, status, and organization filters.
     * @param {object} [sort] Sorting configuration defaults to created descending.
     * @returns {Promise<PaginationResult<ProjectWithDetails>>} Paginated projects with metadata.
     */
    async findManyWithDetails(
        pagination: PaginationParams,
        filters: ProjectFilterOptions = {},
        sort: { field: ProjectSortField; direction: 'asc' | 'desc' } = {
            field: 'createdAt',
            direction: 'desc'
        }
    ): Promise<PaginationResult<ProjectWithDetails>> {
        const {page, pageSize} = pagination;
        const skip = (page - 1) * pageSize;

        try {
            const where: ProjectWhereInput = {
                status: filters.status,
                organizationId: filters.organizationId,
                OR: filters.search
                    ? [
                        {title: {contains: filters.search, mode: 'insensitive'}},
                    ]
                    : undefined
            };

            const [items, total] = await Promise.all([
                database.project.findMany({
                    where,
                    skip,
                    take: pageSize,
                    orderBy: {[sort.field]: sort.direction},
                    include: {organization: {include: {user: true}}, coordinator: {include: {user: true}}}
                }),
                database.project.count({where})
            ]);

            return {
                items,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            };
        } catch (error) {
            this.logger.error('Failed to find projects', error as Error);
            throw error;
        }
    }

    /**
     * Retrieves a single project by its unique identifier.
     *
     * Includes related organization (with user) and application data.
     *
     * @param {string} id The unique project ID.
     * @returns {Promise<Project | null>} The project data or null if not found.
     */
    async getById(id: string): Promise<Project | null> {
        try {
            return await database.project.findUnique({
                where: {id},
                include: {
                    organization: {include: {user: true}},
                    applications: true
                }
            });
        } catch (error) {
            this.logger.error('Failed to retrieve project by ID', error as Error);
            throw error;
        }
    }

    /**
     * Creates a new project record.
     *
     * @param {ProjectCreateType} data The project creation payload.
     * @param {TransactionClient} [tx=database] Optional transaction client for atomic operations.
     * @returns {Promise<Project>} The created project.
     */
    async create(
        data: ProjectCreateType,
        tx: TransactionClient = database
    ): Promise<Project> {
        try {
            const project = await tx.project.create({data});
            this.logger.info('Project created', {projectId: project.id});
            return project;
        } catch (error) {
            this.logger.error('Failed to create project', error as Error);
            throw error;
        }
    }

    /**
     * Updates an existing project record.
     *
     * @param {string} id The unique ID of the project to update.
     * @param {ProjectUpdateType} data The fields to update.
     * @param {TransactionClient} [tx=database] Optional transaction client.
     * @returns {Promise<Project>} The updated project.
     */
    async update(
        id: string,
        data: ProjectUpdateType,
        tx: TransactionClient = database
    ): Promise<Project> {
        try {
            const project = await tx.project.update({where: {id}, data});
            this.logger.info('Project updated', {projectId: id});
            return project;
        } catch (error) {
            this.logger.error('Failed to update project', error as Error);
            throw error;
        }
    }

    /**
     * Deletes a project record.
     *
     * @param {string} id The unique ID of the project to delete.
     * @param {TransactionClient} [tx=database] Optional transaction client.
     * @returns {Promise<Project>} The deleted project data.
     */
    async delete(
        id: string,
        tx: TransactionClient = database
    ): Promise<Project> {
        try {
            const project = await tx.project.delete({where: {id}});
            this.logger.info('Project deleted', {projectId: id});
            return project;
        } catch (error) {
            this.logger.error('Failed to delete project', error as Error);
            throw error;
        }
    }
}
