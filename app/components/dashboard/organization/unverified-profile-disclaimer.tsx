/** @format */
"use client";

import React from "react";
import {useTranslations} from "next-intl";
import Link from "next/link";
import {
    Briefcase,
    Mail,
    Image as ImageIcon,
    LucideClock,
    LayoutDashboard,
    CheckCircle2,
} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";

export function UnverifiedOrganizationDisclaimer() {
    const t = useTranslations("organization.unverified");

    const steps = [
        {
            icon: Briefcase,
            title: t("tips.org_type"),
            description: t("tips.org_type_desc"),
        },
        {
            icon: Mail,
            title: t("tips.contact_info"),
            description: t("tips.contact_info_desc"),
        },
        {
            icon: ImageIcon,
            title: t("tips.profile_details"),
            description: t("tips.profile_details_desc"),
        },
    ];

    return (
        <div className="min-h-screen w-full bg-background p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-500 space-y-6 sm:space-y-8">

            {/* 1. Page Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 shadow-sm">
                            <LucideClock className="h-6 w-6 text-primary"/>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                {t("title")}
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg">
                                {t("subtitle")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Main Container */}
                <Card className="shadow-sm border-border bg-muted/30 overflow-hidden">

                    {/* 3. Header Strip */}
                    <div className="border-b border-border bg-background/50 backdrop-blur-sm">
                        <div className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                            <div className="w-full md:w-auto">
                                <Label className="text-xs font-medium text-muted-foreground uppercase mb-2 block">
                                    {t("status_pending")}
                                </Label>
                            </div>

                            <div className="w-full md:w-auto flex items-end justify-end md:self-end h-full">
                                <Button
                                    asChild
                                    size="sm"
                                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary-hover border-primary/20 border shadow-sm"
                                >
                                    <Link href="/dashboard/profile">
                                        <LayoutDashboard className="mr-2 h-4 w-4"/>
                                        {t("buttons.update_details")}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* 4. Steps Content Area */}
                    <CardContent className="p-4 sm:p-6">
                        <div className="bg-background border border-border rounded-xl p-6 shadow-sm space-y-8">
                            <div className="space-y-1 border-b border-border pb-4">
                                <h3 className="text-base font-semibold text-foreground">{t("tips_header")}</h3>
                                <p className="text-sm text-muted-foreground">{t("tips_subtitle")}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {steps.map((step, index) => (
                                    <div key={index} className="flex flex-col space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                                <step.icon className="w-4 h-4" />
                                            </div>
                                            <h4 className="font-medium text-foreground text-sm">{step.title}</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed pl-1">
                                            {step.description}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 flex items-start gap-3 text-sm text-muted-foreground border-t border-border bg-muted/20 -mx-6 -mb-6 p-6 rounded-b-xl">
                                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0"/>
                                <p>{t("footer_note")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}