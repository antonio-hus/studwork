/** @format */
"use client";

import React, {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {User} from "@/lib/domain/user";
import {Config, ThemeColors, ConfigUpdateType, defaultConfig} from "@/lib/domain/config";
import {getConfig, updateConfig} from "@/lib/controller/config-controller";
import {
    Settings,
    Palette,
    Server,
    Shield,
    Save,
    Loader2,
    Mail,
    Globe,
    Lock,
    Pencil,
    X,
    Building2,
    CheckCircle2,
    RotateCcw
} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Tabs, TabsContent} from "@/components/ui/tabs";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Switch} from "@/components/ui/switch";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ThemeEditor} from "@/components/setup/theme-editor";
import {LogoUploader} from "@/components/setup/logo-uploader";
import {toast} from "sonner";
import Image from "next/image";

interface AdminSettingsProps {
    user: User;
}

export function AdminSettings({user}: AdminSettingsProps) {
    const t = useTranslations("settings.admin");

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Core data
    const [originalConfig, setOriginalConfig] = useState<Config | null>(null);
    const [configForm, setConfigForm] = useState<Config | null>(null);

    // UI State
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState("branding");

    // Fetch initial config
    useEffect(() => {
        async function load() {
            try {
                const result = await getConfig();
                if (result.success && result.data) {
                    setOriginalConfig(result.data);
                    setConfigForm(result.data);
                } else {
                    toast.error(t("errors.fetch_failed"));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }

        load();
    }, [t]);

    // Handlers
    const handleUpdate = (field: keyof Config, value: any) => {
        if (!configForm) return;
        setConfigForm({...configForm, [field]: value});
    };

    const handleThemeUpdate = (colors: ThemeColors) => {
        handleUpdate("themeColors", colors);
    };

    const handleThemeReset = () => {
        handleUpdate("themeColors", defaultConfig.themeColors);
        toast.info(t("branding.theme_reset_toast"));
    };

    const handleCancel = () => {
        setConfigForm(originalConfig);
        setIsEditMode(false);
    };

    const handleSave = async () => {
        if (!configForm) return;
        setIsSaving(true);
        try {
            const updatePayload: ConfigUpdateType = {
                ...configForm,
                themeColors: configForm.themeColors as ThemeColors
            };

            const result = await updateConfig(updatePayload);
            window.location.reload()

            if (result.success && result.data) {
                toast.success(t("success_message"));
                setOriginalConfig(result.data);
                setConfigForm(result.data);
                setIsEditMode(false);
            } else {
                toast.error(t("error_message"));
            }
        } catch (e) {
            toast.error(t("error_unexpected"));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] w-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary"/>
            </div>
        );
    }

    if (!configForm) return null;

    // Helper for safe theme access
    const safeThemeColors = (configForm.themeColors as ThemeColors) || defaultConfig.themeColors;

    return (
        <div className="min-h-screen w-full bg-background p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-500 space-y-6 sm:space-y-8">

            {/* Page Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 shadow-sm">
                            <Settings className="h-6 w-6 text-primary"/>
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

                {/* Main Content Area */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <Card className="shadow-sm border-border bg-muted/30 overflow-hidden">

                        {/* Responsive Header Section */}
                        <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm">
                            <div
                                className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                <div className="w-full md:w-auto">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase mb-2 block">
                                        Current Section
                                    </Label>
                                    <Select value={activeTab} onValueChange={setActiveTab}>
                                        <SelectTrigger className="w-full h-10 bg-background border-input shadow-sm md:min-w-[250px]">
                                            <div className="flex items-center gap-2">
                                                {activeTab === 'branding' && <Palette className="w-4 h-4 text-primary"/>}
                                                {activeTab === 'system' && <Server className="w-4 h-4 text-primary"/>}
                                                {activeTab === 'security' && <Shield className="w-4 h-4 text-primary"/>}
                                                <SelectValue/>
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-background border-border">
                                            <SelectItem value="branding">
                                                <div className="flex items-center gap-2">
                                                    {t("tabs.branding")}
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="system">
                                                <div className="flex items-center gap-2">
                                                    {t("tabs.system")}
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="security">
                                                <div className="flex items-center gap-2">
                                                    {t("tabs.security")}
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 2. Action Buttons */}
                                <div
                                    className="w-full md:w-auto flex items-end justify-end md:self-end h-full">
                                    {isEditMode ? (
                                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCancel}
                                                disabled={isSaving}
                                                className="w-full sm:w-auto md:min-w-[100px] order-2 sm:order-1 border-muted"
                                            >
                                                <X className="mr-2 h-4 w-4"/>
                                                {t("buttons.cancel")}
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="w-full sm:w-auto md:min-w-[120px] order-1 sm:order-2"
                                            >
                                                {isSaving ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                                ) : (
                                                    <Save className="w-4 h-4 mr-2"/>
                                                )}
                                                {t("buttons.save_changes")}
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => setIsEditMode(true)}
                                            className="w-full sm:w-auto bg-primary text-background border-primary/20 border shadow-sm"
                                        >
                                            <Pencil className="mr-2 h-4 w-4"/>
                                            {t("buttons.edit_mode")}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <CardContent className="p-4 sm:p-6">
                            {/* TAB: BRANDING */}
                            <TabsContent value="branding"
                                         className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* General Info Card */}
                                    <div
                                        className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm space-y-6 h-fit">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                            <Building2 className="w-4 h-4"/>
                                            {t("branding.general_info")}
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label
                                                    className="text-xs font-medium text-muted-foreground uppercase">{t("branding.org_name")}</Label>
                                                {isEditMode ? (
                                                    <Input
                                                        value={configForm.name}
                                                        onChange={(e) => handleUpdate("name", e.target.value)}
                                                        className="bg-background"
                                                    />
                                                ) : (
                                                    <div
                                                        className="flex items-center gap-2 min-h-[40px] px-3 border border-transparent">
                                                        <span
                                                            className="text-base font-medium break-all">{configForm.name}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    className="text-xs font-medium text-muted-foreground uppercase">{t("branding.logo")}</Label>
                                                {isEditMode ? (
                                                    <div className="mt-2">
                                                        <LogoUploader
                                                            value={configForm.logo}
                                                            onChange={(val) => handleUpdate("logo", val)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="mt-2 relative w-full max-w-[200px] h-24 border border-border rounded-lg bg-muted/10 overflow-hidden flex items-center justify-center">
                                                        {configForm.logo ? (
                                                            <Image
                                                                src={configForm.logo}
                                                                alt="Logo"
                                                                fill
                                                                className="object-contain p-4"
                                                            />
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground italic">No Logo Set</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Theme Colors Card */}
                                    <div
                                        className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                <Palette className="w-4 h-4"/>
                                                {t("branding.colors")}
                                            </h3>
                                            {isEditMode && (
                                                <Button variant="ghost" size="icon" onClick={handleThemeReset}
                                                        title={t("branding.reset_defaults")}>
                                                    <RotateCcw
                                                        className="w-4 h-4 text-muted-foreground hover:text-foreground"/>
                                                </Button>
                                            )}
                                        </div>

                                        {isEditMode ? (
                                            <div className="flex-1 -mx-2 sm:mx-0">
                                                <ThemeEditor colors={safeThemeColors} onChange={handleThemeUpdate}/>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <span
                                                        className="text-xs font-medium text-muted-foreground block">{t("branding.light_mode")}</span>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        <ColorPreview color={safeThemeColors.light.primary}
                                                                      label="Primary"/>
                                                        <ColorPreview color={safeThemeColors.light.secondary}
                                                                      label="Secondary"/>
                                                        <ColorPreview color={safeThemeColors.light.accent}
                                                                      label="Accent"/>
                                                        <ColorPreview color={safeThemeColors.light.background}
                                                                      label="Bg"/>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <span
                                                        className="text-xs font-medium text-muted-foreground block">{t("branding.dark_mode")}</span>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        <ColorPreview color={safeThemeColors.dark.primary}
                                                                      label="Primary"/>
                                                        <ColorPreview color={safeThemeColors.dark.secondary}
                                                                      label="Secondary"/>
                                                        <ColorPreview color={safeThemeColors.dark.accent}
                                                                      label="Accent"/>
                                                        <ColorPreview color={safeThemeColors.dark.background}
                                                                      label="Bg"/>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB: SYSTEM */}
                            <TabsContent value="system"
                                         className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
                                        <Mail className="w-4 h-4"/>
                                        {t("system.smtp_details")}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label
                                                className="text-xs font-medium text-muted-foreground uppercase">{t("system.smtp_host")}</Label>
                                            {isEditMode ? (
                                                <Input
                                                    value={configForm.smtpHost || ''}
                                                    onChange={(e) => handleUpdate("smtpHost", e.target.value)}
                                                    placeholder="smtp.example.com"
                                                    className="bg-background"
                                                />
                                            ) : (
                                                <div
                                                    className="flex items-center gap-2 min-h-[40px] px-3 border border-transparent overflow-hidden">
                                                    <Server className="w-4 h-4 text-primary shrink-0"/>
                                                    <span
                                                        className="text-sm font-medium truncate">{configForm.smtpHost || "N/A"}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                className="text-xs font-medium text-muted-foreground uppercase">{t("system.smtp_port")}</Label>
                                            {isEditMode ? (
                                                <Input
                                                    type="number"
                                                    value={configForm.smtpPort || ''}
                                                    onChange={(e) => handleUpdate("smtpPort", parseInt(e.target.value))}
                                                    placeholder="587"
                                                    className="bg-background"
                                                />
                                            ) : (
                                                <div
                                                    className="flex items-center gap-2 min-h-[40px] px-3 border border-transparent">
                                                    <span
                                                        className="text-sm font-mono bg-muted px-2 py-1 rounded">{configForm.smtpPort || "N/A"}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                className="text-xs font-medium text-muted-foreground uppercase">{t("system.smtp_user")}</Label>
                                            {isEditMode ? (
                                                <Input
                                                    value={configForm.smtpUser || ''}
                                                    onChange={(e) => handleUpdate("smtpUser", e.target.value)}
                                                    autoComplete="off"
                                                    className="bg-background"
                                                />
                                            ) : (
                                                <div
                                                    className="flex items-center gap-2 min-h-[40px] px-3 border border-transparent">
                                                    <Lock className="w-4 h-4 text-primary shrink-0"/>
                                                    <span className="text-sm font-medium font-mono">********</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                className="text-xs font-medium text-muted-foreground uppercase">{t("system.smtp_password")}</Label>
                                            {isEditMode ? (
                                                <Input
                                                    type="password"
                                                    value={configForm.smtpPassword || ''}
                                                    onChange={(e) => handleUpdate("smtpPassword", e.target.value)}
                                                    autoComplete="new-password"
                                                    placeholder="••••••••"
                                                    className="bg-background"
                                                />
                                            ) : (
                                                <div
                                                    className="flex items-center gap-2 min-h-[40px] px-3 border border-transparent">
                                                    <span
                                                        className="text-sm font-medium font-mono text-muted-foreground">••••••••</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <Label
                                                className="text-xs font-medium text-muted-foreground uppercase">{t("system.sender_email")}</Label>
                                            {isEditMode ? (
                                                <Input
                                                    value={configForm.emailFrom || ''}
                                                    onChange={(e) => handleUpdate("emailFrom", e.target.value)}
                                                    className="bg-background"
                                                />
                                            ) : (
                                                <div
                                                    className="flex items-center gap-2 min-h-[40px] px-3 border border-transparent overflow-hidden">
                                                    <Mail className="w-4 h-4 text-primary shrink-0"/>
                                                    <span
                                                        className="text-sm font-medium truncate">{configForm.emailFrom || "N/A"}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB: SECURITY */}
                            <TabsContent value="security"
                                         className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Domain Card */}
                                    <div
                                        className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm space-y-6">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Globe className="w-4 h-4"/>
                                            {t("security.domain_restrictions")}
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label
                                                    className="text-xs font-medium text-muted-foreground uppercase">{t("security.student_domain")}</Label>
                                                {isEditMode ? (
                                                    <div className="relative">
                                                        <Input
                                                            value={configForm.studentEmailDomain || ''}
                                                            onChange={(e) => handleUpdate("studentEmailDomain", e.target.value)}
                                                            placeholder="student.university.edu"
                                                            className="bg-background"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="flex items-center gap-2 min-h-[40px] px-3 border border-transparent overflow-hidden">
                                                        <span
                                                            className="text-sm font-mono bg-muted/50 px-2 py-1 rounded truncate w-full">
                                                            {configForm.studentEmailDomain || "N/A"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    className="text-xs font-medium text-muted-foreground uppercase">{t("security.staff_domain")}</Label>
                                                {isEditMode ? (
                                                    <div className="relative">
                                                        <Input
                                                            value={configForm.staffEmailDomain || ''}
                                                            onChange={(e) => handleUpdate("staffEmailDomain", e.target.value)}
                                                            placeholder="staff.university.edu"
                                                            className="bg-background"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="flex items-center gap-2 min-h-[40px] px-3 border border-transparent overflow-hidden">
                                                        <span
                                                            className="text-sm font-mono bg-muted/50 px-2 py-1 rounded truncate w-full">
                                                            {configForm.staffEmailDomain || "N/A"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Access Card */}
                                    <div
                                        className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm space-y-6">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Lock className="w-4 h-4"/>
                                            {t("security.public_access")}
                                        </h3>
                                        <div className="space-y-2">
                                            <Label
                                                className="text-xs font-medium text-muted-foreground uppercase mb-2 block">{t("security.registration_status")}</Label>
                                            {isEditMode ? (
                                                <div
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between border border-border bg-muted/20 p-4 rounded-lg gap-4 sm:gap-0">
                                                    <div className="space-y-0.5">
                                                        <Label
                                                            className="text-sm font-medium text-foreground">{t("security.allow_public")}</Label>
                                                        <p className="text-xs text-muted-foreground">
                                                            {t("security.allow_public_desc")}
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={configForm.allowPublicRegistration}
                                                        onCheckedChange={(val) => handleUpdate("allowPublicRegistration", val)}
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className="flex items-center gap-3 border border-border p-4 rounded-lg bg-background">
                                                    {configForm.allowPublicRegistration ? (
                                                        <div className="p-2 bg-green-500/10 rounded-full shrink-0">
                                                            <CheckCircle2 className="w-5 h-5 text-green-600"/>
                                                        </div>
                                                    ) : (
                                                        <div className="p-2 bg-amber-500/10 rounded-full shrink-0">
                                                            <Lock className="w-5 h-5 text-amber-600"/>
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm text-foreground truncate">
                                                            {configForm.allowPublicRegistration ? "Open Registration" : "Restricted Access"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {configForm.allowPublicRegistration
                                                                ? "Anyone can sign up"
                                                                : "Invite-only system"}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </CardContent>
                    </Card>
                </Tabs>
            </div>
        </div>
    );
}

function ColorPreview({color, label}: { color: string, label: string }) {
    return (
        <div
            className="flex items-center gap-2 p-1.5 rounded-md border border-border bg-background/50 hover:bg-background transition-colors w-full">
            <div className="w-6 h-6 rounded-sm shadow-sm border border-border/50 shrink-0" style={{background: color}}/>
            <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase truncate">{label}</span>
                <span className="text-[10px] font-mono opacity-70 truncate">{color}</span>
            </div>
        </div>
    );
}
