/** @format */
"use client";

import React, {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {
    MoreHorizontal,
    Loader2,
    Search,
    Eye,
    ChevronDown,
    ChevronUp,
    SlidersHorizontal
} from "lucide-react";
import type {
    ProjectCompletionStatus,
    ProjectCompletionWithDetails,
} from "@/lib/domain/project-completion";
import {getOrganizationProjectCompletions} from "@/lib/controller/organization/organization-project-completions-controller";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {PaginationResult} from "@/lib/domain/pagination";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {CompletionFilterOptions} from "@/lib/repository/project-completion-repository";

export function OrganizationCompletionList({completionStatuses}: { completionStatuses: typeof ProjectCompletionStatus }) {
    const t = useTranslations("organization.completions");
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [completions, setCompletions] = useState<ProjectCompletionWithDetails[]>([]);
    const [pagination, setPagination] = useState<PaginationResult<any> | null>(
        null
    );
    const [page, setPage] = useState(1);
    
    // Search State
    const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
    const [filters, setFilters] = useState<CompletionFilterOptions>({
        studentName: "",
        projectName: "",
        coordinatorName: ""
    });

    const fetchCompletions = async () => {
        setIsLoading(true);
        try {
            const result = await getOrganizationProjectCompletions(page, 10, filters);
            if (result.success && result.data) {
                setCompletions(result.data.items);
                setPagination(result.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCompletions();
    }, [page]);

    const handleSearch = () => {
        setPage(1);
        fetchCompletions();
    };

    const handleFilterChange = (key: keyof CompletionFilterOptions, value: string) => {
        setFilters(prev => ({...prev, [key]: value}));
    };

    const handleView = (id: string) => {
        router.push(`/dashboard/completions/${id}`);
    };

    const getStatusBadgeVariant = (status: ProjectCompletionStatus) => {
        switch (status) {
            case completionStatuses.PUBLISHED:
                return "default";
            case completionStatuses.COORDINATOR_REVIEWED:
                return "secondary";
            default:
                return "outline";
        }
    };

    const ActionsMenu = ({completion}: { completion: ProjectCompletionWithDetails }) => (
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
                <DropdownMenuItem
                    onClick={() => handleView(completion.id)}
                    className="cursor-pointer focus:bg-muted"
                >
                    <Eye className="mr-2 h-4 w-4 text-muted-foreground"/>
                    {t("actions.view")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="space-y-6">
            <Card className="shadow-sm border-border bg-muted/30 overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-background/50 backdrop-blur-sm p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        {/* Left Side: Search Input + Button */}
                        <div className="flex w-full sm:w-auto items-center gap-2">
                            <div className="relative group w-full sm:w-[320px]">
                                <Search
                                    className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"/>
                                <Input
                                    placeholder={t("toolbar.searchPlaceholder")}
                                    className="pl-10 h-10 bg-background border-input focus:ring-1 focus:ring-primary/20 transition-all"
                                    value={filters.projectName || ""}
                                    onChange={(e) => handleFilterChange("projectName", e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleSearch}
                                disabled={isLoading}
                                className="h-10 px-4 border-input hover:bg-accent"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : t('toolbar.search')}
                            </Button>
                        </div>

                        {/* Right Side: Advanced Search Toggle */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAdvancedSearchOpen(!advancedSearchOpen)}
                            className={cn(
                                "gap-2 transition-colors h-10 border-input w-full sm:w-auto",
                                advancedSearchOpen && "bg-muted text-foreground"
                            )}
                        >
                            <SlidersHorizontal className="h-4 w-4"/>
                            {t("advanced_search.toggle")}
                            {advancedSearchOpen ? (
                                <ChevronUp className="h-4 w-4"/>
                            ) : (
                                <ChevronDown className="h-4 w-4"/>
                            )}
                        </Button>
                    </div>

                    {/* Advanced Search Panel */}
                    {advancedSearchOpen && (
                        <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="studentName" className="text-xs font-medium text-muted-foreground uppercase">
                                        {t("advanced_search.student_name")}
                                    </Label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                                        <Input
                                            id="studentName"
                                            placeholder={t("advanced_search.student_name_placeholder")}
                                            value={filters.studentName || ""}
                                            onChange={(e) => handleFilterChange("studentName", e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className="pl-9 bg-background"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="coordinatorName" className="text-xs font-medium text-muted-foreground uppercase">
                                        {t("advanced_search.coordinator_name")}
                                    </Label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                                        <Input
                                            id="coordinatorName"
                                            placeholder={t("advanced_search.coordinator_name_placeholder")}
                                            value={filters.coordinatorName || ""}
                                            onChange={(e) => handleFilterChange("coordinatorName", e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className="pl-9 bg-background"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                        </div>
                    ) : completions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/5">
                            <div className="p-4 rounded-full bg-muted/30 mb-3">
                                <Search className="h-8 w-8 opacity-40"/>
                            </div>
                            <p className="font-medium">{t("no_completions")}</p>
                        </div>
                    ) : (
                        <div className={cn("w-full", isLoading && "opacity-50 pointer-events-none transition-opacity")}>
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="hover:bg-transparent border-border">
                                            <TableHead
                                                className="py-4 pl-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[300px]">
                                                {t("table.project")}
                                            </TableHead>
                                            <TableHead
                                                className="py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                                {t("table.student")}
                                            </TableHead>
                                            <TableHead
                                                className="py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                                {t("table.status")}
                                            </TableHead>
                                            <TableHead
                                                className="py-4 pr-6 text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[100px]">
                                                {t("table.actions")}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {completions.map((completion) => (
                                            <TableRow
                                                key={completion.id}
                                                className="group hover:bg-muted/30 border-border transition-colors duration-200"
                                            >
                                                <TableCell className="pl-6 py-3">
                                                    <span
                                                        className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate block max-w-xs"
                                                        title={completion.project.title}>
                                                        {completion.project.title}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">{completion.student.user.name}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadgeVariant(completion.status)}>
                                                        {t(`status.${completion.status.toLowerCase()}`)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <ActionsMenu completion={completion}/>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

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
        </div>
    );
}
