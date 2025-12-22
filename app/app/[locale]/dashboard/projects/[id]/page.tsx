/** @format */

import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ProjectForm} from "@/components/dashboard/organization/project-management/project-form";
import {getMyOrganizationProjectById} from "@/lib/controller/organization/organization-projects-controller";
import {ProjectCategory, ProjectStatus} from "@/lib/domain/project";
import {Pencil} from "lucide-react";

interface EditProjectPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditProjectPage({params}: EditProjectPageProps) {
    const t = await getTranslations("organization.projects.edit");
    const {id} = await params;

    const result = await getMyOrganizationProjectById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    return (
        <div className="min-h-screen w-full bg-background p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-500 space-y-6 sm:space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 shadow-sm">
                            <Pencil className="h-6 w-6 text-primary"/>
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
                <ProjectForm initialData={result.data} projectStatuses={ProjectStatus}
                             projectCategories={ProjectCategory}/>
            </div>
        </div>
    );
}
