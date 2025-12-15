/** @format */
import type {Prisma} from "@/prisma/generated/client";

/**
 * Re-exporting generated Prisma types for the Administrator entity.
 */
export type {Administrator} from "@/prisma/generated/client";

/**
 * DTO for creating a new Administrator.
 */
export type AdministratorCreateType = Prisma.AdministratorCreateInput;

/**
 * DTO for updating an Administrator.
 */
export type AdministratorUpdateType = Prisma.AdministratorUpdateInput;

/**
 * Composite Type: Administrator with parent User data.
 */
export type AdministratorWithUser = Prisma.AdministratorGetPayload<{
    include: { user: true };
}>;