/** @format */
"use client";

import React, {useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {User, UserRole} from "@/lib/domain/user";
import {ProjectStatus} from "@/lib/domain/project";
import {ApplicationStatus} from "@/lib/domain/application";
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Clock,
    CheckCircle,
    Layout,
    GraduationCap,
    Building2,
    UserCog,
    BarChart3,
    PieChart,
    ArrowUpRight,
    LucideIcon,
    Scale,
    TrendingUp
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import {cn} from "@/lib/utils";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

const TOOLTIP_CONTENT_CLASS =
    "bg-foreground text-background border-none rounded-md shadow-xl px-3 py-1.5 text-xs font-semibold [&_span]:hidden [&_svg]:hidden";

interface Props {
    userRoles: typeof UserRole;
    projectStatuses: typeof ProjectStatus;
    applicationStatuses: typeof ApplicationStatus;
    user: User;
    initialUserCounts: Record<UserRole, number>;
    initialProjectCounts: Record<ProjectStatus, number>;
    initialApplicationCounts: Record<ApplicationStatus, number>;
    initialCompletionCount: number;
}

/**
 * AdminDashboardClient
 *
 * Primary visual dashboard for system administrators.
 * Displays key metrics, charts, and operational ratios for platform monitoring.
 */
export function AdminDashboardClient({
                                         userRoles,
                                         projectStatuses,
                                         applicationStatuses,
                                         user,
                                         initialUserCounts,
                                         initialProjectCounts,
                                         initialApplicationCounts,
                                         initialCompletionCount,
                                     }: Props) {
    const t = useTranslations("dashboard.admin");

    const [userCounts] = useState(initialUserCounts);
    const [projectCounts] = useState(initialProjectCounts);
    const [applicationCounts] = useState(initialApplicationCounts);
    const [completionCount] = useState(initialCompletionCount);

    const stats = useMemo(() => {
        const totalUsers = Object.values(userCounts).reduce((a, b) => a + b, 0);
        const totalApplications =
            applicationCounts[applicationStatuses.ACCEPTED] +
            applicationCounts[applicationStatuses.REJECTED] +
            applicationCounts[applicationStatuses.PENDING];

        const acceptanceRate =
            totalApplications > 0
                ? Math.round((applicationCounts[applicationStatuses.ACCEPTED] / totalApplications) * 100)
                : 0;

        const totalProjects = Object.values(projectCounts).reduce((a, b) => a + b, 0);
        const activeProjects =
            projectCounts[projectStatuses.PUBLISHED] +
            projectCounts[projectStatuses.IN_PROGRESS];

        const coordinatorLoad = userCounts[userRoles.COORDINATOR] > 0
            ? (activeProjects / userCounts[userRoles.COORDINATOR])
            : 0;

        const applicantsPerProject = activeProjects > 0
            ? (totalApplications / activeProjects)
            : 0;

        return {
            totalUsers,
            totalApplications,
            acceptanceRate,
            activeProjects,
            totalProjects,
            coordinatorLoad,
            applicantsPerProject
        };
    }, [userCounts, projectCounts, applicationCounts, applicationStatuses, projectStatuses]);

    const userChartData = useMemo(() => [
        {name: t('students'), value: userCounts[userRoles.STUDENT], color: 'var(--color-muted)'},
        {name: t('coordinators'), value: userCounts[userRoles.COORDINATOR], color: 'var(--color-accent)'},
        {name: t('organizations'), value: userCounts[userRoles.ORGANIZATION], color: 'var(--color-secondary)'},
        {name: t('administrators'), value: userCounts[userRoles.ADMINISTRATOR], color: 'var(--color-primary)'},
    ].filter(d => d.value > 0), [userCounts, userRoles, t]);

    const projectPipelineData = useMemo(() => [
        {name: t('draft'), value: projectCounts[projectStatuses.DRAFT]},
        {name: t('pending'), value: projectCounts[projectStatuses.PENDING_REVIEW]},
        {name: t('published'), value: projectCounts[projectStatuses.PUBLISHED]},
        {name: t('inProgress'), value: projectCounts[projectStatuses.IN_PROGRESS]},
        {name: t('completed'), value: completionCount},
    ], [projectCounts, projectStatuses, completionCount, t]);

    return (
        <div className="min-h-screen w-full bg-background p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-500 space-y-8">
                {/* Page Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 shadow-sm">
                            <LayoutDashboard className="h-6 w-6 text-primary"/>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {t("title")}
                            </h1>
                            <p className="text-sm text-muted-foreground max-w-lg">
                                {t("subtitle", {name: user.name})}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ZONE 1: USER ANALYTICS */}
                <Card className="shadow-sm border-border bg-muted/30 overflow-hidden">
                    <CardHeader className="border-b border-border/50 py-4 px-6">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground"/>
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                {t("userAnalytics")}
                            </CardTitle>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <KpiCard
                                label={t("totalUsers")}
                                value={stats.totalUsers}
                                icon={Users}
                                trend={t("platformGrowth")}
                                variant="primary"
                            />
                            <KpiCard
                                label={t("students")}
                                value={userCounts[userRoles.STUDENT]}
                                icon={GraduationCap}
                                trend={t("activeLearners")}
                                variant="muted"
                            />
                            <KpiCard
                                label={t("organizations")}
                                value={userCounts[userRoles.ORGANIZATION]}
                                icon={Building2}
                                trend={t("partners")}
                                variant="secondary"
                            />
                            <KpiCard
                                label={t("coordinators")}
                                value={userCounts[userRoles.COORDINATOR]}
                                icon={UserCog}
                                trend={t("academicStaff")}
                                variant="accent"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* User Distribution Chart */}
                            <div
                                className="col-span-1 lg:col-span-2 rounded-xl border border-border bg-card shadow-sm p-4 sm:p-6">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-muted/20 rounded-md">
                                        <PieChart className="w-4 h-4 text-muted-foreground"/>
                                    </div>
                                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                                        {t("userDistribution")}
                                    </h3>
                                </div>
                                <div className="h-[300px] sm:h-[280px] w-full min-w-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RePieChart>
                                            <Pie
                                                data={userChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey="value"
                                                stroke="hsl(var(--card))"
                                                strokeWidth={3}
                                            >
                                                {userChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color}/>
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip/>}/>
                                            <Legend
                                                verticalAlign="bottom"
                                                align="center"
                                                layout="horizontal"
                                                iconType="circle"
                                                wrapperStyle={{paddingTop: '20px', fontSize: '12px'}}
                                                formatter={(value) => <span
                                                    className="text-xs font-medium text-muted-foreground ml-1">{value}</span>}
                                            />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Operational Ratios */}
                            <div
                                className="rounded-xl border border-border bg-card shadow-sm p-4 sm:p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-6">
                                        {t("operationalRatios")}
                                    </h3>
                                    <div className="space-y-8">
                                        <StatRow
                                            label={t("studentCoordinatorRatio")}
                                            value={
                                                userCounts[userRoles.COORDINATOR] > 0
                                                    ? `${Math.round(userCounts[userRoles.STUDENT] / userCounts[userRoles.COORDINATOR])} : 1`
                                                    : "N/A"
                                            }
                                            barColor="bg-accent"
                                            percentage={75}
                                            icon={Scale}
                                        />
                                        <StatRow
                                            label={t("avgProjectsPerOrg")}
                                            value={
                                                userCounts[userRoles.ORGANIZATION] > 0
                                                    ? (stats.totalProjects / userCounts[userRoles.ORGANIZATION]).toFixed(1)
                                                    : "0"
                                            }
                                            barColor="bg-secondary"
                                            percentage={45}
                                            icon={Building2}
                                        />
                                        <StatRow
                                            label={t("coordinatorLoad")}
                                            value={stats.coordinatorLoad.toFixed(1)}
                                            barColor="bg-warning"
                                            percentage={(stats.coordinatorLoad / 10) * 100}
                                            icon={UserCog}
                                        />
                                        <StatRow
                                            label={t("marketDemand")}
                                            value={stats.applicantsPerProject.toFixed(1)}
                                            barColor="bg-primary"
                                            percentage={(stats.applicantsPerProject / 20) * 100}
                                            icon={TrendingUp}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ZONE 2: PROJECT OPERATIONS */}
                <Card className="shadow-sm border-border bg-muted/30 overflow-hidden">
                    <CardHeader className="border-b border-border/50 py-4 px-6">
                        <div className="flex items-center gap-2">
                            <Layout className="h-5 w-5 text-muted-foreground"/>
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                {t("projectOperations")}
                            </CardTitle>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <KpiCard
                                label={t("activeProjects")}
                                value={stats.activeProjects}
                                icon={Briefcase}
                                trend={t("currentlyRunning")}
                                variant="accent"
                            />
                            <KpiCard
                                label={t("pendingReviews")}
                                value={projectCounts[projectStatuses.PENDING_REVIEW]}
                                icon={Clock}
                                trend={t("awaitingApproval")}
                                variant="warning"
                            />
                            <KpiCard
                                label={t("completedProjects")}
                                value={completionCount}
                                icon={CheckCircle}
                                trend={t("successfulOutcomes")}
                                variant="success"
                            />
                            <KpiCard
                                label={t("acceptanceRate")}
                                value={`${stats.acceptanceRate}%`}
                                icon={BarChart3}
                                trend={t("studentPlacement")}
                                variant="info"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Pipeline Chart */}
                            <div
                                className="col-span-1 lg:col-span-2 rounded-xl border border-border bg-card shadow-sm p-4 sm:p-6">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-muted/20 rounded-md">
                                        <BarChart3 className="w-4 h-4 text-muted-foreground"/>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                                            {t("projectPipeline")}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5 opacity-70">
                                            {t("projectPipelineDesc")}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-[300px] sm:h-[280px] w-full min-w-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={projectPipelineData}
                                                  margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false}
                                                           stroke="var(--color-border)" opacity={0.4}/>
                                            <XAxis
                                                dataKey="name"
                                                stroke="var(--color-muted-foreground)"
                                                fontSize={11}
                                                tickLine={false}
                                                axisLine={false}
                                                dy={10}
                                                fontWeight={500}
                                                interval={0}
                                                angle={-15}
                                                textAnchor="end"
                                                height={50}
                                            />
                                            <YAxis
                                                stroke="var(--color-muted-foreground)"
                                                fontSize={11}
                                                tickLine={false}
                                                axisLine={false}
                                                fontWeight={500}
                                            />
                                            <Tooltip content={<CustomTooltip/>}
                                                     cursor={{fill: 'var(--color-muted)', opacity: 0.1}}/>
                                            <Bar
                                                dataKey="value"
                                                fill="var(--color-primary)"
                                                radius={[4, 4, 0, 0]}
                                                barSize={32}
                                                activeBar={{fill: "var(--color-primary-hover)", opacity: 1}}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Applications List */}
                            <div className="rounded-xl border border-border bg-card shadow-sm p-4 sm:p-6 flex flex-col">
                                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-8">
                                    {t("applicationStatus")}
                                </h3>
                                <div className="space-y-8 flex-1">
                                    <StatRow
                                        label={t("pendingApps")}
                                        value={applicationCounts[applicationStatuses.PENDING]}
                                        subValue={`/ ${stats.totalApplications}`}
                                        barColor="bg-warning"
                                        percentage={(applicationCounts[applicationStatuses.PENDING] / stats.totalApplications) * 100}
                                        icon={Clock}
                                    />
                                    <StatRow
                                        label={t("acceptedApps")}
                                        value={applicationCounts[applicationStatuses.ACCEPTED]}
                                        subValue={`/ ${stats.totalApplications}`}
                                        barColor="bg-success"
                                        percentage={(applicationCounts[applicationStatuses.ACCEPTED] / stats.totalApplications) * 100}
                                        icon={CheckCircle}
                                    />
                                    <StatRow
                                        label={t("rejectedApps")}
                                        value={applicationCounts[applicationStatuses.REJECTED]}
                                        subValue={`/ ${stats.totalApplications}`}
                                        barColor="bg-error"
                                        percentage={(applicationCounts[applicationStatuses.REJECTED] / stats.totalApplications) * 100}
                                        icon={ArrowUpRight}
                                    />
                                </div>
                                <div className="mt-8 pt-6 border-t border-border">
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            {t("totalApplicationsProcessed")}
                                        </span>
                                        <span className="text-xl font-bold text-foreground">
                                            {stats.totalApplications}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// --- Sub Components ---

