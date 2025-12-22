/** @format */
import {User} from '@/lib/domain/user'
import {OrganizationDashboardClient} from "@/components/dashboard/organization/organization-dashboard-client";
import {
    countOrganizationProjectsByStatus,
    countOrganizationApplicationsByStatus,
    countOrganizationProjectCompletions
} from "@/lib/controller/organization/organization-analytics-controller";
import {ProjectStatus} from "@/lib/domain/project";
import {ApplicationStatus} from "@/lib/domain/application";

export async function OrganizationDashboard({user}: { user: User }) {
    const [
        projectCountsRes,
        applicationCountsRes,
        completionCountRes
    ] = await Promise.all([
        countOrganizationProjectsByStatus(),
        countOrganizationApplicationsByStatus(),
        countOrganizationProjectCompletions()
    ]);

    const initialProjectCounts = projectCountsRes.success ? projectCountsRes.data : {
        [ProjectStatus.DRAFT]: 0,
        [ProjectStatus.PENDING_REVIEW]: 0,
        [ProjectStatus.COORDINATOR_ASSIGNED]: 0,
        [ProjectStatus.PUBLISHED]: 0,
        [ProjectStatus.IN_PROGRESS]: 0,
        [ProjectStatus.COMPLETED]: 0,
        [ProjectStatus.ARCHIVED]: 0,
    };

    const initialApplicationCounts = applicationCountsRes.success ? applicationCountsRes.data : {
        [ApplicationStatus.PENDING]: 0,
        [ApplicationStatus.ACCEPTED]: 0,
        [ApplicationStatus.REJECTED]: 0,
        [ApplicationStatus.WITHDRAWN]: 0,
    };

    const initialCompletionCount = completionCountRes.success ? completionCountRes.data : 0;

    return (
        <OrganizationDashboardClient
            projectStatuses={ProjectStatus}
            applicationStatuses={ApplicationStatus}
            user={user}
            initialProjectCounts={initialProjectCounts}
            initialApplicationCounts={initialApplicationCounts}
            initialCompletionCount={initialCompletionCount}
        />
    )
}
