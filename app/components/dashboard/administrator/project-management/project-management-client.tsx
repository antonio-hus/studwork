/** @format */
"use client";

import React, {useState, useCallback, useTransition} from "react";
import {useRouter, usePathname, useSearchParams} from "next/navigation";
import {useTranslations} from "next-intl";
import type {ProjectWithDetails, ProjectStatus} from "@/lib/domain/project";
import {Briefcase} from "lucide-react";
import {Card, CardContent, CardHeader, CardFooter} from "@/components/ui/card";
import {ProjectToolbar} from "@/components/dashboard/administrator/project-management/project-toolbar";
import {ProjectTable} from "@/components/dashboard/administrator/project-management/project-table";
import {PaginationFooter} from "@/components/dashboard/administrator/user-management/pagination-footer";
import {ProjectDetailsDialog} from "./project-details-dialog";
import {ArchiveProjectDialog} from "./archive-project-dialog";
import {DeleteProjectDialog} from "./delete-project-dialog";

interface PageProps {
    statuses: typeof ProjectStatus;
    initialProjects: ProjectWithDetails[];
    initialPagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    initialFilters: {
        search: string;
        status: ProjectStatus | "ALL";
    };
}

/**
 * Project Management Client Page.
 *
 * Orchestrates state management, URL synchronization, and layout.
 */
export function ProjectManagementClient({statuses, initialProjects, initialPagination, initialFilters,}: PageProps) {
    const t = useTranslations("admin.projects");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [viewTarget, setViewTarget] = useState<ProjectWithDetails | null>(null);
    const [archiveTarget, setArchiveTarget] = useState<ProjectWithDetails | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ProjectWithDetails | null>(null);


    const updateUrl = useCallback(
        (updates: Record<string, string | number | null>) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(updates).forEach(([key, value]) => {
                if (value === null || value === "" || value === "ALL") {
                    params.delete(key);
                } else {
                    params.set(key, String(value));
                }
            });

            if (updates.search !== undefined || updates.status !== undefined) {
                params.set("page", "1");
            } else if (!updates.page) {
                params.set("page", "1");
            }

            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
            });
        },
        [pathname, router, searchParams]
    );

    return (
        <div className="min-h-screen w-full bg-background p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-500 space-y-6">

                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 shadow-sm">
                            <Briefcase className="h-6 w-6 text-primary"/>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {t("title")}
                            </h1>
                            <p className="text-sm text-muted-foreground max-w-lg">
                                {t("subtitle")}
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="shadow-xl border-border overflow-hidden bg-surface">
                    <CardHeader className="bg-surface/50 pb-4 pt-6 px-6">
                        <ProjectToolbar
                            initialSearch={initialFilters.search}
                            initialStatus={initialFilters.status}
                            statuses={statuses}
                            isPending={isPending}
                            onFilterChange={updateUrl}
                        />
                    </CardHeader>

                    <CardContent className="p-0 border-t border-border">
                        <ProjectTable
                            projects={initialProjects}
                            statuses={statuses}
                            isPending={isPending}
                            onViewClick={setViewTarget}
                            onArchiveClick={setArchiveTarget}
                            onDeleteClick={setDeleteTarget}
                        />
                    </CardContent>

                    <CardFooter className="bg-muted/30 border-t border-border p-4">
                        <PaginationFooter
                            currentCount={initialProjects.length}
                            pagination={initialPagination}
                            onPageChange={(page: number) => updateUrl({page})}
                            disabled={isPending}
                        />
                    </CardFooter>
                </Card>
            </div>
            <ProjectDetailsDialog
                statuses={statuses}
                project={viewTarget}
                open={!!viewTarget}
                onOpenChange={(open: boolean) => !open && setViewTarget(null)}
            />
            <ArchiveProjectDialog
                target={archiveTarget}
                onOpenChange={(open: boolean) => !open && setArchiveTarget(null)}
                onSuccess={() => setArchiveTarget(null)}
            />
            <DeleteProjectDialog
                target={deleteTarget}
                onOpenChange={(open: boolean) => !open && setDeleteTarget(null)}
                onSuccess={() => setDeleteTarget(null)}
            />
        </div>
    );
}
