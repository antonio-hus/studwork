/** @format */
import 'server-only';
import type {Application, ApplicationCreateType, ApplicationUpdateType} from '@/lib/domain/application';
import {ApplicationRepository, ApplicationFilterOptions, ApplicationSortField} from '@/lib/repository/application-repository';
import {createLogger} from '@/lib/utils/logger';
import {PaginationParams, PaginationResult} from '@/lib/domain/pagination';
import {ApplicationStatus} from "@/lib/domain/application";

/**
 * Service for managing project applications.
 * Handles business logic related to creating, updating, and retrieving applications.
 */
export class ApplicationService {
    private static _instance: ApplicationService;
    private readonly logger = createLogger('ApplicationService');

    private constructor() {
    }

    static get instance(): ApplicationService {
        if (!ApplicationService._instance) {
            ApplicationService._instance = new ApplicationService();
        }
        return ApplicationService._instance;
    }

    /**
     * Retrieves a count of applications for each status.
     * @param organizationId - Optional organization ID to filter by.
     * @returns A Promise resolving to a map of ApplicationStatus to count.
     */
    async countApplicationsByStatus(organizationId?: string): Promise<Record<ApplicationStatus, number>> {
        try {
            return await ApplicationRepository.instance.countByStatus(organizationId);
        } catch (error) {
            this.logger.error('Failed to count applications by status', error as Error);
            throw error;
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
    async getApplications(
        pageParams: PaginationParams,
        filters: ApplicationFilterOptions = {},
        sort: { field: ApplicationSortField; direction: 'asc' | 'desc' } = {field: 'createdAt', direction: 'desc'}
    ): Promise<PaginationResult<Application>> {
        return ApplicationRepository.instance.findMany(pageParams, filters, sort);
    }

    /**
     * Retrieves an application by its ID.
     *
     * @param id - The application ID.
     * @returns The application or null if not found.
     */
    async getApplicationById(id: string): Promise<Application | null> {
        return ApplicationRepository.instance.getById(id);
    }

    /**
     * Creates a new application.
     *
     * @param data - The application creation payload.
     * @returns The created application.
     */
    async createApplication(data: ApplicationCreateType): Promise<Application> {
        try {
            return await ApplicationRepository.instance.create(data);
        } catch (error) {
            this.logger.error('Failed to create application', error as Error);
            throw error;
        }
    }

    /**
     * Updates an existing application.
     *
     * @param id - The application ID.
     * @param data - The update payload.
     * @returns The updated application.
     */
    async updateApplication(id: string, data: ApplicationUpdateType): Promise<Application> {
        try {
            return await ApplicationRepository.instance.update(id, data);
        } catch (error) {
            this.logger.error('Failed to update application', error as Error);
            throw error;
        }
    }

    /**
     * Deletes an application.
     *
     * @param applicationId - The ID of the application to delete.
     */
    async deleteApplication(applicationId: string): Promise<void> {
        try {
            await ApplicationRepository.instance.delete(applicationId);
            this.logger.warn('Application permanently deleted', {applicationId});
        } catch (error) {
            this.logger.error('Failed to delete application', error as Error);
            throw error;
        }
    }
}
