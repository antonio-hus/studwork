import {User, UserRole} from '@/lib/domain/user'
import {AdminDashboardClient} from "@/components/dashboard/administrator/admin-dashboard-client";
import {
    countUsersByRole,
    countProjectsByStatus,
    countApplicationsByStatus,
    countProjectCompletions
} from "@/lib/controller/admin/admin-analytics-controller";
import {ProjectStatus} from "@/lib/domain/project";
import {ApplicationStatus} from "@/lib/domain/application";

export async function AdminDashboard({user}: { user: User }) {
    const [
        userCountsRes,
        projectCountsRes,
        applicationCountsRes,
        completionCountRes
    ] = await Promise.all([
        countUsersByRole(),
        countProjectsByStatus(),
        countApplicationsByStatus(),
        countProjectCompletions()
    ]);

    // Fallbacks ensuring the UI never crashes if a service is down
    const initialUserCounts = userCountsRes.success ? userCountsRes.data : {
        [UserRole.STUDENT]: 0,
        [UserRole.COORDINATOR]: 0,
        [UserRole.ORGANIZATION]: 0,
        [UserRole.ADMINISTRATOR]: 0,
    };

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
        <AdminDashboardClient
            userRoles={UserRole}
            projectStatuses={ProjectStatus}
            applicationStatuses={ApplicationStatus}
            user={user}
            initialUserCounts={initialUserCounts}
            initialProjectCounts={initialProjectCounts}
            initialApplicationCounts={initialApplicationCounts}
            initialCompletionCount={initialCompletionCount}
        />
    )
}
