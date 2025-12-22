/** @format */
import 'server-only';
import {database, TransactionClient} from '@/lib/database';
import type {
    Application,
    ApplicationCreateType,
    ApplicationUpdateType,
    ApplicationWhereInput
} from '@/lib/domain/application';
import {ApplicationStatus} from '@/lib/domain/application';
import {createLogger} from '@/lib/utils/logger';
import {PaginationParams, PaginationResult} from '@/lib/domain/pagination';

/**
 * Filter criteria available for application queries.
 */
export type ApplicationFilterOptions = {
    studentId?: string;
    projectId?: string;
    status?: ApplicationStatus;
    organizationId?: string;
};

/**
 * Valid fields for sorting application results.
 */
export type ApplicationSortField = 'createdAt' | 'updatedAt';

/**
 * Singleton repository handling database operations for Applications.
 *
 * Manages the lifecycle of student applications to projects, including
 * retrieval, creation, status updates, and deletion.
 */
export class ApplicationRepository {
    private static _instance: ApplicationRepository;
    private readonly logger = createLogger('ApplicationRepository');

    private constructor() {
    }

    /**
     * Gets the singleton instance of the repository.
     */
    static get instance(): ApplicationRepository {
        if (!ApplicationRepository._instance) {
            ApplicationRepository._instance = new ApplicationRepository();
        }
        return ApplicationRepository._instance;
    }

    /**
     * Retrieves a count of applications for each status.
     * @param organizationId - Optional organization ID to filter by.
     * @returns A Promise resolving to a map of ApplicationStatus to count.
     */
    async countByStatus(organizationId?: string): Promise<Record<ApplicationStatus, number>> {
        try {
            const where: ApplicationWhereInput = organizationId ? {project: {organizationId}} : {};
            
            const counts = await database.application.groupBy({
                by: ['status'],
                where,
                _count: {
                    status: true,
                },
            });

            const result: Record<ApplicationStatus, number> = {
                [ApplicationStatus.PENDING]: 0,
                [ApplicationStatus.ACCEPTED]: 0,
                [ApplicationStatus.REJECTED]: 0,
                [ApplicationStatus.WITHDRAWN]: 0,
            };

            for (const count of counts) {
                result[count.status] = count._count.status;
            }

            return result;
        } catch (error) {
            this.logger.error('Failed to count applications by status', error as Error);
            throw error;
        }
    }

    /**
     * Retrieves a paginated list of applications based on provided filters.
     *
     * @param {PaginationParams} pagination Page number and size configuration.
     * @param {ApplicationFilterOptions} [filters={}] Student, project, and status filters.
     * @param {object} [sort] Sorting configuration defaults to created descending.
     * @returns {Promise<PaginationResult<Application>>} Paginated applications with student and project details.
     */
    async findMany(
        pagination: PaginationParams,
        filters: ApplicationFilterOptions = {},
        sort: { field: ApplicationSortField; direction: 'asc' | 'desc' } = {
            field: 'createdAt',
            direction: 'desc'
        }
    ): Promise<PaginationResult<Application>> {
        const {page, pageSize} = pagination;
        const skip = (page - 1) * pageSize;

        try {
            const where: ApplicationWhereInput = {
                studentId: filters.studentId,
                projectId: filters.projectId,
                status: filters.status,
                project: filters.organizationId ? {organizationId: filters.organizationId} : undefined
            };

            const [items, total] = await Promise.all([
                database.application.findMany({
                    where,
                    skip,
                    take: pageSize,
                    orderBy: {[sort.field]: sort.direction},
                    include: {
                        student: {include: {user: true}},
                        project: {include: {organization: true}}
                    }
                }),
                database.application.count({where})
            ]);

            return {
                items,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            };
        } catch (error) {
            this.logger.error('Failed to find applications', error as Error);
            throw error;
        }
    }

    /**
     * Retrieves a single application by its unique identifier.
     *
     * Includes related student (with user) and project data.
     *
     * @param {string} id The unique application ID.
     * @returns {Promise<Application | null>} The application data or null if not found.
     */
    async getById(id: string): Promise<Application | null> {
        try {
            return await database.application.findUnique({
                where: {id},
                include: {
                    student: {include: {user: true}},
                    project: true
                }
            });
        } catch (error) {
            this.logger.error(
                'Failed to retrieve application by ID',
                error as Error
            );
            throw error;
        }
    }

    /**
     * Checks for an existing application by a specific student for a specific project.
     *
     * Useful for enforcing "one application per project" rules.
     *
     * @param {string} studentId The student's ID.
     * @param {string} projectId The project's ID.
     * @returns {Promise<Application | null>} The application if it exists, otherwise null.
     */
    async getByStudentAndProject(
        studentId: string,
        projectId: string
    ): Promise<Application | null> {
        try {
            return await database.application.findFirst({
                where: {studentId, projectId}
            });
        } catch (error) {
            this.logger.error('Failed to check existing application', error as Error);
            throw error;
        }
    }

    /**
     * Creates a new application record.
     *
     * @param {ApplicationCreateType} data The application creation payload.
     * @param {TransactionClient} [tx=database] Optional transaction client for atomic operations.
     * @returns {Promise<Application>} The created application.
     */
    async create(
        data: ApplicationCreateType,
        tx: TransactionClient = database
    ): Promise<Application> {
        try {
            const application = await tx.application.create({data});
            this.logger.info('Application created', {
                applicationId: application.id
            });
            return application;
        } catch (error) {
            this.logger.error('Failed to create application', error as Error);
            throw error;
        }
    }

    /**
     * Updates an existing application record, typically used for status changes.
     *
     * @param {string} id The unique ID of the application to update.
     * @param {ApplicationUpdateType} data The fields to update.
     * @param {TransactionClient} [tx=database] Optional transaction client.
     * @returns {Promise<Application>} The updated application.
     */
    async update(
        id: string,
        data: ApplicationUpdateType,
        tx: TransactionClient = database
    ): Promise<Application> {
        try {
            const application = await tx.application.update({where: {id}, data});
            this.logger.info('Application updated', {
                applicationId: id,
                status: data.status
            });
            return application;
        } catch (error) {
            this.logger.error('Failed to update application', error as Error);
            throw error;
        }
    }

    /**
     * Deletes or withdraws an application.
     *
     * @param {string} id The unique ID of the application to delete.
     * @param {TransactionClient} [tx=database] Optional transaction client.
     * @returns {Promise<Application>} The deleted application data.
     */
    async delete(
        id: string,
        tx: TransactionClient = database
    ): Promise<Application> {
        try {
            const application = await tx.application.delete({where: {id}});
            this.logger.info('Application withdrawn/deleted', {applicationId: id});
            return application;
        } catch (error) {
            this.logger.error('Failed to delete application', error as Error);
            throw error;
        }
    }
}
