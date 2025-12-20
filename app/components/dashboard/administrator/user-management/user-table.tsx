/** @format */
"use client";

import React from "react";
import {useTranslations} from "next-intl";
import {User, UserRole} from "@/lib/domain/user";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Search, Calendar} from "lucide-react";
import {cn} from "@/lib/utils";

import {RoleBadge} from "./role-badge";
import {StatusBadge} from "./status-badge";
import {UserActionsMenu} from "./user-actions-menu";

interface Props {
    users: User[];
    roles: typeof UserRole;
    isPending: boolean;
    onSuspendClick: (user: User) => void;
    onViewClick: (user: User) => void;
}

/**
 * Responsive User List.
 * Renders a Card View on mobile devices and a Data Table on desktop.
 */
export function UserTable({users, roles, isPending, onSuspendClick, onViewClick}: Props) {
    const t = useTranslations("admin.users");

    if (users.length === 0) {
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
            <div className="block md:hidden divide-y divide-border">
                {users.map((user) => (
                    <div key={user.id} className="p-4 flex flex-col gap-4 bg-background">
                        {/* Header: User Info & Actions */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Avatar className="h-10 w-10 border border-border">
                                    <AvatarImage
                                        className="h-full w-full object-cover"
                                        src={user.profilePictureUrl || undefined}
                                    />
                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                        {user.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-semibold text-sm text-foreground truncate">
                                        {user.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground truncate">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                            <UserActionsMenu
                                user={user}
                                roles={roles}
                                onSuspendClick={() => onSuspendClick(user)}
                                onViewClick={() => onViewClick(user)}
                            />
                        </div>

                        {/* Badges Row */}
                        <div className="flex flex-wrap items-center gap-2">
                            <RoleBadge role={user.role} roles={roles}/>
                            <StatusBadge user={user}/>
                        </div>

                        {/* Footer: Date */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                            <Calendar className="w-3.5 h-3.5 opacity-70"/>
                            <span>
                                {t("columns.joined")}: {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead
                                className="py-4 pl-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[300px]">
                                {t("columns.user")}
                            </TableHead>
                            <TableHead
                                className="py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                {t("columns.role")}
                            </TableHead>
                            <TableHead
                                className="py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                {t("columns.status")}
                            </TableHead>
                            <TableHead
                                className="py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                {t("columns.joined")}
                            </TableHead>
                            <TableHead
                                className="py-4 pr-6 text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[100px]">
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
                                            <AvatarImage className="h-full w-full object-cover" src={user.profilePictureUrl || undefined}/>
                                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                {user.name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col gap-0.5">
                                            <span
                                                className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                                {user.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <RoleBadge role={user.role} roles={roles}/>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge user={user}/>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm font-medium">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <UserActionsMenu
                                        user={user}
                                        roles={roles}
                                        onSuspendClick={() => onSuspendClick(user)}
                                        onViewClick={() => onViewClick(user)}
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