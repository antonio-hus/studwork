/** @format */
import type {User, Prisma} from "@/prisma/generated/client";

/**
 * Re-exporting generated Prisma types for the User entity.
 */
export type {User} from "@/prisma/generated/client";
export {UserRole} from "@/prisma/generated/client";

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
 * Type Definition for User Filtering.
 * Used by repositories to construct strongly-typed 'where' clauses.
 */
export type UserWhereInput = Prisma.UserWhereInput;

/**
 * User entity including the specific Student profile relation.
 * Returned when querying a user with the STUDENT role.
 */
export type UserWithStudent = Prisma.UserGetPayload<{
    include: { student: true };
}>;

/**
 * User entity including the specific Coordinator profile relation.
 * Returned when querying a user with the COORDINATOR role.
 */
export type UserWithCoordinator = Prisma.UserGetPayload<{
    include: { coordinator: true };
}>;

/**
 * User entity including the specific Organization profile relation.
 * Returned when querying a user with the ORGANIZATION role.
 */
export type UserWithOrganization = Prisma.UserGetPayload<{
    include: { organization: true };
}>;

/**
 * User entity including the specific Administrator profile relation.
 * Returned when querying a user with the ADMINISTRATOR role.
 */
export type UserWithAdministrator = Prisma.UserGetPayload<{
    include: { administrator: true };
}>;

/**
 * Union Type representing a User with their specific role-based profile loaded.
 *
 * This type is used by repositories that intelligently fetch only the
 * relevant relation based on the user's role, avoiding over-fetching.
 *
 * Consumers should check the `role` property or use type guards
 * (e.g. `'student' in user`) to narrow down the specific type.
 */
export type UserWithProfile =
    | UserWithStudent
    | UserWithCoordinator
    | UserWithOrganization
    | UserWithAdministrator
    | User;

/**
 * Composite Type: User with ALL potential roles loaded.
 *
 * Useful for admin dashboards, debugging, or migration scripts where
 * you need to see every possible relation at once.
 *
 * @deprecated Use `UserWithProfile` for standard business logic to enforce strict type boundaries.
 */
export type UserWithRoles = Prisma.UserGetPayload<{
    include: {
        student: true;
        coordinator: true;
        organization: true;
        administrator: true;
    };
}>;
