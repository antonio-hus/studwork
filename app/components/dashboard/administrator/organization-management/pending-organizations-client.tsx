/** @format */
"use client";

import React, {useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {Building2, CheckCircle2, XCircle, MoreHorizontal, Eye} from "lucide-react";
import {OrganizationWithUser} from "@/lib/domain/organization";
import {UserRole} from "@/lib/domain/user";
import {verifyOrganization} from "@/lib/controller/admin/user-management-controller";

import {Card, CardHeader, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import {UserProfileDialog} from "@/components/dashboard/administrator/user-management/user-profile-dialog";
import {RejectOrganizationDialog} from "./reject-organization-dialog";

interface Props {
    initialData: OrganizationWithUser[];
    roles: typeof UserRole;
}

export function PendingOrganizationsClient({initialData, roles}: Props) {
    const t = useTranslations("admin.organizations");
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [viewTarget, setViewTarget] = useState<OrganizationWithUser | null>(null);
    const [rejectTarget, setRejectTarget] = useState<OrganizationWithUser | null>(null);

    const handleApprove = async (id: string) => {
        startTransition(async () => {
            const result = await verifyOrganization(id);
            if (result.success) {
                toast.success(t("success.approved"));
                router.refresh();
            } else {
                toast.error(result.error);
            }
        });
    };

    return (
        <div className="min-h-screen w-full bg-background p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-500 space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 shadow-sm">
                            <Building2 className="h-6 w-6 text-primary"/>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {t("pending.title")}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {t("pending.subtitle", {count: initialData.length})}
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="shadow-xl border-border overflow-hidden bg-surface">
                    <CardHeader className="bg-surface/50 border-b border-border px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{t("pending.listDescription")}</span>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {initialData.length === 0 ? (
                            <div
                                className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-muted/5">
                                <div className="p-4 rounded-full bg-muted/30 mb-3">
                                    <CheckCircle2 className="h-8 w-8 opacity-40 text-success"/>
                                </div>
                                <p className="font-medium">{t("pending.empty")}</p>
                            </div>
                        ) : (
                            <>
                                {/* Mobile View */}
                                <div className="block md:hidden divide-y divide-border">
                                    {initialData.map((org) => (
                                        <div key={org.id} className="p-4 flex flex-col gap-4 bg-background">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-border">
                                                        <AvatarImage src={org.user.profilePictureUrl || undefined}/>
                                                        <AvatarFallback
                                                            className="bg-primary/5 text-primary text-xs font-bold">
                                                            {org.user.name?.charAt(0) || "O"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-semibold text-sm">{org.user.name}</div>
                                                        <div className="text-xs text-muted-foreground">{org.type}</div>
                                                    </div>
                                                </div>
                                                <ActionsMenu
                                                    org={org}
                                                    onView={() => setViewTarget(org)}
                                                    onApprove={() => handleApprove(org.user.id)}
                                                    onReject={() => setRejectTarget(org)}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="w-full bg-success hover:bg-success/90 text-white"
                                                    onClick={() => handleApprove(org.user.id)}
                                                >
                                                    {t("actions.approve")}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full text-error hover:text-error hover:bg-error/10 border-error/20"
                                                    onClick={() => setRejectTarget(org)}
                                                >
                                                    {t("actions.reject")}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow className="hover:bg-transparent border-border">
                                                <TableHead className="pl-6">{t("columns.organization")}</TableHead>
                                                <TableHead>{t("columns.type")}</TableHead>
                                                <TableHead>{t("columns.contact")}</TableHead>
                                                <TableHead>{t("columns.applied")}</TableHead>
                                                <TableHead
                                                    className="text-right pr-6">{t("columns.actions")}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {initialData.map((org) => (
                                                <TableRow key={org.id} className="hover:bg-muted/30">
                                                    <TableCell className="pl-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9 border border-border bg-white">
                                                                <AvatarImage
                                                                    src={org.user.profilePictureUrl || undefined}/>
                                                                <AvatarFallback
                                                                    className="bg-primary/5 text-primary text-xs font-bold">
                                                                    {org.user.name?.charAt(0) || "O"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span
                                                                    className="font-medium text-sm">{org.user.name}</span>
                                                                <span
                                                                    className="text-xs text-muted-foreground">{org.user.email}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="font-normal capitalize">
                                                            {org.type.toLowerCase().replace("_", " ")}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {org.contactPerson || "N/A"}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(org.user.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => setViewTarget(org)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Eye className="w-4 h-4 text-muted-foreground"/>
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleApprove(org.user.id)}
                                                                disabled={isPending}
                                                                className="h-8 bg-success/10 text-success hover:bg-success/20 hover:text-success border-0 shadow-none"
                                                            >
                                                                {t("actions.approve")}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => setRejectTarget(org)}
                                                                disabled={isPending}
                                                                className="h-8 w-8 p-0 text-error hover:bg-error/10 hover:text-error"
                                                            >
                                                                <XCircle className="w-4 h-4"/>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dialogs */}
            <UserProfileDialog
                user={viewTarget ? viewTarget.user : null}
                open={!!viewTarget}
                onOpenChange={(open) => !open && setViewTarget(null)}
                roles={roles}
            />

            <RejectOrganizationDialog
                target={rejectTarget}
                onOpenChange={(open) => !open && setRejectTarget(null)}
                onSuccess={() => {
                    setRejectTarget(null);
                    router.refresh();
                }}
            />
        </div>
    );
}

function ActionsMenu({org, onView, onApprove, onReject}: any) {
    const t = useTranslations("admin.organizations.actions");
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreHorizontal className="w-4 h-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover z-50">
                <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
                <DropdownMenuItem onClick={onView}>
                    <Eye className="w-4 h-4 mr-2"/> {t("viewProfile")}
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={onApprove} className="text-success focus:text-success focus:bg-success/10">
                    <CheckCircle2 className="w-4 h-4 mr-2"/> {t("approve")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onReject} className="text-error focus:text-error focus:bg-error/10">
                    <XCircle className="w-4 h-4 mr-2"/> {t("reject")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}