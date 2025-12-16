/** @format */
"use client";

import React, {useState} from "react";
import {useTranslations} from "next-intl";
import {createConfig} from "@/lib/controller/admin/config-controller";
import {ConfigCreateType, defaultConfig, ThemeColors} from "@/lib/domain/config";

import {Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Switch} from "@/components/ui/switch";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Separator} from "@/components/ui/separator";
import {AlertCircle, CheckCircle2, ArrowRight, Palette, Server, Shield, Mail} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";

import {LogoUploader} from "@/components/setup/logo-uploader";
import {ThemeEditor} from "@/components/setup/theme-editor";

/**
 * Setup Wizard Page - handles initial platform configuration.
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
        setForm((prev) => ({...prev, [field]: value}));
        if (errors[field]) {
            setErrors((prev) => ({...prev, [field]: false}));
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
            if ((newErrors.logo || newErrors.name) && activeTab !== "branding") {
                setActiveTab("branding");
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
            <div className="min-h-screen w-full flex justify-center items-center bg-background">
                <motion.div
                    initial={{scale: 0.9, opacity: 0}}
                    animate={{scale: 1, opacity: 1}}
                    className="max-w-md w-full text-center space-y-4"
                >
                    <div
                        className="w-20 h-20 bg-[var(--success-light)]/30 text-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10"/>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">{t("success.title")}</h1>
                    <p className="text-muted-foreground">
                        {t("success.description")}
                    </p>
                    <Button
                        className="mt-8 w-full h-12 text-lg rounded-xl"
                        onClick={() => window.location.href = "/dashboard"}
                    >
                        {t("success.dashboard_button")} <ArrowRight className="ml-2 w-5 h-5"/>
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex justify-center items-center bg-background py-10 px-4">
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="w-full max-w-3xl"
            >
                <Card className="border-border shadow-2xl overflow-hidden bg-card text-card-foreground rounded-2xl">
                    <CardHeader className="pb-8 pt-8 border-b border-border bg-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold text-foreground">
                                    {t("title")}
                                </CardTitle>
                                <CardDescription className="mt-1 text-muted-foreground">
                                    {t("description")}
                                </CardDescription>
                            </div>
                            <div
                                className="hidden sm:block text-xs font-mono text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                {t("status")}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 bg-card">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="bg-card border-b border-border px-6 sticky top-0 z-10">
                                <TabsList className="w-full justify-start h-14 bg-transparent p-0 space-x-8">
                                    <TabsTrigger
                                        value="system"
                                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full font-medium text-muted-foreground data-[state=active]:text-primary"
                                    >
                                        <Server className="w-4 h-4 mr-2"/>
                                        {t("tabs.system")}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="branding"
                                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full font-medium text-muted-foreground data-[state=active]:text-primary"
                                    >
                                        <Palette className="w-4 h-4 mr-2"/>
                                        {t("tabs.branding")}
                                        {(errors.name || errors.logo) && (
                                            <span className="ml-2 w-2 h-2 bg-destructive rounded-full"/>
                                        )}
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="p-6 md:p-8 min-h-[500px] bg-card">
                                <AnimatePresence mode="wait">
                                    {activeTab === "system" && (
                                        <motion.div
                                            key="system"
                                            initial={{opacity: 0, x: -10}}
                                            animate={{opacity: 1, x: 0}}
                                            exit={{opacity: 0, x: 10}}
                                            transition={{duration: 0.2}}
                                            className="space-y-10"
                                        >
                                            <div className="space-y-5">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                        <Mail className="w-4 h-4"/>
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-foreground">{t("system.email_title")}</h3>
                                                </div>

                                                <div className="grid grid-cols-12 gap-6">
                                                    <div className="col-span-12 md:col-span-8">
                                                        <Label
                                                            className="text-foreground">{t("system.smtp_host")}</Label>
                                                        <Input
                                                            value={form.smtpHost ?? ""}
                                                            onChange={(e) => update("smtpHost", e.target.value)}
                                                            placeholder="smtp.provider.com"
                                                            className="mt-1.5 bg-muted/50 border-border text-foreground"
                                                        />
                                                    </div>
                                                    <div className="col-span-12 md:col-span-4">
                                                        <Label
                                                            className="text-foreground">{t("system.smtp_port")}</Label>
                                                        <Input
                                                            type="number"
                                                            value={form.smtpPort ?? 587}
                                                            onChange={(e) => update("smtpPort", Number(e.target.value))}
                                                            placeholder="587"
                                                            className="mt-1.5 bg-muted/50 border-border text-foreground"
                                                        />
                                                    </div>

                                                    <div className="col-span-12 md:col-span-6">
                                                        <Label
                                                            className="text-foreground">{t("system.username")}</Label>
                                                        <Input
                                                            value={form.smtpUser ?? ""}
                                                            onChange={(e) => update("smtpUser", e.target.value)}
                                                            autoComplete="off"
                                                            placeholder="username"
                                                            className="mt-1.5 bg-muted/50 border-border text-foreground"
                                                        />
                                                    </div>
                                                    <div className="col-span-12 md:col-span-6">
                                                        <Label
                                                            className="text-foreground">{t("system.password")}</Label>
                                                        <Input
                                                            type="password"
                                                            value={form.smtpPassword ?? ""}
                                                            onChange={(e) => update("smtpPassword", e.target.value)}
                                                            autoComplete="new-password"
                                                            placeholder="password"
                                                            className="mt-1.5 bg-muted/50 border-border text-foreground"
                                                        />
                                                    </div>

                                                    <div className="col-span-12">
                                                        <Label
                                                            className="text-foreground">{t("system.sender_email")}</Label>
                                                        <Input
                                                            value={form.emailFrom ?? ""}
                                                            onChange={(e) => update("emailFrom", e.target.value)}
                                                            placeholder="no-reply@university.edu"
                                                            className="mt-1.5 bg-muted/50 border-border text-foreground"
                                                        />
                                                        <p className="text-[11px] text-muted-foreground mt-1">
                                                            {t("system.sender_email_hint")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator className="bg-border"/>

                                            <div className="space-y-5">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                        <Shield className="w-4 h-4"/>
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-foreground">{t("system.access_title")}</h3>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label
                                                            className="text-foreground">{t("system.student_domain")}</Label>
                                                        <Input
                                                            value={form.studentEmailDomain ?? ""}
                                                            onChange={(e) => update("studentEmailDomain", e.target.value)}
                                                            placeholder="@student.edu"
                                                            className="bg-muted/50 border-border text-foreground"
                                                        />
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {t("system.student_domain_hint")}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label
                                                            className="text-foreground">{t("system.staff_domain")}</Label>
                                                        <Input
                                                            value={form.staffEmailDomain ?? ""}
                                                            onChange={(e) => update("staffEmailDomain", e.target.value)}
                                                            placeholder="@staff.edu"
                                                            className="bg-muted/50 border-border text-foreground"
                                                        />
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {t("system.staff_domain_hint")}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div
                                                    className="flex items-center justify-between border border-border p-4 rounded-xl bg-muted/30 mt-4">
                                                    <div className="space-y-0.5">
                                                        <Label
                                                            className="text-base text-foreground">{t("system.public_reg.title")}</Label>
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
                                    )}

                                    {activeTab === "branding" && (
                                        <motion.div
                                            key="branding"
                                            initial={{opacity: 0, x: 10}}
                                            animate={{opacity: 1, x: 0}}
                                            exit={{opacity: 0, x: -10}}
                                            transition={{duration: 0.2}}
                                            className="space-y-8"
                                        >
                                            <div className="grid gap-8">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between">
                                                        <Label
                                                            className={errors.name ? "text-destructive" : "text-foreground"}>
                                                            {t("branding.org_name")} <span
                                                            className="text-destructive">*</span>
                                                        </Label>
                                                    </div>
                                                    <Input
                                                        value={form.name}
                                                        onChange={(e) => update("name", e.target.value)}
                                                        placeholder={t("branding.org_name_placeholder")}
                                                        className={errors.name ? "border-destructive focus-visible:ring-destructive bg-muted/50 h-12 text-lg" : "h-12 text-lg bg-muted/50 border-border text-foreground"}
                                                    />
                                                </div>

                                                <LogoUploader
                                                    value={form.logo}
                                                    onChange={(base64) => update("logo", base64)}
                                                    hasError={errors.logo}
                                                />
                                            </div>

                                            <Separator className="my-6 bg-border"/>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold text-foreground">{t("branding.advanced_theme")}</h3>
                                                </div>
                                                <ThemeEditor colors={form.themeColors} onChange={updateTheme}/>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Tabs>
                    </CardContent>

                    <CardFooter className="bg-card border-t border-border p-6 flex justify-between items-center">
                        {errorMsg ? (
                            <div
                                className="flex items-center text-destructive text-sm font-medium bg-destructive/10 px-3 py-2 rounded-lg border border-destructive/20">
                                <AlertCircle className="w-4 h-4 mr-2"/>
                                {errorMsg}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                {activeTab === "system" ? t("steps.one") : t("steps.two")}
                            </div>
                        )}

                        <div className="flex gap-3">
                            {activeTab === "branding" ? (
                                <>
                                    <Button
                                        onClick={() => setActiveTab("system")}
                                        variant="ghost"
                                        className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    >
                                        {t("buttons.back")}
                                    </Button>
                                    <Button
                                        onClick={submit}
                                        disabled={loading}
                                        className="min-w-[160px] bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        {loading ? t("buttons.saving") : t("buttons.complete")}
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => setActiveTab("branding")}>
                                    {t("buttons.next")} <ArrowRight className="w-4 h-4 ml-2"/>
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
