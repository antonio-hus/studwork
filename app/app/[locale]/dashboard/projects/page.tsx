/** @format */

import {
    OrganizationProjectList
} from "@/components/dashboard/organization/project-management/organization-project-list";
import {getTranslations} from "next-intl/server";
import {ProjectStatus} from "@/lib/domain/project";
import {FolderKanban, Plus} from "lucide-react";
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";

export default async function OrganizationProjectsPage() {
    const t = await getTranslations("organization.projects");

    return (
        <div className="min-h-screen w-full bg-background p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-500 space-y-6 sm:space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 shadow-sm">
                            <FolderKanban className="h-6 w-6 text-primary"/>
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
                    <Link href="/dashboard/projects/create" className={buttonVariants({variant: "default"})}>
                        <Plus className="mr-2 h-4 w-4"/>
                        {t("create_button")}
                    </Link>
                </div>
                <OrganizationProjectList projectStatuses={ProjectStatus}/>
            </div>
        </div>
    );
}
