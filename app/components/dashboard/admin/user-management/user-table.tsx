/** @format */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { User, UserRole } from "@/lib/domain/user";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

import { RoleBadge } from "./role-badge";
import { StatusBadge } from "./status-badge";
import { UserActionsMenu } from "./user-actions-menu";

interface Props {
    users: User[];
    roles: typeof UserRole;
    isPending: boolean;
    onSuspendClick: (user: User) => void;
}

/**
 * Main data grid for user management.
 */
export function UserTable({ users, roles, isPending, onSuspendClick }: Props) {
    const t = useTranslations("admin.users");

    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/5">
                <div className="p-4 rounded-full bg-muted/30 mb-3">
                    <Search className="h-8 w-8 opacity-40" />
                </div>
                <p className="font-medium">{t("noResults")}</p>
                <p className="text-sm opacity-60">{t("tryDifferentSearch")}</p>
            </div>
        );
    }

    return (
        <Table className={cn(isPending && "opacity-50 pointer-events-none transition-opacity")}>
            <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="py-4 pl-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        {t("columns.user")}
                    </TableHead>
                    <TableHead className="py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        {t("columns.role")}
                    </TableHead>
                    <TableHead className="py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        {t("columns.status")}
                    </TableHead>
                    <TableHead className="py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        {t("columns.joined")}
                    </TableHead>
                    <TableHead className="py-4 pr-6 text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        {t("columns.actions")}
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow
                        key={user.id}
                        className="group hover:bg-muted/30 border-border transition-colors duration-200"
                    >
                        <TableCell className="pl-6 py-3">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-9 w-9 border border-border bg-white">
                                    <AvatarImage src={user.profilePictureUrl || undefined} />
                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                        {user.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                        {user.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <RoleBadge role={user.role} roles={roles} />
                        </TableCell>
                        <TableCell>
                            <StatusBadge user={user} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm font-medium">
                            {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                            <UserActionsMenu user={user} roles={roles} onSuspendClick={() => onSuspendClick(user)} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}