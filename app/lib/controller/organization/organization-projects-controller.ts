/** @format */
"use server";

import { getTranslations } from "next-intl/server";
import { AuthService } from "@/lib/service/auth-service";
import { ProjectService } from "@/lib/service/project-service";
import { createLogger } from "@/lib/utils/logger";
import { ActionResponse } from "@/lib/domain/actions";
import { UserRole } from "@/lib/domain/user";
import type {
  Project,
  ProjectCreateType,
  ProjectStatus,
  ProjectUpdateType,
  ProjectWithDetails,
} from "@/lib/domain/project";
import {
  PaginationParams,
  PaginationResult,
} from "@/lib/domain/pagination";
import { OrganizationService } from "@/lib/service/organization-service";

const logger = createLogger("OrganizationProjectsController");

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
 * Retrieves paginated projects for the currently logged-in organization.
 */
export async function getMyOrganizationProjects(
  pageParams: PaginationParams,
  status?: ProjectStatus,
  search?: string
): Promise<ActionResponse<PaginationResult<ProjectWithDetails>>> {
  const t = await getTranslations();
  try {
    const organization = await ensureOrganization(t);

    const projects = await ProjectService.instance.getProjectsWithDetails(
      pageParams,
      { organizationId: organization.id, status: status, search: search }
    );

    return { success: true, data: projects };
  } catch (error) {
    logger.error(
      "Failed to fetch organization projects",
      error as Error
    );
    return {
      success: false,
      error: (error as Error).message || t("errors.unexpected"),
    };
  }
}

/**
 * Retrieves a single project for the currently logged-in organization.
 */
export async function getMyOrganizationProjectById(
  projectId: string
): Promise<ActionResponse<ProjectWithDetails>> {
  const t = await getTranslations();
  try {
    const organization = await ensureOrganization(t);

    const project = await ProjectService.instance.getProjectById(projectId);
    if (!project || project.organizationId !== organization.id) {
      return { success: false, error: t("errors.project_not_found") };
    }

    return { success: true, data: project };
  } catch (error) {
    logger.error("Failed to fetch organization project", error as Error);
    return {
      success: false,
      error: (error as Error).message || t("errors.unexpected"),
    };
  }
}

/**
 * Creates a new project for the currently logged-in organization.
 */
export async function createMyOrganizationProject(
  data: Omit<ProjectCreateType, "organization">
): Promise<ActionResponse<Project>> {
  const t = await getTranslations();
  try {
    const organization = await ensureOrganization(t);

    const projectData: ProjectCreateType = {
      ...data,
      organization: {
        connect: {
          id: organization.id,
        },
      },
    };

    const createdProject = await ProjectService.instance.createProject(
      projectData
    );

    return { success: true, data: createdProject };
  } catch (error) {
    logger.error("Failed to create organization project", error as Error);
    return {
      success: false,
      error: (error as Error).message || t("errors.unexpected"),
    };
  }
}

/**
 * Updates an existing project for the currently logged-in organization.
 */
export async function updateMyOrganizationProject(
  projectId: string,
  data: ProjectUpdateType
): Promise<ActionResponse<Project>> {
  const t = await getTranslations();
  try {
    const organization = await ensureOrganization(t);

    const project = await ProjectService.instance.getProjectById(projectId);
    if (!project || project.organizationId !== organization.id) {
      return { success: false, error: t("errors.project_not_found") };
    }

    const updatedProject = await ProjectService.instance.updateProject(
      projectId,
      data
    );

    return { success: true, data: updatedProject };
  } catch (error) {
    logger.error("Failed to update organization project", error as Error);
    return {
      success: false,
      error: (error as Error).message || t("errors.unexpected"),
    };
  }
}

/**
 * Deletes a project for the currently logged-in organization.
 */
export async function deleteMyOrganizationProject(
  projectId: string
): Promise<ActionResponse<void>> {
  const t = await getTranslations();
  try {
    const organization = await ensureOrganization(t);

    const project = await ProjectService.instance.getProjectById(projectId);
    if (!project || project.organizationId !== organization.id) {
      return { success: false, error: t("errors.project_not_found") };
    }

    await ProjectService.instance.deleteProject(projectId);

    return { success: true, data: undefined };
  } catch (error) {
    logger.error("Failed to delete organization project", error as Error);
    return {
      success: false,
      error: (error as Error).message || t("errors.unexpected"),
    };
  }
}
