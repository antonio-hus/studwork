/** @format */
"use client";
import React from "react";
import {useTranslations} from "next-intl";
import {ProjectWithDetails} from "@/lib/domain/project";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {MoreHorizontal, Archive, Trash2, Eye} from "lucide-react";

interface Props {
    project: ProjectWithDetails;
    onViewClick: () => void;
    onArchiveClick: () => void;
    onDeleteClick: () => void;
}

export function ProjectActionsMenu({project, onViewClick, onArchiveClick, onDeleteClick}: Props) {
    const t = useTranslations("admin.projects.table");

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
                className="w-[200px] bg-white dark:bg-zinc-950 border-border shadow-xl z-50 isolate opacity-100"
                style={{backgroundColor: "var(--color-background, #ffffff)", opacity: 1}}
            >
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("header.actions")}
                </DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={onViewClick}
                    className="cursor-pointer focus:bg-muted"
                >
                    <Eye className="mr-2 h-4 w-4 text-muted-foreground"/>
                    {t("viewDetails")}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={onArchiveClick}
                    className="cursor-pointer focus:bg-muted"
                >
                    <Archive className="mr-2 h-4 w-4 text-muted-foreground"/>
                    {t("archive")}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={onDeleteClick}
                    className="cursor-pointer text-error focus:text-error focus:bg-error/10"
                >
                    <Trash2 className="mr-2 h-4 w-4"/>
                    {t("delete")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
