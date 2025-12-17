/** @format */
import React from "react";
import {useTranslations} from "next-intl";
import {UserRole} from "@/lib/domain/user";
import {Badge} from "@/components/ui/badge";
import {ShieldCheck, Building2, UserCog, GraduationCap} from "lucide-react";
import {cn} from "@/lib/utils";

interface Props {
    role: UserRole;
    roles: typeof UserRole;
}

/**
 * Visual badge to display user role.
 * Styled with a "Soft" aesthetic (subtle background, readable text) to reduce visual noise in tables.
 */
export function RoleBadge({role, roles}: Props) {
    const t = useTranslations("admin.users.roles");

    const config = {
        [roles.ADMINISTRATOR]: {
            className: "bg-primary text-accent-foreground hover:bg-primary border-transparent",
            icon: <ShieldCheck className="w-3.5 h-3.5 mr-1.5"/>,
        },
        [roles.ORGANIZATION]: {
            className: "bg-secondary text-secondary-foreground hover:bg-secondary border-transparent",
            icon: <Building2 className="w-3.5 h-3.5 mr-1.5 opacity-80"/>,
        },
        [roles.COORDINATOR]: {
            className: "bg-accent text-accent-foreground hover:bg-accent border-transparent",
            icon: <UserCog className="w-3.5 h-3.5 mr-1.5"/>,
        },
        [roles.STUDENT]: {
            className: "bg-muted text-muted-foreground hover:bg-muted border-transparent",
            icon: <GraduationCap className="w-3.5 h-3.5 mr-1.5"/>,
        },
    };

    const current = config[role] || config[roles.STUDENT];

    return (
        <Badge
            variant="outline"
            className={cn(
                "font-medium text-xs px-2.5 py-1 rounded-md shadow-none transition-colors duration-200 border-0 items-center w-fit flex",
                current.className
            )}
        >
            {current.icon}
            <span className="translate-y-[0.5px]">{t(role.toLowerCase())}</span>
        </Badge>
    );
}