/** @format */
import type {Prisma} from "@/prisma/generated/client";
import {UserCreateType} from "@/lib/domain/user";

/**
 * Re-exporting generated Prisma types for the Organization entity.
 */
export type { Organization, OrganizationType } from "@/prisma/generated/client";

/**
 * Data Transfer Object (DTO) for creating a new Organization profile.
 */
export type OrganizationCreateType = Prisma.OrganizationCreateInput;

/**
 * Data Transfer Object (DTO) for updating an Organization profile.
 * Used for verifying status, changing addresses, or contact info.
 */
export type OrganizationUpdateType = Prisma.OrganizationUpdateInput;

/**
 * Composite Type: Organization with parent User data.
 */
export type OrganizationWithUser = Prisma.OrganizationGetPayload<{
    include: { user: true };
}>;

/**
 * Composite DTO used by the Service Layer to orchestrate registration.
 */
export type OrganizationRegistrationInput = {
    user: Omit<UserCreateType, 'role'>;
    organization: Omit<OrganizationCreateType, 'user' | 'userId'>;
};