/**
 * KPI Card Component
 */
function KpiCard({
                     label,
                     value,
                     icon: Icon,
                     trend,
                     variant = "default",
                 }: {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    variant?: "default" | "primary" | "secondary" | "accent" | "success" | "warning" | "info" | "muted";
}) {
    const iconContainerStyles = {
        default: "bg-muted text-muted-foreground",
        primary: "bg-primary/10 text-primary",
        secondary: "bg-secondary/10 text-secondary",
        accent: "bg-accent/10 text-accent",
        muted: "bg-muted text-muted-foreground",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        info: "bg-info/10 text-info",
    };

    return (
        <div
            className="relative rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-sm flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {label}
                </span>
                <div className={cn("p-2 rounded-lg", iconContainerStyles[variant] || iconContainerStyles.default)}>
                    <Icon className="w-4 h-4"/>
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-2xl font-bold text-foreground">
                    {value}
                </h3>
                {trend && (
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider opacity-80">
                        {trend}
                    </p>
                )}
            </div>
        </div>
    );
}

/**
 * Stat Row Component
 */
function StatRow({label, value, subValue, percentage, barColor, icon: Icon}: {
    label: string,
    value: string | number,
    subValue?: string,
    percentage: number,
    barColor: string,
    icon?: LucideIcon
}) {
    const safePercent = isNaN(percentage) ? 0 : Math.min(Math.max(percentage, 0), 100);

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground opacity-70"/>}
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                </div>
                <div className="text-right flex items-baseline gap-1">
                    <span className="text-sm font-bold text-foreground">{value}</span>
                    {subValue &&
                        <span className="text-[10px] text-muted-foreground opacity-70 uppercase">{subValue}</span>}
                </div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                <div
                    className={cn("h-full rounded-full transition-all duration-500", barColor)}
                    style={{width: `${safePercent}%`}}
                />
            </div>
        </div>
    );
}

/**
 * Custom Tooltip for Recharts
 */
const CustomTooltip = ({active, payload, label}: any) => {
    if (active && payload && payload.length) {
        return (
            <div className={TOOLTIP_CONTENT_CLASS}>
                <p className="text-xs font-semibold">{label || payload[0].name}: {payload[0].value}</p>
            </div>
        );
    }
    return null;
};
