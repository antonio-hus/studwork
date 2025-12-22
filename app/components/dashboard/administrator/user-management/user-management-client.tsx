/** @format */
"use client";

import React, {useState, useCallback, useTransition} from "react";
import {useRouter, usePathname, useSearchParams} from "next/navigation";
import {useTranslations} from "next-intl";
import type {User, UserRole} from "@/lib/domain/user";
import {Users} from "lucide-react";
import {Card, CardContent, CardHeader, CardFooter} from "@/components/ui/card";
import {UserToolbar} from "@/components/dashboard/administrator/user-management/user-toolbar";
import {UserTable} from "@/components/dashboard/administrator/user-management/user-table";
import {PaginationFooter} from "@/components/dashboard/administrator/user-management/pagination-footer";
import {SuspendUserDialog} from "@/components/dashboard/administrator/user-management/suspend-user-dialog";
import {UserProfileDialog} from "@/components/dashboard/administrator/user-management/user-profile-dialog";
import {DeleteUserDialog} from "@/components/dashboard/administrator/user-management/delete-user-dialog";

interface PageProps {
    roles: typeof UserRole;
    initialUsers: User[];
    initialPagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    initialFilters: {
        search: string;
        role: UserRole | "ALL";
    };
}

/**
 * User Management Client Page.
 *
 * Orchestrates state management, URL synchronization, and layout.
 */
export function UserManagementClient({roles, initialUsers, initialPagination, initialFilters,}: PageProps) {
    const t = useTranslations("admin.users");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [suspensionTarget, setSuspensionTarget] = useState<User | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [viewTarget, setViewTarget] = useState<User | null>(null);

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

            if (updates.search !== undefined || updates.role !== undefined) {
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
                            <Users className="h-6 w-6 text-primary"/>
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
                        <UserToolbar
                            initialSearch={initialFilters.search}
                            initialRole={initialFilters.role}
                            roles={roles}
                            isPending={isPending}
                            onFilterChange={updateUrl}
                        />
                    </CardHeader>

                    <CardContent className="p-0 border-t border-border">
                        <UserTable
                            users={initialUsers}
                            roles={roles}
                            isPending={isPending}
                            onSuspendClick={setSuspensionTarget}
                            onDeleteClick={setDeleteTarget}
                            onViewClick={setViewTarget}
                        />
                    </CardContent>

                    <CardFooter className="bg-muted/30 border-t border-border p-4">
                        <PaginationFooter
                            currentCount={initialUsers.length}
                            pagination={initialPagination}
                            onPageChange={(page: number) => updateUrl({page})}
                            disabled={isPending}
                        />
                    </CardFooter>
                </Card>
            </div>

            <SuspendUserDialog
                target={suspensionTarget}
                onOpenChange={(open: boolean) => !open && setSuspensionTarget(null)}
                onSuccess={() => {
                    setSuspensionTarget(null);
                    router.refresh();
                }}
            />

            <DeleteUserDialog
                target={deleteTarget}
                onOpenChange={(open: boolean) => !open && setDeleteTarget(null)}
                onSuccess={() => {
                    setDeleteTarget(null);
                    router.refresh();
                }}
            />

            <UserProfileDialog
                user={viewTarget}
                open={!!viewTarget}
                onOpenChange={(open: boolean) => !open && setViewTarget(null)}
                roles={roles}
            />
        </div>
    );
}