/** @format */
"use client";

import React, {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Loader2,
    Filter,
    Search,
    Send,
    Undo
} from "lucide-react";
import type {
    ProjectStatus,
    ProjectWithDetails,
} from "@/lib/domain/project";
import {
    getMyOrganizationProjects,
    updateMyOrganizationProject
} from "@/lib/controller/organization/organization-projects-controller";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {DeleteProjectDialog} from "./delete-project-dialog";
import {PaginationResult} from "@/lib/domain/pagination";
import {cn} from "@/lib/utils";
import {toast} from "sonner";

export function OrganizationProjectList({projectStatuses}: { projectStatuses: typeof ProjectStatus }) {
    const t = useTranslations("organization.projects");
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
    const [pagination, setPagination] = useState<PaginationResult<any> | null>(
        null
    );
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<ProjectWithDetails | null>(
        null
    );

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const result = await getMyOrganizationProjects(
                {page, pageSize: 10},
                statusFilter === "ALL" ? undefined : statusFilter,
                searchQuery
            );
            if (result.success) {
                setProjects(result.data.items);
                setPagination(result.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProjects();
        }, 300);
        return () => clearTimeout(timer);
    }, [page, statusFilter, searchQuery]);

    const handleEdit = (id: string) => {
        router.push(`/dashboard/projects/${id}`);
    };

    const handleStatusChange = async (project: ProjectWithDetails, newStatus: ProjectStatus) => {
        try {
            const result = await updateMyOrganizationProject(project.id, {
                status: newStatus
            });
            if (result.success) {
                if (newStatus === projectStatuses.PENDING_REVIEW) {
                    toast.success(t("form.publish_success"));
                } else if (newStatus === projectStatuses.DRAFT) {
                    toast.success(t("form.revert_success"));
                } else {
                    toast.success(t("form.update_success"));
                }
                fetchProjects();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error(t("form.unexpected_error"));
        }
    };

    const getStatusBadgeVariant = (status: ProjectStatus) => {
        switch (status) {
            case projectStatuses.PUBLISHED:
                return "default";
            case projectStatuses.DRAFT:
                return "secondary";
            case projectStatuses.COMPLETED:
                return "outline";
            default:
                return "secondary";
        }
    };

    const ActionsMenu = ({project}: { project: ProjectWithDetails }) => {
        const isEditable = project.status !== projectStatuses.ARCHIVED && project.status !== projectStatuses.COMPLETED;

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    >
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-[200px] bg-background border-border shadow-xl z-50"
                >
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("actions.label")}
                    </DropdownMenuLabel>

                    {project.status === projectStatuses.DRAFT && (
                        <DropdownMenuItem
                            onClick={() => handleStatusChange(project, projectStatuses.PENDING_REVIEW)}
                            className="cursor-pointer focus:bg-muted"
                        >
                            <Send className="mr-2 h-4 w-4 text-muted-foreground"/>
                            {t("actions.publish")}
                        </DropdownMenuItem>
                    )}

                    {project.status === projectStatuses.PENDING_REVIEW && (
                        <DropdownMenuItem
                            onClick={() => handleStatusChange(project, projectStatuses.DRAFT)}
                            className="cursor-pointer focus:bg-muted"
                        >
                            <Undo className="mr-2 h-4 w-4 text-muted-foreground"/>
                            {t("actions.revert_to_draft")}
                        </DropdownMenuItem>
                    )}

                    {isEditable && (
                        <>
                            <DropdownMenuItem
                                onClick={() => handleEdit(project.id)}
                                className="cursor-pointer focus:bg-muted"
                            >
                                <Pencil className="mr-2 h-4 w-4 text-muted-foreground"/>
                                {t("actions.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem
                                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                onClick={() => setDeleteTarget(project)}
                            >
                                <Trash2 className="mr-2 h-4 w-4"/>
                                {t("actions.delete")}
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-sm border-border bg-muted/30 overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-background/50 backdrop-blur-sm p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex w-full sm:w-auto items-center gap-2">
                            <div className="relative group w-full sm:w-[320px]">
                                <Search
                                    className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"/>
                                <Input
                                    placeholder={t("toolbar.searchPlaceholder")}
                                    className="pl-10 h-10 bg-background border-input focus:ring-1 focus:ring-primary/20 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={fetchProjects}
                                disabled={isLoading}
                                className="h-10 px-4 border-input hover:bg-accent"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : t('toolbar.search')}
                            </Button>
                        </div>

                        <Select
                            value={statusFilter}
                            onValueChange={(val) =>
                                setStatusFilter(val as ProjectStatus | "ALL")
                            }
                        >
                            <SelectTrigger className="w-full sm:w-[200px] h-10 bg-background border-input">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Filter className="h-3.5 w-3.5"/>
                                    <span className="text-foreground">
                                        <SelectValue placeholder={t("filter_status")}/>
                                    </span>
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-background border-border shadow-xl min-w-[200px] z-50">
                                <SelectItem value="ALL">{t("status.all")}</SelectItem>
                                {Object.values(projectStatuses).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {t(`status.${status.toLowerCase()}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/5">
                            <div className="p-4 rounded-full bg-muted/30 mb-3">
                                <Search className="h-8 w-8 opacity-40"/>
                            </div>
                            <p className="font-medium">{t("no_projects")}</p>
                        </div>
                    ) : (
                        <div className={cn("w-full", isLoading && "opacity-50 pointer-events-none transition-opacity")}>
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
                                                        {new Date(project.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="shrink-0 -mr-2">
                                                <ActionsMenu project={project}/>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant={getStatusBadgeVariant(project.status)}>
                                                {t(`status.${project.status.toLowerCase()}`)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="hover:bg-transparent border-border">
                                            <TableHead
                                                className="py-4 pl-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[300px]">
                                                {t("table.title")}
                                            </TableHead>
                                            <TableHead
                                                className="py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                                {t("table.status")}
                                            </TableHead>
                                            <TableHead
                                                className="py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                                {t("table.created_at")}
                                            </TableHead>
                                            <TableHead
                                                className="py-4 pr-6 text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[100px]">
                                                {t("table.actions")}
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
                                                    <Badge variant={getStatusBadgeVariant(project.status)}>
                                                        {t(`status.${project.status.toLowerCase()}`)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm font-medium">
                                                    {new Date(project.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <ActionsMenu project={project}/>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-end space-x-2 p-4 border-t border-border">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                {t("pagination.previous")}
                            </Button>
                            <div className="text-sm text-muted-foreground">
                                {t("pagination.page", {
                                    current: page,
                                    total: pagination.totalPages,
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                                }
                                disabled={page === pagination.totalPages}
                            >
                                {t("pagination.next")}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <DeleteProjectDialog
                target={deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                onSuccess={fetchProjects}
            />
        </div>
    );
}
