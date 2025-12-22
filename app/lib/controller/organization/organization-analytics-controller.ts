/** @format */
"use server";

import { getTranslations } from "next-intl/server";
import { AuthService } from "@/lib/service/auth-service";
import { ProjectService } from "@/lib/service/project-service";
import { ApplicationService } from "@/lib/service/application-service";
import { ProjectCompletionService } from "@/lib/service/project-completion-service";
import { createLogger } from "@/lib/utils/logger";
import { ActionResponse } from "@/lib/domain/actions";
import { UserRole } from "@/lib/domain/user";
import { ProjectStatus } from "@/lib/domain/project";
import { ApplicationStatus } from "@/lib/domain/application";
import { OrganizationService } from "@/lib/service/organization-service";

const logger = createLogger("OrganizationAnalyticsController");

/**
 * Ensures the current session user is an organization.
 * Returns the authenticated organization user.
 */
async function ensureOrganization(t: any) {
  const currentUser = await AuthService.instance.getCurrentUser();
  if (!currentUser || currentUser.role !== UserRole.ORGANIZATION) {
    throw new Error(t("errors.auth.organization_required"));
  }
  const organization = await OrganizationService.instance.getOrganizationProfile(currentUser.id);
  if (!organization) {
    throw new Error(t("errors.auth.organization_profile_not_found"));
  }
  return organization;
}

/**
 * Retrieves a count of projects for each status for the current organization.
 * @returns A response containing a map of ProjectStatus to count.
 */
export async function countOrganizationProjectsByStatus(): Promise<ActionResponse<Record<ProjectStatus, number>>> {
  const t = await getTranslations();
  try {
    const organization = await ensureOrganization(t);
    const result = await ProjectService.instance.countProjectsByStatus(organization.id);
    return { success: true, data: result };
  } catch (error) {
    logger.error("Failed to count organization projects by status", error as Error);
    return {
      success: false,
      error: (error as Error).message || t("errors.unexpected"),
    };
  }
}

/**
 * Retrieves a count of applications for each status for the current organization.
 * @returns A response containing a map of ApplicationStatus to count.
 */
export async function countOrganizationApplicationsByStatus(): Promise<ActionResponse<Record<ApplicationStatus, number>>> {
  const t = await getTranslations();
  try {
    const organization = await ensureOrganization(t);
    const result = await ApplicationService.instance.countApplicationsByStatus(organization.id);
    return { success: true, data: result };
  } catch (error) {
    logger.error("Failed to count organization applications by status", error as Error);
    return {
      success: false,
      error: (error as Error).message || t("errors.unexpected"),
    };
  }
}

/**
 * Retrieves a count of all project completions for the current organization.
 * @returns A response containing the total number of project completions.
 */
export async function countOrganizationProjectCompletions(): Promise<ActionResponse<number>> {
  const t = await getTranslations();
  try {
    const organization = await ensureOrganization(t);
    const result = await ProjectCompletionService.instance.countProjectCompletions(organization.id);
    return { success: true, data: result };
  } catch (error) {
    logger.error("Failed to count organization project completions", error as Error);
    return {
      success: false,
      error: (error as Error).message || t("errors.unexpected"),
    };
  }
}
