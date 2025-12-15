/** @format */
"use client";

import React from "react";
import { ThemeColors, ThemeModeColors } from "@/lib/domain/config";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Props for the ThemeEditor component.
 */
interface ThemeEditorProps {
    colors: ThemeColors;
    onChange: (colors: ThemeColors) => void;
}

/**
 * A comprehensive editor for the application's theme colors.
 */
export function ThemeEditor({ colors, onChange }: ThemeEditorProps) {

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
        <div className="mb-6">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3 tracking-wider border-b border-border pb-1">
                {title}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {keys.map((key) => (
                    <ColorInput
                        key={key}
                        label={key.replace(/([A-Z])/g, ' $1').trim()}
                        value={colors[mode][key]}
                        onChange={(v) => updateColor(mode, key, v)}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="w-full border border-border rounded-xl overflow-hidden bg-card text-card-foreground">
            <Tabs defaultValue="light" className="w-full flex flex-col h-[500px]">
                <div className="bg-muted/30 border-b border-border p-2">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="light">Light Mode</TabsTrigger>
                        <TabsTrigger value="dark">Dark Mode</TabsTrigger>
                    </TabsList>
                </div>

                {(["light", "dark"] as const).map((mode) => (
                    <TabsContent key={mode} value={mode} className="flex-1 m-0 overflow-hidden relative">
                        <ScrollArea className="h-full p-6">
                            <div className="space-y-2">
                                {renderSection(mode, "Brand Colors", [
                                    "primary", "primaryHover", "primaryLight", "primaryDark", "primaryForeground",
                                    "secondary", "secondaryHover", "secondaryLight", "secondaryDark", "secondaryForeground",
                                    "accent", "accentHover", "accentLight", "accentDark", "accentForeground"
                                ])}

                                {renderSection(mode, "Surfaces & Typography", [
                                    "background", "foreground",
                                    "surface", "surfaceElevated",
                                    "textPrimary", "textSecondary", "textTertiary", "textDisabled"
                                ])}

                                {renderSection(mode, "Status & Feedback", [
                                    "success", "successLight", "successForeground",
                                    "error", "errorLight", "errorForeground",
                                    "warning", "warningLight", "warningForeground",
                                    "info", "infoLight", "infoForeground"
                                ])}

                                {renderSection(mode, "UI Elements", [
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

function ColorInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
            <Label className="text-xs font-medium text-foreground capitalize truncate">
                {label}
            </Label>
            <div className="flex gap-2 items-center">
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="font-mono text-[10px] h-8 flex-1 bg-background"
                />
                <div
                    className="w-8 h-8 rounded-md border border-border flex-shrink-0 shadow-sm"
                    style={{ background: value }}
                    title="Color Preview"
                />
            </div>
        </div>
    );
}
