/** @format */
import type { Prisma } from "@/prisma/generated/client";

/**
 * Re-exporting generated Prisma types for the Coordinator entity.
 */
export type { Coordinator } from "@/prisma/generated/client";

/**
 * Data Transfer Object (DTO) for creating a new Coordinator profile.
 */
export type CoordinatorCreateType = Prisma.CoordinatorCreateInput;

/**
 * Data Transfer Object (DTO) for updating a Coordinator profile.
 * Used for changing department info or expertise areas.
 */
export type CoordinatorUpdateType = Prisma.CoordinatorUpdateInput;

/**
 * Composite Type: Coordinator with parent User data.
 */
export type CoordinatorWithUser = Prisma.CoordinatorGetPayload<{
    include: { user: true };
}>;
