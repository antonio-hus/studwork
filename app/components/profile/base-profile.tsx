/** @format */
"use client";

import React from "react";
import {
    Save,
    X,
    Pencil,
    Loader2,
    User as UserIcon,
} from "lucide-react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Label} from "@/components/ui/label";

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
                                children,
                                translationNamespace = "profile.base",
                            }: BaseProfileProps) {
    const t = useTranslations(translationNamespace);

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
                </div>

                {/* Main Content Card */}
                <Card className="shadow-sm border-border bg-muted/30 overflow-hidden">
                    <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                        <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase">
                                    {t("header.label")}
                                </Label>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
                                {isEditMode ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onCancel}
                                            disabled={isSaving}
                                            className="w-full border-muted"
                                        >
                                            <X className="mr-2 h-4 w-4"/>
                                            {t("buttons.cancel")}
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={onSave}
                                            disabled={isSaving}
                                            className="w-full"
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
                                        className="w-full bg-primary text-background border-primary/20 border shadow-sm col-span-full sm:col-span-2"
                                    >
                                        <Pencil className="mr-2 h-4 w-4"/>
                                        {t("buttons.edit_profile")}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <CardContent className="p-4 sm:p-6 space-y-8">
                        {children}
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
