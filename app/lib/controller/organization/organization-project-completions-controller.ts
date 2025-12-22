/** @format */
"use server";

import {getCurrentUser} from "@/lib/controller/auth/session-controller";
import {UserRole} from "@/lib/domain/user";
import {ProjectCompletionService} from "@/lib/service/project-completion-service";
import {ProjectCompletionStatus} from "@/lib/domain/project-completion";
import type {ProjectCompletionUpdateType} from "@/lib/domain/project-completion";
import {revalidatePath} from "next/cache";
import {CompletionFilterOptions} from "@/lib/repository/project-completion-repository";
import {OrganizationService} from "@/lib/service/organization-service";

/**
 * Retrieves all project completions for the current organization that are ready for organization review.
 * Specifically, filters for completions with status COORDINATOR_REVIEWED.
 *
 * @param page - Page number for pagination (default: 1)
 * @param pageSize - Number of items per page (default: 10)
 * @param filters - Optional filters for searching.
 * @returns A paginated list of project completions.
 */
export async function getOrganizationProjectCompletions(
    page: number = 1,
    pageSize: number = 10,
    filters: CompletionFilterOptions = {}
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== UserRole.ORGANIZATION) {
            return {success: false, error: "Unauthorized"};
        }

        const organization = await OrganizationService.instance.getOrganizationProfile(user.id)
        if (!organization || !organization.id) {
            return {success: false, error: "Organization not found"};
        }

        const result = await ProjectCompletionService.instance.getByOrganizationId(
            organization.id,
            page, 
            pageSize, 
            ProjectCompletionStatus.COORDINATOR_REVIEWED,
            filters
        );

        return {success: true, data: result};
    } catch (error) {
        console.error("Failed to fetch organization project completions:", error);
        return {success: false, error: "Failed to fetch project completions"};
    }
}

/**
 * Updates a project completion review by the organization.
 *
 * @param id - The ID of the project completion.
 * @param data - The update data (review, grade, etc.).
 * @returns The updated project completion.
 */
export async function updateOrganizationProjectCompletion(
    id: string,
    data: ProjectCompletionUpdateType
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== UserRole.ORGANIZATION) {
            return {success: false, error: "Unauthorized"};
        }

        const result = await ProjectCompletionService.instance.update(id, data);
        
        revalidatePath("/dashboard/completions");
        return {success: true, data: result};
    } catch (error) {
        console.error("Failed to update project completion:", error);
        return {success: false, error: "Failed to update project completion"};
    }
}
