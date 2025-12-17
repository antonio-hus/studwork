/** @format */
import type {Prisma} from "@/prisma/generated/client";

/**
 * Re-exporting generated Prisma types for the Project entity.
 */
export type {Project} from "@/prisma/generated/client";
export {ProjectStatus, ProjectCategory} from "@/prisma/generated/client";

/**
 * Data Transfer Object (DTO) for creating a new Project.
 */
export type ProjectCreateType = Prisma.ProjectCreateInput;

/**
 * Data Transfer Object (DTO) for updating an existing Project.
 */
export type ProjectUpdateType = Prisma.ProjectUpdateInput;

/**
 * Type Definition for Project Filtering.
 */
export type ProjectWhereInput = Prisma.ProjectWhereInput;

/**
 * Type Definition for Project Sorting.
 */
export type ProjectOrderByInput = Prisma.ProjectOrderByWithRelationInput;

/**
 * Project entity including both the Organization and Coordinator profiles.
 * This is the standard payload for displaying project cards or lists.
 */
export type ProjectWithDetails = Prisma.ProjectGetPayload<{
    include: {
        organization: {
            include: { user: true }
        };
        coordinator: {
            include: { user: true }
        };
    };
}>;

/**
 * Project entity including Organization, Coordinator, and all associated Applications.
 * Used for management views where admins or partners review candidates.
 */
export type ProjectWithApplications = Prisma.ProjectGetPayload<{
    include: {
        organization: {
            include: { user: true }
        };
        coordinator: {
            include: { user: true }
        };
        applications: {
            include: {
                student: {
                    include: { user: true }
                }
            }
        };
    };
}>;