/** @format */
"use client";
import React from "react";
import {useTranslations} from "next-intl";
import type {ProjectWithDetails, ProjectStatus} from "@/lib/domain/project";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Search, Calendar} from "lucide-react";
import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";
import {ProjectActionsMenu} from "./project-actions-menu";

interface Props {
    projects: ProjectWithDetails[];
    statuses: typeof ProjectStatus;
    isPending: boolean;
    onViewClick: (project: ProjectWithDetails) => void;
    onArchiveClick: (project: ProjectWithDetails) => void;
    onDeleteClick: (project: ProjectWithDetails) => void;
}

/**
 * Responsive Project List.
 * Renders a Card View on mobile devices and a Data Table on desktop.
 */
export function ProjectTable({projects, statuses, isPending, onViewClick, onArchiveClick, onDeleteClick}: Props) {
    const t = useTranslations("admin.projects.table");

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/5">
                <div className="p-4 rounded-full bg-muted/30 mb-3">
                    <Search className="h-8 w-8 opacity-40"/>
                </div>
                <p className="font-medium">{t("noResults")}</p>
                <p className="text-sm opacity-60">{t("tryDifferentSearch")}</p>
            </div>
        );
    }

    return (
        <div className={cn("w-full", isPending && "opacity-50 pointer-events-none transition-opacity")}>
            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-border">
                {projects.map((project) => (
                    <div key={project.id} className="p-4 flex flex-col gap-4 bg-background">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 overflow-hidden flex-1 min-w-0">
                                <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                                    <div
                                        className="font-semibold text-sm text-foreground line-clamp-2 break-words leading-tight"
                                        title={project.title}
                                    >
                                        {project.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {project.organization.user.name}
                                    </div>
                                </div>
                            </div>

                            <div className="shrink-0 -mr-2">
                                <ProjectActionsMenu
                                    statuses={statuses}
                                    project={project}
                                    onViewClick={() => onViewClick(project)}
                                    onArchiveClick={() => onArchiveClick(project)}
                                    onDeleteClick={() => onDeleteClick(project)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={project.status === statuses.PUBLISHED ? "default" : "outline"}>
                                {t(`status.${project.status}`)}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                            <Calendar className="w-3.5 h-3.5 opacity-70"/>
                            <span>
                                {t("header.createdAt")}: {new Date(project.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View - Includes overflow-x-auto for safety */}
            <div className="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead
                                className="py-4 pl-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[300px]">
                                {t("header.title")}
                            </TableHead>
                            <TableHead
                                className="py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                {t("header.organization")}
                            </TableHead>
                            <TableHead
                                className="py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                {t("header.coordinator")}
                            </TableHead>
                            <TableHead
                                className="py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                {t("header.status")}
                            </TableHead>
                            <TableHead
                                className="py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                {t("header.createdAt")}
                            </TableHead>
                            <TableHead
                                className="py-4 pr-6 text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[100px]">
                                {t("header.actions")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map((project) => (
                            <TableRow
                                key={project.id}
                                className="group hover:bg-muted/30 border-border transition-colors duration-200"
                            >
                                <TableCell className="pl-6 py-3">
                                     <span
                                         className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate block max-w-xs"
                                         title={project.title}>
                                        {project.title}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-9 w-9 border border-border bg-white">
                                            <AvatarImage
                                                src={project.organization.user.profilePictureUrl || undefined}/>
                                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                {project.organization.user.name?.charAt(0) || "O"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-sm text-foreground">
                                                {project.organization.user.name}
                                            </span>
                                            <span
                                                className="text-xs text-muted-foreground">{project.organization.user.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {project.coordinator ? (
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-9 w-9 border border-border bg-white">
                                                <AvatarImage
                                                    src={project.coordinator.user.profilePictureUrl || undefined}/>
                                                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                    {project.coordinator.user.name?.charAt(0) || "C"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-semibold text-sm text-foreground">
                                                    {project.coordinator.user.name}
                                                </span>
                                                <span
                                                    className="text-xs text-muted-foreground">{project.coordinator.user.email}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">{t("unassigned")}</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={project.status === statuses.PUBLISHED ? "default" : "outline"}>
                                        {t(`status.${project.status}`)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm font-medium">
                                    {new Date(project.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <ProjectActionsMenu
                                        statuses={statuses}
                                        project={project}
                                        onViewClick={() => onViewClick(project)}
                                        onArchiveClick={() => onArchiveClick(project)}
                                        onDeleteClick={() => onDeleteClick(project)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
