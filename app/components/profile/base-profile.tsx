/** @format */
"use client";

import React, {useState} from "react";
import {
    Save,
    X,
    Pencil,
    Loader2,
    User as UserIcon,
    AlertTriangle,
    Trash2
} from "lucide-react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";

interface BaseProfileProps {
    title: string;
    subtitle: string;
    icon?: React.ElementType;

    // State from parent
    isEditMode: boolean;
    isSaving: boolean;

    // Actions
    onToggleEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    onDelete?: () => void;

    // Optional: translation namespace, defaults to "profile.base"
    translationNamespace?: string;

    // Content
    children: React.ReactNode;
}

export function BaseProfile({
                                title,
                                subtitle,
                                icon: Icon = UserIcon,
                                isEditMode,
                                isSaving,
                                onToggleEdit,
                                onCancel,
                                onSave,
                                onDelete,
                                children,
                                translationNamespace = "profile.base",
                            }: BaseProfileProps) {
    const t = useTranslations(translationNamespace);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    return (
        <div className="min-h-screen w-full bg-background p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-500 space-y-6 sm:space-y-8">
                {/* Page Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 shadow-sm">
                            <Icon className="h-6 w-6 text-primary"/>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                {title}
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg">
                                {subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        {isEditMode ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onCancel}
                                    disabled={isSaving}
                                    className="w-full sm:w-auto border-muted order-2 sm:order-1"
                                >
                                    <X className="mr-2 h-4 w-4"/>
                                    {t("buttons.cancel")}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={onSave}
                                    disabled={isSaving}
                                    className="w-full sm:w-auto order-1 sm:order-2"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                    ) : (
                                        <Save className="w-4 h-4 mr-2"/>
                                    )}
                                    {t("buttons.save_changes")}
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={onToggleEdit}
                                className="w-full sm:w-auto bg-primary text-background border-primary/20 border shadow-sm"
                            >
                                <Pencil className="mr-2 h-4 w-4"/>
                                {t("buttons.edit_profile")}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Content Card */}
                <Card className="shadow-sm border-border bg-muted/30 overflow-hidden">
                    {/* Content Area */}
                    <CardContent className="p-4 sm:p-6 space-y-8">
                        {children}

                        {/* Dangerous Zone */}
                        {onDelete && (
                            <div className="mt-6 border-t border-background pt-6">
                                <div className="rounded-lg border border-error/30 bg-error/5 p-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-error/10 rounded-lg">
                                                <AlertTriangle className="w-6 h-6 text-error" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-semibold text-error">
                                                    {t("danger_zone.title") || "Danger Zone"}
                                                </h3>
                                                <p className="text-sm text-muted-foreground max-w-md">
                                                    {t("danger_zone.description") || "Permanently delete your account and all associated data. This action cannot be undone."}
                                                </p>
                                            </div>
                                        </div>
                                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="destructive" size="sm" className="shrink-0 mt-4 sm:mt-0 bg-error text-error-foreground hover:bg-error/90 border-error/20">
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    {t("danger_zone.button") || "Delete Account"}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-background border-border shadow-2xl sm:max-w-[425px] gap-6 z-[100]">
                                                <DialogHeader className="gap-2">
                                                    <DialogTitle className="text-xl font-bold tracking-tight">
                                                        {t("danger_zone.confirm_title") || "Are you absolutely sure?"}
                                                    </DialogTitle>
                                                    <DialogDescription className="text-muted-foreground">
                                                        {t("danger_zone.confirm_description") || "This action cannot be undone. This will permanently delete your account and remove your data from our servers."}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter className="gap-2 sm:gap-0">
                                                    <DialogClose asChild>
                                                        <Button 
                                                            variant="outline" 
                                                            className="mr-2 border-muted"
                                                        >
                                                            {t("buttons.cancel") || "Cancel"}
                                                        </Button>
                                                    </DialogClose>
                                                    <Button 
                                                        variant="destructive" 
                                                        onClick={() => {
                                                            onDelete();
                                                            setIsDeleteDialogOpen(false);
                                                        }}
                                                        className="bg-error hover:bg-error/90"
                                                    >
                                                        {t("danger_zone.confirm_button") || "Delete Account"}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export type ProfileSectionProps = {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}

export function ProfileSection({title, icon: Icon, children,}: ProfileSectionProps) {
    return (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <Icon className="w-4 h-4"/>
                {title}
            </h3>
            {children}
        </div>
    );
}
