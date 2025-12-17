/** @format */
"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { createConfig } from "@/lib/controller/config-controller";
import { ConfigCreateType, defaultConfig, ThemeColors } from "@/lib/domain/config";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    Palette,
    Server,
    Shield,
    Mail,
    ChevronRight,
    ChevronLeft
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LogoUploader } from "@/components/setup/logo-uploader";
import { ThemeEditor } from "@/components/setup/theme-editor";

/**
 * Setup Wizard Page - handles initial platform configuration.
 *
 * This component manages the first-time setup process for the application,
 * collecting essential system and branding configuration.
 */
export default function SetupPage() {
    const t = useTranslations("setup");

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState("system");
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [form, setForm] = useState<ConfigCreateType>(defaultConfig);

    const update = (field: keyof ConfigCreateType, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: false }));
        }
    };

    const updateTheme = (colors: ThemeColors) => {
        update("themeColors", colors);
    };

    const validate = (): boolean => {
        const newErrors: Record<string, boolean> = {};
        let isValid = true;

        if (!form.name.trim()) {
            newErrors.name = true;
            isValid = false;
        }

        if (!form.logo || form.logo.trim() === "") {
            newErrors.logo = true;
            isValid = false;
        }

        setErrors(newErrors);

        if (!isValid) {
            setErrorMsg(t("errors.required"));
            // Automatically switch to branding tab if that's where the error is
            if ((newErrors.logo || newErrors.name) && activeTab !== "branding") {
                setActiveTab("branding");
                // Small delay to let tab switch animation start before showing error shake/message
                setTimeout(() => setErrorMsg(t("errors.branding_required")), 300);
            }
        }
        return isValid;
    };

    async function submit() {
        setErrorMsg(null);
        if (!validate()) return;

        setLoading(true);

        try {
            const resp = await createConfig(form);
            if (!resp.success) {
                setErrorMsg(resp.error || t("errors.unknown"));
                setLoading(false);
                return;
            }
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setErrorMsg(t("errors.unexpected"));
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen w-full flex justify-center items-center bg-background p-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full text-center space-y-6"
                >
                    <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-primary/5">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("success.title")}</h1>
                        <p className="text-muted-foreground text-lg">
                            {t("success.description")}
                        </p>
                    </div>
                    <Button
                        size="lg"
                        className="w-full text-lg h-12 rounded-xl mt-4"
                        onClick={() => window.location.href = "/dashboard"}
                    >
                        {t("success.dashboard_button")} <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex justify-center items-center bg-background py-10 px-4 md:px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl"
            >
                <Card className="border-border shadow-2xl overflow-hidden bg-card rounded-2xl">
                    <CardHeader className="border-b border-border bg-muted/20 pb-8 pt-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-bold text-foreground">
                                    {t("title")}
                                </CardTitle>
                                <CardDescription className="text-base">
                                    {t("description")}
                                </CardDescription>
                            </div>
                            <div className="self-start md:self-center">
                                <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                                    {t("status")}
                                </span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="border-b border-border px-6 sticky top-0 z-10 bg-card">
                                <TabsList className="w-full justify-start h-16 bg-transparent p-0 gap-8">
                                    <TabsTrigger
                                        value="system"
                                        className="group relative h-full rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary transition-colors">
                                                <Server className="h-4 w-4" />
                                            </div>
                                            <span>{t("tabs.system")}</span>
                                        </div>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="branding"
                                        className="group relative h-full rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary transition-colors">
                                                <Palette className="h-4 w-4" />
                                            </div>
                                            <span>{t("tabs.branding")}</span>
                                            {(errors.name || errors.logo) && (
                                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                                                </span>
                                            )}
                                        </div>
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="p-6 md:p-8 min-h-[500px]">
                                <AnimatePresence mode="wait">
                                    <TabsContent value="system" className="mt-0 focus-visible:outline-none">
                                        <motion.div
                                            key="system"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-8"
                                        >
                                            {/* Email Section */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                                                    <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                                                        <Mail className="w-4 h-4" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold">{t("system.email_title")}</h3>
                                                </div>

                                                <div className="grid grid-cols-12 gap-6">
                                                    <div className="col-span-12 md:col-span-8 space-y-2">
                                                        <Label>{t("system.smtp_host")}</Label>
                                                        <Input
                                                            value={form.smtpHost ?? ""}
                                                            onChange={(e) => update("smtpHost", e.target.value)}
                                                            placeholder="smtp.provider.com"
                                                        />
                                                    </div>
                                                    <div className="col-span-12 md:col-span-4 space-y-2">
                                                        <Label>{t("system.smtp_port")}</Label>
                                                        <Input
                                                            type="number"
                                                            value={form.smtpPort ?? 587}
                                                            onChange={(e) => update("smtpPort", Number(e.target.value))}
                                                            placeholder="587"
                                                        />
                                                    </div>

                                                    <div className="col-span-12 md:col-span-6 space-y-2">
                                                        <Label>{t("system.username")}</Label>
                                                        <Input
                                                            value={form.smtpUser ?? ""}
                                                            onChange={(e) => update("smtpUser", e.target.value)}
                                                            autoComplete="off"
                                                            placeholder="user@domain.com"
                                                        />
                                                    </div>
                                                    <div className="col-span-12 md:col-span-6 space-y-2">
                                                        <Label>{t("system.password")}</Label>
                                                        <Input
                                                            type="password"
                                                            value={form.smtpPassword ?? ""}
                                                            onChange={(e) => update("smtpPassword", e.target.value)}
                                                            autoComplete="new-password"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>

                                                    <div className="col-span-12 space-y-2">
                                                        <Label>{t("system.sender_email")}</Label>
                                                        <Input
                                                            value={form.emailFrom ?? ""}
                                                            onChange={(e) => update("emailFrom", e.target.value)}
                                                            placeholder="no-reply@university.edu"
                                                        />
                                                        <p className="text-[13px] text-muted-foreground">
                                                            {t("system.sender_email_hint")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Access Section */}
                                            <div className="space-y-6 pt-4">
                                                <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                                                    <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                                                        <Shield className="w-4 h-4" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold">{t("system.access_title")}</h3>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label>{t("system.student_domain")}</Label>
                                                        <Input
                                                            value={form.studentEmailDomain ?? ""}
                                                            onChange={(e) => update("studentEmailDomain", e.target.value)}
                                                            placeholder="@student.university.edu"
                                                        />
                                                        <p className="text-[13px] text-muted-foreground">
                                                            {t("system.student_domain_hint")}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>{t("system.staff_domain")}</Label>
                                                        <Input
                                                            value={form.staffEmailDomain ?? ""}
                                                            onChange={(e) => update("staffEmailDomain", e.target.value)}
                                                            placeholder="@staff.university.edu"
                                                        />
                                                        <p className="text-[13px] text-muted-foreground">
                                                            {t("system.staff_domain_hint")}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between border border-border p-4 rounded-xl bg-muted/20">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-base font-medium">{t("system.public_reg.title")}</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            {t("system.public_reg.description")}
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={form.allowPublicRegistration}
                                                        onCheckedChange={(checked) => update("allowPublicRegistration", checked)}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    </TabsContent>

                                    <TabsContent value="branding" className="mt-0 focus-visible:outline-none">
                                        <motion.div
                                            key="branding"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-8"
                                        >
                                            <div className="grid gap-8">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between">
                                                        <Label className={errors.name ? "text-destructive text-base" : "text-base"}>
                                                            {t("branding.org_name")} <span className="text-destructive">*</span>
                                                        </Label>
                                                    </div>
                                                    <Input
                                                        value={form.name}
                                                        onChange={(e) => update("name", e.target.value)}
                                                        placeholder={t("branding.org_name_placeholder")}
                                                        className={errors.name
                                                            ? "border-destructive focus-visible:ring-destructive h-12 text-lg bg-destructive/5"
                                                            : "h-12 text-lg"
                                                        }
                                                    />
                                                    {errors.name && (
                                                        <p className="text-sm text-destructive font-medium mt-1">
                                                            {t("errors.required")}
                                                        </p>
                                                    )}
                                                </div>

                                                <LogoUploader
                                                    value={form.logo}
                                                    onChange={(base64) => update("logo", base64)}
                                                    hasError={errors.logo}
                                                />
                                            </div>

                                            <Separator className="my-6" />

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 pb-2">
                                                    <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                                                        <Palette className="w-4 h-4" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold">{t("branding.advanced_theme")}</h3>
                                                </div>
                                                <ThemeEditor colors={form.themeColors} onChange={updateTheme} />
                                            </div>
                                        </motion.div>
                                    </TabsContent>
                                </AnimatePresence>
                            </div>
                        </Tabs>
                    </CardContent>

                    <CardFooter className="bg-muted/10 border-t border-border p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="w-full md:w-auto">
                            {errorMsg ? (
                                <Alert variant="destructive" className="py-2 px-4 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle className="mb-0 leading-none">Error</AlertTitle>
                                    </div>
                                    <AlertDescription className="mt-1 text-xs opacity-90">
                                        {errorMsg}
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <div className="text-sm text-muted-foreground hidden md:block">
                                    {activeTab === "system" ? t("steps.one") : t("steps.two")}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            {activeTab === "branding" ? (
                                <>
                                    <Button
                                        onClick={() => setActiveTab("system")}
                                        variant="outline"
                                        className="flex-1 md:flex-none"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        {t("buttons.back")}
                                    </Button>
                                    <Button
                                        onClick={submit}
                                        disabled={loading}
                                        className="flex-1 md:flex-none min-w-[140px]"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                {t("buttons.saving")}
                                            </span>
                                        ) : (
                                            t("buttons.complete")
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    className="w-full md:w-auto ml-auto"
                                    onClick={() => setActiveTab("branding")}
                                >
                                    {t("buttons.next")} <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
