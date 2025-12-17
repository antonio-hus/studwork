/** @format */
import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface Props {
    currentCount: number;
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
    onPageChange: (page: number) => void;
    disabled: boolean;
}

/**
 * Footer controls for table navigation.
 */
export function PaginationFooter({ currentCount, pagination, onPageChange, disabled }: Props) {
    const t = useTranslations("admin.users");

    return (
        <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground font-medium">
                {t("paginationInfo", { current: currentCount, total: pagination.total })}
            </span>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 border-input hover:bg-muted/50 transition-colors"
                    disabled={disabled || pagination.page <= 1}
                    onClick={() => onPageChange(pagination.page - 1)}
                >
                    {t("prev")}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 border-input hover:bg-muted/50 transition-colors"
                    disabled={disabled || pagination.page >= pagination.totalPages}
                    onClick={() => onPageChange(pagination.page + 1)}
                >
                    {t("next")}
                </Button>
            </div>
        </div>
    );
}