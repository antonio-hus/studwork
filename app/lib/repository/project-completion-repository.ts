/** @format */
import 'server-only';
import {database, TransactionClient} from '@/lib/database';
import type {
    ProjectCompletion,
    ProjectCompletionCreateType,
    ProjectCompletionUpdateType,
    ProjectCompletionWhereInput,
    ProjectCompletionStatus, ProjectCompletionWithDetails
} from '@/lib/domain/project-completion';
import {createLogger} from '@/lib/utils/logger';
import {PaginationParams, PaginationResult} from '@/lib/domain/pagination';

/**
 * Filter criteria available for project completion queries.
 */
export type CompletionFilterOptions = {
    studentId?: string;
    projectId?: string;
    organizationId?: string;
    status?: ProjectCompletionStatus;
    studentName?: string;
    coordinatorName?: string;
    projectName?: string;
};

/**
 * Valid fields for sorting project completion results.
 */
export type CompletionSortField = 'createdAt';

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
     * @param organizationId - Optional organization ID to filter by.
     * @returns A Promise resolving to the total number of project completions.
     */
    async countAll(organizationId?: string): Promise<number> {
        try {
            const where: ProjectCompletionWhereInput = organizationId ? {project: {organizationId}} : {};
            return await database.projectCompletion.count({where});
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
     * @returns {Promise<PaginationResult<ProjectCompletionWithDetails>>} Paginated completions with metadata.
     */
    async findMany(
        pagination: PaginationParams,
        filters: CompletionFilterOptions = {},
        sort: { field: CompletionSortField; direction: 'asc' | 'desc' } = {
            field: 'createdAt',
            direction: 'desc'
        }
    ): Promise<PaginationResult<ProjectCompletionWithDetails>> {
        const {page, pageSize} = pagination;
        const skip = (page - 1) * pageSize;

        try {
            const where: ProjectCompletionWhereInput = {
                studentId: filters.studentId,
                projectId: filters.projectId,
                status: filters.status,
                project: {
                    organizationId: filters.organizationId,
                    title: filters.projectName ? {contains: filters.projectName, mode: 'insensitive'} : undefined,
                    coordinator: filters.coordinatorName ? {
                        user: {
                            name: {contains: filters.coordinatorName, mode: 'insensitive'}
                        }
                    } : undefined,
                },
                student: filters.studentName ? {
                    user: {
                        name: {contains: filters.studentName, mode: 'insensitive'}
                    }
                } : undefined,
            };

            const [items, total] = await Promise.all([
                database.projectCompletion.findMany({
                    where,
                    skip,
                    take: pageSize,
                    orderBy: {[sort.field]: sort.direction},
                    include: {
                        student: {include: {user: true}},
                        project: {
                            include: {
                                organization: {include: {user: true}},
                                coordinator: {include: {user: true}}
                            }
                        }
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
     * @returns {Promise<ProjectCompletionWithDetails | null>} The completion record or null if not found.
     */
    async getById(id: string): Promise<ProjectCompletionWithDetails | null> {
        try {
            return await database.projectCompletion.findUnique({
                where: {id},
                include: {
                    student: {include: {user: true}},
                    project: {
                        include: {
                            organization: {include: {user: true}},
                            coordinator: {include: {user: true}}
                        }
                    }
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
     * @returns {Promise<ProjectCompletionWithDetails | null>} The completion record if found, otherwise null.
     */
    async getByStudentAndProject(
        studentId: string,
        projectId: string
    ): Promise<ProjectCompletionWithDetails | null> {
        try {
            return await database.projectCompletion.findFirst({
                where: {studentId, projectId},
                include: {
                    student: {include: {user: true}},
                    project: {
                        include: {
                            organization: {include: {user: true}},
                            coordinator: {include: {user: true}}
                        }
                    }
                }
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
     * @returns {Promise<ProjectCompletionWithDetails>} The created completion record.
     */
    async create(
        data: ProjectCompletionCreateType,
        tx: TransactionClient = database
    ): Promise<ProjectCompletionWithDetails> {
        try {
            const completion = await tx.projectCompletion.create({
                data,
                include: {
                    student: {include: {user: true}},
                    project: {
                        include: {
                            organization: {include: {user: true}},
                            coordinator: {include: {user: true}}
                        }
                    }
                }
            });
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
     * @returns {Promise<ProjectCompletionWithDetails>} The updated completion record.
     */
    async update(
        id: string,
        data: ProjectCompletionUpdateType,
        tx: TransactionClient = database
    ): Promise<ProjectCompletionWithDetails> {
        try {
            const completion = await tx.projectCompletion.update({
                where: {id},
                data,
                include: {
                    student: {include: {user: true}},
                    project: {
                        include: {
                            organization: {include: {user: true}},
                            coordinator: {include: {user: true}}
                        }
                    }
                }
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
