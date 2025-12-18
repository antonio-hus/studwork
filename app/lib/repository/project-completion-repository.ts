/** @format */
import 'server-only';
import {database, TransactionClient} from '@/lib/database';
import type {
    ProjectCompletion,
    ProjectCompletionCreateType,
    ProjectCompletionUpdateType,
    ProjectCompletionWhereInput
} from '@/lib/domain/project-completion';
import {createLogger} from '@/lib/utils/logger';
import {PaginationParams, PaginationResult} from '@/lib/domain/pagination';

/**
 * Filter criteria available for project completion queries.
 */
export type CompletionFilterOptions = {
    studentId?: string;
    projectId?: string;
};

/**
 * Valid fields for sorting project completion results.
 */
export type CompletionSortField = 'submittedAt' | 'grade';

/**
 * Repository handling database operations for project completions.
 *
 * Provides methods for listing, retrieving, creating, and updating
 * completion records, with support for pagination and transactions.
 */
export class ProjectCompletionRepository {
    private static _instance: ProjectCompletionRepository;
    private readonly logger = createLogger('ProjectCompletionRepository');

    private constructor() {
    }

    /**
     * Gets the singleton instance of the repository.
     */
    static get instance(): ProjectCompletionRepository {
        if (!ProjectCompletionRepository._instance) {
            ProjectCompletionRepository._instance =
                new ProjectCompletionRepository();
        }
        return ProjectCompletionRepository._instance;
    }
    
    /**
     * Retrieves a count of all project completions.
     * @returns A Promise resolving to the total number of project completions.
     */
    async countAll(): Promise<number> {
        try {
            return await database.projectCompletion.count();
        } catch (error) {
            this.logger.error('Failed to count project completions', error as Error);
            throw error;
        }
    }

    /**
     * Retrieves a paginated list of project completions based on filters.
     *
     * @param {PaginationParams} pagination Page number and size configuration.
     * @param {CompletionFilterOptions} [filters={}] Optional filters by student or project.
     * @param {{ field: CompletionSortField; direction: 'asc' | 'desc' }} [sort] Sorting configuration, defaults to submittedAt desc.
     * @returns {Promise<PaginationResult<ProjectCompletion>>} Paginated completions with metadata.
     */
    async findMany(
        pagination: PaginationParams,
        filters: CompletionFilterOptions = {},
        sort: { field: CompletionSortField; direction: 'asc' | 'desc' } = {
            field: 'submittedAt',
            direction: 'desc'
        }
    ): Promise<PaginationResult<ProjectCompletion>> {
        const {page, pageSize} = pagination;
        const skip = (page - 1) * pageSize;

        try {
            const where: ProjectCompletionWhereInput = {
                studentId: filters.studentId,
                projectId: filters.projectId
            };

            const [items, total] = await Promise.all([
                database.projectCompletion.findMany({
                    where,
                    skip,
                    take: pageSize,
                    orderBy: {[sort.field]: sort.direction},
                    include: {
                        student: {include: {user: true}},
                        project: true
                    }
                }),
                database.projectCompletion.count({where})
            ]);

            return {
                items,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            };
        } catch (error) {
            this.logger.error('Failed to find completions', error as Error);
            throw error;
        }
    }

    /**
     * Retrieves a single project completion by its unique identifier.
     *
     * Includes related student (with user) and project data.
     *
     * @param {string} id The unique completion ID.
     * @returns {Promise<ProjectCompletion | null>} The completion record or null if not found.
     */
    async getById(id: string): Promise<ProjectCompletion | null> {
        try {
            return await database.projectCompletion.findUnique({
                where: {id},
                include: {
                    student: {include: {user: true}},
                    project: true
                }
            });
        } catch (error) {
            this.logger.error(
                'Failed to retrieve completion by ID',
                error as Error
            );
            throw error;
        }
    }

    /**
     * Retrieves a project completion for a specific student and project pair.
     *
     * Useful for checking whether a student has already submitted a completion.
     *
     * @param {string} studentId The student's ID.
     * @param {string} projectId The project's ID.
     * @returns {Promise<ProjectCompletion | null>} The completion record if found, otherwise null.
     */
    async getByStudentAndProject(
        studentId: string,
        projectId: string
    ): Promise<ProjectCompletion | null> {
        try {
            return await database.projectCompletion.findFirst({
                where: {studentId, projectId}
            });
        } catch (error) {
            this.logger.error(
                'Failed to find specific completion',
                error as Error
            );
            throw error;
        }
    }

    /**
     * Creates a new project completion record.
     *
     * @param {ProjectCompletionCreateType} data The completion creation payload.
     * @param {TransactionClient} [tx=database] Optional transaction client for atomic operations.
     * @returns {Promise<ProjectCompletion>} The created completion record.
     */
    async create(
        data: ProjectCompletionCreateType,
        tx: TransactionClient = database
    ): Promise<ProjectCompletion> {
        try {
            const completion = await tx.projectCompletion.create({data});
            this.logger.info('Project completion submitted', {
                completionId: completion.id
            });
            return completion;
        } catch (error) {
            this.logger.error('Failed to submit completion', error as Error);
            throw error;
        }
    }

    /**
     * Updates an existing project completion record.
     *
     * Commonly used to add grades, feedback, or update submission details.
     *
     * @param {string} id The unique ID of the completion to update.
     * @param {ProjectCompletionUpdateType} data The fields to update.
     * @param {TransactionClient} [tx=database] Optional transaction client.
     * @returns {Promise<ProjectCompletion>} The updated completion record.
     */
    async update(
        id: string,
        data: ProjectCompletionUpdateType,
        tx: TransactionClient = database
    ): Promise<ProjectCompletion> {
        try {
            const completion = await tx.projectCompletion.update({
                where: {id},
                data
            });
            this.logger.info('Project completion updated', {
                completionId: id
            });
            return completion;
        } catch (error) {
            this.logger.error('Failed to update completion', error as Error);
            throw error;
        }
    }
}
