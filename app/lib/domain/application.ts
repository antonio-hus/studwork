/** @format */
import type {Prisma} from "@/prisma/generated/client";

/**
 * Re-exporting generated Prisma types for the Application entity.
 */
export type {Application} from "@/prisma/generated/client";
export {ApplicationStatus} from "@/prisma/generated/client";

/**
 * Data Transfer Object (DTO) for submitting a new Application.
 */
export type ApplicationCreateType = Prisma.ApplicationCreateInput;

/**
 * Data Transfer Object (DTO) for updating an Application (e.g. status change).
 */
export type ApplicationUpdateType = Prisma.ApplicationUpdateInput;

/**
 * Type Definition for Application Filtering.
 */
export type ApplicationWhereInput = Prisma.ApplicationWhereInput;

/**
 * Application entity including the Student profile and the target Project details.
 * Used for detailed application review views.
 */
export type ApplicationWithDetails = Prisma.ApplicationGetPayload<{
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