/** @format */
import React from "react";
import {useTranslations} from "next-intl";
import {User} from "@/lib/domain/user";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";

/**
 * Displays the current account status using a "Dot" indicator style.
 * This is cleaner than a full colored badge for binary states.
 */
export function StatusBadge({user}: { user: User }) {
    const t = useTranslations("admin.users.status");

    let statusConfig = {
        label: t("active"),
        className: "bg-success/20 text-success-foreground border-success/20",
        dotColor: "bg-success",
    };

    if (user.isSuspended) {
        statusConfig = {
            label: t("suspended"),
            className: "bg-error/20 text-error border-error/20",
            dotColor: "bg-error",
        };
    } else if (!user.emailVerified) {
        statusConfig = {
            label: t("pending"),
            className: "bg-warning/20 text-warning-foreground border-warning/20",
            dotColor: "bg-warning",
        };
    }

    return (
        <Badge
            variant="outline"
            className={cn(
                "font-medium text-xs px-2.5 py-1 rounded-full shadow-none border gap-2 bg-background",
                "text-foreground/80 border-border"
            )}
        >
            {/* The Dot Indicator */}
            <span className={cn("h-2 w-2 rounded-full", statusConfig.dotColor)}/>

            <span className="translate-y-[0.5px]">
                {statusConfig.label}
            </span>
        </Badge>
    );
}