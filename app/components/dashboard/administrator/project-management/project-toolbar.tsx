/** @format */
"use client";
import React, {useState, useEffect} from "react";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import type {ProjectStatus} from "@/lib/domain/project";
import {Search, Filter, Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";

interface Props {
    initialSearch: string;
    initialStatus: ProjectStatus | "ALL";
    statuses: typeof ProjectStatus;
    isPending: boolean;
    onFilterChange: (filters: { search?: string; status?: string }) => void;
}

/**
 * A toolbar component for filtering projects in the admin dashboard.
 *
 * It provides a search input for filtering by project title and a dropdown
 * to filter by project status. The search is triggered by pressing Enter or
 * clicking the search button.
 *
 * @param {string} initialSearch - The initial search query value.
 * @param {ProjectStatus | "ALL"} initialStatus - The initial status filter value.
 * @param {typeof ProjectStatus} statuses - An object containing all possible project statuses.
 * @param {boolean} isPending - A flag indicating if a transition is pending, used to disable inputs.
 * @param {(filters: { search?: string; status?: string }) => void} onFilterChange - Callback function triggered when filters are updated.
 */
export function ProjectToolbar({initialSearch, initialStatus, statuses, isPending, onFilterChange}: Props) {
    const t = useTranslations("admin.projects.toolbar");
    const [searchTerm, setSearchTerm] = useState(initialSearch);

    useEffect(() => {
        setSearchTerm(initialSearch);
    }, [initialSearch]);

    const handleSearch = () => {
        if (searchTerm !== initialSearch) {
            onFilterChange({search: searchTerm});
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex w-full sm:w-auto items-center gap-2">
                <div className="relative group w-full sm:w-[320px]">
                    <Search
                        className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"/>
                    <Input
                        placeholder={t("searchPlaceholder")}
                        className="pl-10 h-10 bg-background border-input focus:ring-1 focus:ring-primary/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={handleSearch}
                    disabled={isPending}
                    className="h-10 px-4 border-input hover:bg-accent"
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : t('search')}
                </Button>
            </div>

            <Select
                value={initialStatus}
                onValueChange={(val) => onFilterChange({status: val})}
            >
                <SelectTrigger className="w-full sm:w-[200px] h-10 bg-background border-input">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Filter className="h-3.5 w-3.5"/>
                        <span className="text-foreground">
                            <SelectValue placeholder={t("statusSelect.placeholder")}/>
                        </span>
                    </div>
                </SelectTrigger>
                <SelectContent
                    className="bg-background border-border shadow-xl min-w-[200px] z-50 isolate opacity-100"
                    style={{backgroundColor: "var(--color-background, #ffffff)", opacity: 1}}
                >
                    <SelectItem value="ALL">{t("statusSelect.all")}</SelectItem>
                    {Object.values(statuses).map((s) => (
                        <SelectItem key={s} value={s}>
                            {t(`statusSelect.${s}`)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
