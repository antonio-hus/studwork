/** @format */
import type { Prisma } from "@/prisma/generated/client";

/**
 * Re-exporting generated Prisma types for the User entity.
 */
export type { User, UserRole } from "@/prisma/generated/client";

/**
 * Data Transfer Object (DTO) for creating a new User.
 * Represents the payload required to register a user.
 */
export type UserCreateType = Prisma.UserCreateInput;

/**
 * Data Transfer Object (DTO) for updating an existing User.
 * Represents the payload for modifying user profile details.
 */
export type UserUpdateType = Prisma.UserUpdateInput;

/**
 * Composite Type: User with all potential roles loaded.
 * Useful for admin dashboards or deeply nested profile views.
 */
export type UserWithRoles = Prisma.UserGetPayload<{
    include: {
        student: true;
        coordinator: true;
        organization: true;
        administrator: true;
    };
}>;
