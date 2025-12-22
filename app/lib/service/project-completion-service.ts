/** @format */
import 'server-only';
import type {
    ProjectCompletion,
    ProjectCompletionCreateType,
    ProjectCompletionUpdateType,
    ProjectCompletionWithDetails
} from '@/lib/domain/project-completion';
import {ProjectCompletionStatus} from '@/lib/domain/project-completion';
import {ProjectCompletionRepository, CompletionFilterOptions, CompletionSortField} from '@/lib/repository/project-completion-repository';
import {createLogger} from '@/lib/utils/logger';
import {PaginationParams, PaginationResult} from '@/lib/domain/pagination';
import {EmailService} from '@/lib/service/email-service';

/**
 * Service for managing project completions.
 * Handles business logic related to creating, updating, and retrieving project completion records.
 */
export class ProjectCompletionService {
    private static _instance: ProjectCompletionService;
    private readonly logger = createLogger('ProjectCompletionService');

    private constructor() {
    }

    static get instance(): ProjectCompletionService {
        if (!ProjectCompletionService._instance) {
            ProjectCompletionService._instance = new ProjectCompletionService();
        }
        return ProjectCompletionService._instance;
    }

    /**
     * Retrieves a count of all project completions.
     * @param organizationId - Optional organization ID to filter by.
     * @returns A Promise resolving to the total number of project completions.
     */
    async countProjectCompletions(organizationId?: string): Promise<number> {
        try {
            return await ProjectCompletionRepository.instance.countAll(organizationId);
        } catch (error) {
            this.logger.error('Failed to count project completions', error as Error);
            throw error;
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
    async getProjectCompletions(
        pageParams: PaginationParams,
        filters: CompletionFilterOptions = {},
        sort: { field: CompletionSortField; direction: 'asc' | 'desc' } = {field: 'createdAt', direction: 'desc'}
    ): Promise<PaginationResult<ProjectCompletionWithDetails>> {
        return ProjectCompletionRepository.instance.findMany(pageParams, filters, sort);
    }

    /**
     * Retrieves a paginated list of project completions for a specific organization.
     *
     * @param organizationId - The organization ID (user ID).
     * @param page - Page number.
     * @param pageSize - Page size.
     * @param status - Optional status filter.
     * @param filters - Optional advanced filters.
     * @returns A paginated list of project completions.
     */
    async getByOrganizationId(
        organizationId: string,
        page: number = 1,
        pageSize: number = 10,
        status?: ProjectCompletionStatus,
        filters: CompletionFilterOptions = {}
    ): Promise<PaginationResult<ProjectCompletionWithDetails>> {
        return ProjectCompletionRepository.instance.findMany(
            {page, pageSize},
            {...filters, organizationId, status},
            {field: 'createdAt', direction: 'desc'}
        );
    }

    /**
     * Retrieves a project completion by its ID.
     *
     * @param id - The project completion ID.
     * @returns The project completion or null if not found.
     */
    async getProjectCompletionById(id: string): Promise<ProjectCompletionWithDetails | null> {
        return ProjectCompletionRepository.instance.getById(id);
    }

    /**
     * Creates a new project completion.
     *
     * @param data - The project completion creation payload.
     * @returns The created project completion.
     */
    async createProjectCompletion(data: ProjectCompletionCreateType): Promise<ProjectCompletionWithDetails> {
        try {
            return await ProjectCompletionRepository.instance.create(data);
        } catch (error) {
            this.logger.error('Failed to create project completion', error as Error);
            throw error;
        }
    }

    /**
     * Updates an existing project completion.
     *
     * @param id - The project completion ID.
     * @param data - The update payload.
     * @returns The updated project completion.
     */
    async updateProjectCompletion(id: string, data: ProjectCompletionUpdateType): Promise<ProjectCompletionWithDetails> {
        try {
            const updatedCompletion = await ProjectCompletionRepository.instance.update(id, data);

            // Send email notifications based on status change
            if (data.status) {
                // Fetch full details for email
                const fullCompletion = await ProjectCompletionRepository.instance.getById(id);
                
                if (fullCompletion && fullCompletion.student?.user?.email) {
                    const studentEmail = fullCompletion.student.user.email;
                    const studentName = fullCompletion.student.user.name || 'Student';
                    const projectName = fullCompletion.project.title;

                    if (data.status === ProjectCompletionStatus.COORDINATOR_REVIEWED) {
                        await EmailService.instance.sendCoordinatorReviewSubmittedEmail(
                            studentEmail,
                            studentName,
                            projectName
                        );
                    } else if (data.status === ProjectCompletionStatus.PUBLISHED) {
                        await EmailService.instance.sendOrganizationReviewSubmittedEmail(
                            studentEmail,
                            studentName,
                            projectName
                        );
                    }
                }
            }

            return updatedCompletion;
        } catch (error) {
            this.logger.error('Failed to update project completion', error as Error);
            throw error;
        }
    }

    async update(id: string, data: ProjectCompletionUpdateType): Promise<ProjectCompletionWithDetails> {
        return this.updateProjectCompletion(id, data);
    }
}
