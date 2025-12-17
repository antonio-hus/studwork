/** @format */
"use client";

import React, {useState, useCallback, useTransition} from "react";
import {useRouter, usePathname, useSearchParams} from "next/navigation";
import {useTranslations} from "next-intl";
import type {User, UserRole} from "@/lib/domain/user";
import {Users} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardFooter,
} from "@/components/ui/card";
import {UserToolbar} from "./user-toolbar";
import {UserTable} from "./user-table";
import {PaginationFooter} from "./pagination-footer";
import {SuspendUserDialog} from "./suspend-user-dialog";

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

    // Local state for modal interactions
    const [suspensionTarget, setSuspensionTarget] = useState<User | null>(null);

    // URL State Management
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

            // Reset to page 1 if filters change (search or role), but not if page changes
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

                {/* Header Section */}
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

                {/* Main Content Card */}
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
                        />
                    </CardContent>

                    <CardFooter className="bg-muted/30 border-t border-border p-4">
                        <PaginationFooter
                            currentCount={initialUsers.length}
                            pagination={initialPagination}
                            onPageChange={(page) => updateUrl({page})}
                            disabled={isPending}
                        />
                    </CardFooter>
                </Card>
            </div>

            {/* Suspend User Modal */}
            <SuspendUserDialog
                target={suspensionTarget}
                onOpenChange={(open) => !open && setSuspensionTarget(null)}
                onSuccess={() => {
                    setSuspensionTarget(null);
                    router.refresh();
                }}
            />
        </div>
    );
}