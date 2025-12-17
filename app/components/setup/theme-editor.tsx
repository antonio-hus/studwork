/** @format */
"use client";

import React from "react";
import {useTranslations} from "next-intl";
import {ThemeColors, ThemeModeColors} from "@/lib/domain/config";
import {Label} from "@/components/ui/label";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ScrollArea} from "@/components/ui/scroll-area";

/**
 * Props for the ThemeEditor component.
 */
interface ThemeEditorProps {
    colors: ThemeColors;
    onChange: (colors: ThemeColors) => void;
}

/**
 * A comprehensive editor for the application's theme colors.
 * Allows switching between light and dark modes and granularly editing semantic color tokens.
 */
export function ThemeEditor({colors, onChange}: ThemeEditorProps) {
    const t = useTranslations("setup.branding.theme");

    const updateColor = (mode: "light" | "dark", key: keyof ThemeModeColors, value: string) => {
        onChange({
            ...colors,
            [mode]: {
                ...colors[mode],
                [key]: value,
            },
        });
    };

    const renderSection = (mode: "light" | "dark", title: string, keys: (keyof ThemeModeColors)[]) => (
        <div className="mb-6 last:mb-0">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3 tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40"/>
                {title}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {keys.map((key) => (
                    <ColorInput
                        key={key}
                        label={t(`color_labels.${key}`)}
                        value={colors[mode][key]}
                        onChange={(v) => updateColor(mode, key, v)}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="w-full border border-border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm">
            <Tabs defaultValue="light" className="w-full flex flex-col h-[500px]">
                <div className="bg-muted/40 border-b border-border p-1">
                    <TabsList className="grid w-full grid-cols-2 h-9">
                        <TabsTrigger value="light" className="text-xs">{t("light_mode")}</TabsTrigger>
                        <TabsTrigger value="dark" className="text-xs">{t("dark_mode")}</TabsTrigger>
                    </TabsList>
                </div>

                {(["light", "dark"] as const).map((mode) => (
                    <TabsContent key={mode} value={mode}
                                 className="flex-1 m-0 overflow-hidden relative data-[state=inactive]:hidden">
                        <ScrollArea className="h-full">
                            <div className="p-5 space-y-6">
                                {renderSection(mode, t("sections.brand"), [
                                    "primary", "primaryHover", "primaryLight", "primaryDark", "primaryForeground",
                                    "secondary", "secondaryHover", "secondaryLight", "secondaryDark", "secondaryForeground",
                                    "accent", "accentHover", "accentLight", "accentDark", "accentForeground"
                                ])}

                                {renderSection(mode, t("sections.surfaces"), [
                                    "background", "foreground",
                                    "surface", "surfaceElevated",
                                    "textPrimary", "textSecondary", "textTertiary", "textDisabled"
                                ])}

                                {renderSection(mode, t("sections.status"), [
                                    "success", "successLight", "successForeground",
                                    "error", "errorLight", "errorForeground",
                                    "warning", "warningLight", "warningForeground",
                                    "info", "infoLight", "infoForeground"
                                ])}

                                {renderSection(mode, t("sections.ui"), [
                                    "border", "input", "ring",
                                    "muted", "mutedForeground"
                                ])}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

function ColorInput({label, value, onChange}: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div
            className="flex items-center gap-3 p-2 rounded-lg border border-border/50 bg-background/50 hover:bg-background hover:border-border transition-all group">
            {/* Color Square Trigger */}
            <div className="relative flex-shrink-0">
                <div
                    className="w-8 h-8 rounded-md border border-border shadow-sm cursor-pointer transition-transform active:scale-95 overflow-hidden"
                    style={{background: value}}
                    title="Click to pick color"
                >
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                    />
                </div>
            </div>

            {/* Input Area */}
            <div className="flex-1 min-w-0">
                <Label
                    className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide truncate block mb-1">
                    {label}
                </Label>
                {/* Flex container acts as the input box */}
                <div
                    className="flex items-center h-6 rounded-sm bg-muted/30 px-2 focus-within:ring-1 focus-within:ring-ring transition-all hover:bg-muted/50">
                    <span className="text-[10px] text-muted-foreground mr-1 select-none">#</span>
                    <input
                        type="text"
                        value={value.replace('#', '')}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^[0-9A-Fa-f]*$/.test(val)) {
                                onChange(`#${val}`);
                            }
                        }}
                        className="flex-1 w-full bg-transparent border-none p-0 text-[11px] font-mono uppercase focus:outline-none text-foreground placeholder:text-muted-foreground/50"
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    );
}
