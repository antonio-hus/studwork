/** @format */
"use client";

import React, {useState} from "react";
import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import type {
    Project,
    ProjectCategory,
    ProjectCreateType,
    ProjectStatus,
    ProjectUpdateType,
} from "@/lib/domain/project";
import {
    createMyOrganizationProject,
    updateMyOrganizationProject,
} from "@/lib/controller/organization/organization-projects-controller";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Label} from "@/components/ui/label";
import {Card, CardContent} from "@/components/ui/card";
import {Loader2, Save, X, Info} from "lucide-react";

interface ProjectFormProps {
    initialData?: Project;
    projectStatuses: typeof ProjectStatus;
    projectCategories: typeof ProjectCategory;
}

export function ProjectForm({initialData, projectStatuses, projectCategories}: ProjectFormProps) {
    const t = useTranslations("organization.projects.form");
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: initialData?.title ?? "",
        description: initialData?.description ?? "",
        category: initialData?.category ?? projectCategories.OTHER,
        status: initialData?.status ?? projectStatuses.DRAFT,
    });

    const handleInputChange = (
        field: keyof typeof formData,
        value: string | number | ProjectCategory | ProjectStatus
    ) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            let result;
            if (initialData) {
                const updateData: ProjectUpdateType = {
                    ...formData,
                };
                result = await updateMyOrganizationProject(initialData.id, updateData);
            } else {
                const createData: Omit<ProjectCreateType, "organization"> = {
                    ...formData,
                    status: projectStatuses.DRAFT,
                };
                result = await createMyOrganizationProject(createData);
            }

            if (result.success) {
                toast.success(
                    initialData ? t("update_success") : t("create_success")
                );
                router.refresh();
                router.push("/dashboard/projects");
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error(t("unexpected_error"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card className="shadow-sm border-border bg-muted/30 overflow-hidden">
                {/* Responsive Header Section */}
                <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm">
                    <div className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="w-full md:w-auto">
                            <h2 className="text-lg font-medium text-foreground">
                                {initialData ? t("edit_title") : t("create_title")}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {initialData ? t("edit_subtitle") : t("create_subtitle")}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full md:w-auto flex items-end justify-end md:self-end h-full">
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push("/dashboard/projects")}
                                    disabled={isSaving}
                                    className="w-full sm:w-auto md:min-w-[100px] order-2 sm:order-1 border-muted"
                                >
                                    <X className="mr-2 h-4 w-4"/>
                                    {t("buttons.cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isSaving}
                                    className="w-full sm:w-auto md:min-w-[120px] order-1 sm:order-2"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                    ) : (
                                        <Save className="w-4 h-4 mr-2"/>
                                    )}
                                    {initialData ? t("buttons.save") : t("buttons.create")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <CardContent className="p-4 sm:p-6 space-y-6">
                    {/* General Info Card */}
                    <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm space-y-6 h-fit">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4"/>
                            {t("sections.general_info")}
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title"
                                       className="text-xs font-medium text-muted-foreground uppercase">
                                    {t("fields.title.label")}
                                </Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange("title", e.target.value)}
                                    placeholder={t("fields.title.placeholder")}
                                    required
                                    className="bg-background"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category"
                                       className="text-xs font-medium text-muted-foreground uppercase">
                                    {t("fields.category.label")}
                                </Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) =>
                                        handleInputChange("category", value as ProjectCategory)
                                    }
                                >
                                    <SelectTrigger id="category" className="bg-background">
                                        <SelectValue placeholder={t("fields.category.placeholder")}/>
                                    </SelectTrigger>
                                    <SelectContent className="bg-background border-background">
                                        {Object.values(projectCategories).map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {t(`categories.${cat.toLowerCase()}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description"
                                       className="text-xs font-medium text-muted-foreground uppercase">
                                    {t("fields.description.label")}
                                </Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    placeholder={t("fields.description.placeholder")}
                                    className="min-h-[150px] bg-background"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
