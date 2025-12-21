/** @format */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
    Building2,
    ArrowRight,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function IncompleteProfileDisclaimer() {
    const t = useTranslations("organization.disclaimer");

    return (
        <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">

                <Card className="shadow-lg border-border bg-card overflow-hidden">
                    {/* Header with Icon */}
                    <div className="bg-muted/30 border-b border-border/50 p-6 flex justify-center">
                        <div className="relative">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20 shadow-sm">
                                <Building2 className="h-10 w-10 text-primary" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-sm ring-1 ring-border">
                                <AlertCircle className="h-6 w-6 text-amber-500 fill-amber-500/10" />
                            </div>
                        </div>
                    </div>

                    <CardHeader className="text-center pb-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {t("title")}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            {t("subtitle")}
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-6">
                        {/* Info Box */}
                        <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900/50 p-4">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-amber-900 dark:text-amber-400">
                                        {t("why_is_this_required")}
                                    </h4>
                                    <p className="text-xs text-amber-800/80 dark:text-amber-500/80 leading-relaxed">
                                        {t("explanation")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Checklist */}
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider pl-1">
                                {t("steps_to_complete")}
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40 border border-transparent">
                                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                                        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {t("steps.basic_info")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40 border border-transparent">
                                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                                        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {t("steps.contact_details")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40 border border-transparent">
                                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                                        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {t("steps.verification")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 bg-muted/30 border-t border-border/50 p-6">
                        <Button
                            asChild
                            size="lg"
                            className="w-full font-semibold shadow-md"
                        >
                            <Link href="/profile">
                                {t("buttons.complete_profile")}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>

                        <p className="text-[10px] text-center text-muted-foreground">
                            {t("footer_note")}
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}