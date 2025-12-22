/** @format */
"use client";

import React from "react";
import {LucideIcon} from "lucide-react";
import {cn} from "@/lib/utils";

export const TOOLTIP_CONTENT_CLASS =
    "bg-foreground text-background border-none rounded-md shadow-xl px-3 py-1.5 text-xs font-semibold [&_span]:hidden [&_svg]:hidden";

/**
 * KPI Card Component
 * Displays a key performance indicator with a label, value, icon, and optional trend.
 */
export function KpiCard({
                            label,
                            value,
                            icon: Icon,
                            trend,
                            variant = "default",
                        }: {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    variant?: "default" | "primary" | "secondary" | "accent" | "success" | "warning" | "info" | "muted";
}) {
    const iconContainerStyles = {
        default: "bg-muted text-muted-foreground",
        primary: "bg-primary/10 text-primary",
        secondary: "bg-secondary/10 text-secondary",
        accent: "bg-accent/10 text-accent",
        muted: "bg-muted text-muted-foreground",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        info: "bg-info/10 text-info",
    };

    return (
        <div
            className="relative rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-sm flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {label}
                </span>
                <div className={cn("p-2 rounded-lg", iconContainerStyles[variant] || iconContainerStyles.default)}>
                    <Icon className="w-4 h-4"/>
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-2xl font-bold text-foreground">
                    {value}
                </h3>
                {trend && (
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider opacity-80">
                        {trend}
                    </p>
                )}
            </div>
        </div>
    );
}

/**
 * Stat Row Component
 * Displays a statistic with a progress bar.
 */
export function StatRow({label, value, subValue, percentage, barColor, icon: Icon}: {
    label: string,
    value: string | number,
    subValue?: string,
    percentage: number,
    barColor: string,
    icon?: LucideIcon
}) {
    const safePercent = isNaN(percentage) ? 0 : Math.min(Math.max(percentage, 0), 100);

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground opacity-70"/>}
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                </div>
                <div className="text-right flex items-baseline gap-1">
                    <span className="text-sm font-bold text-foreground">{value}</span>
                    {subValue &&
                        <span className="text-[10px] text-muted-foreground opacity-70 uppercase">{subValue}</span>}
                </div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                <div
                    className={cn("h-full rounded-full transition-all duration-500", barColor)}
                    style={{width: `${safePercent}%`}}
                />
            </div>
        </div>
    );
}

/**
 * Custom Tooltip for Recharts
 */
export const CustomTooltip = ({active, payload, label}: any) => {
    if (active && payload && payload.length) {
        return (
            <div className={TOOLTIP_CONTENT_CLASS}>
                <p className="text-xs font-semibold">{label || payload[0].name}: {payload[0].value}</p>
            </div>
        );
    }
    return null;
};
