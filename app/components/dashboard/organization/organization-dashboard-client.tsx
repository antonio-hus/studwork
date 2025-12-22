/** @format */
"use client";

import React, {useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {User} from "@/lib/domain/user";
import {ProjectStatus} from "@/lib/domain/project";
import {ApplicationStatus} from "@/lib/domain/application";
import {
    LayoutDashboard,
    Briefcase,
    Clock,
    CheckCircle,
    Layout,
    BarChart3,
    ArrowUpRight,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {KpiCard, StatRow, CustomTooltip} from "@/components/dashboard/analytics-widgets";

interface Props {
    projectStatuses: typeof ProjectStatus;
    applicationStatuses: typeof ApplicationStatus;
    user: User;
    initialProjectCounts: Record<ProjectStatus, number>;
    initialApplicationCounts: Record<ApplicationStatus, number>;
    initialCompletionCount: number;
}

/**
 * OrganizationDashboardClient
 *
 * Primary visual dashboard for organizations.
 * Displays key metrics, charts, and operational ratios for project monitoring.
 */
export function OrganizationDashboardClient({
                                                projectStatuses,
                                                applicationStatuses,
                                                user,
                                                initialProjectCounts,
                                                initialApplicationCounts,
                                                initialCompletionCount,
                                            }: Props) {
    const t = useTranslations("dashboard.admin"); // Reusing admin translations for now, or create new ones

    const [projectCounts] = useState(initialProjectCounts);
    const [applicationCounts] = useState(initialApplicationCounts);
    const [completionCount] = useState(initialCompletionCount);

    const stats = useMemo(() => {
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

        const applicantsPerProject = activeProjects > 0
            ? (totalApplications / activeProjects)
            : 0;

        return {
            totalApplications,
            acceptanceRate,
            activeProjects,
            totalProjects,
            applicantsPerProject
        };
    }, [projectCounts, applicationCounts, applicationStatuses, projectStatuses]);

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

                {/* ZONE 1: PROJECT OPERATIONS */}
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
                                            {t("marketDemand")}
                                        </span>
                                        <span className="text-xl font-bold text-foreground">
                                            {stats.applicantsPerProject.toFixed(1)}
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
