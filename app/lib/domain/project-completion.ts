/** @format */
import type {Prisma} from "@/prisma/generated/client";

/**
 * Re-exporting generated Prisma types for the ProjectCompletion entity.
 */
export type {ProjectCompletion} from "@/prisma/generated/client";
export {ProjectCompletionStatus, PerformanceRating} from "@/prisma/generated/client";

/**
 * Data Transfer Object (DTO) for creating a new Project Completion record.
 */
export type ProjectCompletionCreateType = Prisma.ProjectCompletionCreateInput;

/**
 * Data Transfer Object (DTO) for updating a Project Completion record.
 */
export type ProjectCompletionUpdateType = Prisma.ProjectCompletionUpdateInput;

/**
 * Type Definition for Project Completion Filtering.
 */
export type ProjectCompletionWhereInput = Prisma.ProjectCompletionWhereInput;

/**
 * Project Completion entity including the Student and Project details.
 * Used for generating certificates or viewing portfolio history.
 */
export type ProjectCompletionWithDetails = Prisma.ProjectCompletionGetPayload<{
    include: {
        student: {
            include: { user: true }
        };
        project: {
            include: {
                organization: {
                    include: { user: true }
                };
                coordinator: {
                    include: { user: true }
                };
            }
        };
    };
}>;