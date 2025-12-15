/** @format */
"use client";

import React, { useRef, useState, useEffect } from "react";
import { Upload, X, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

/**
 * Props for the LogoUploader component.
 */
interface LogoUploaderProps {
    /** The current logo value. If empty, the upload dropzone is shown. */
    value: string;
    /** Callback returning the new base64 string (or "" on clear). */
    onChange: (base64: string) => void;
    /** Optional error state to visually indicate validation failure. */
    hasError?: boolean;
}

/**
 * A robust image uploader that handles Base64 conversion.
 *
 * Features:
 * - **Strict Validation**: Only renders preview if `value` is a non-empty string.
 * - **Error Handling**: Automatically reverts to upload state if the image src fails to load.
 * - **Drag & Drop**: Friendly UI for file selection.
 */
export function LogoUploader({ value, onChange, hasError }: LogoUploaderProps) {
    const t = useTranslations("setup.branding.logo");
    const inputRef = useRef<HTMLInputElement>(null);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        setLoadError(false);
    }, [value]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert(t("file_too_large"));
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            onChange(result);
        };
        reader.readAsDataURL(file);
    };

    const clearLogo = () => {
        onChange("");
        if (inputRef.current) inputRef.current.value = "";
        setLoadError(false);
    };

    const hasValidLogo = value.trim().length > 0 && !loadError;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <span className={cn(
                    "text-sm font-medium leading-none",
                    hasError ? "text-destructive" : "text-foreground"
                )}>
                    {t("label")} <span className="text-destructive">*</span>
                </span>
                {hasError && <span className="text-xs text-destructive font-medium">{t("required_badge")}</span>}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {!hasValidLogo ? (
                <div
                    onClick={() => inputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed transition-all cursor-pointer rounded-xl p-6 h-32 w-full flex flex-col items-center justify-center gap-2 group relative overflow-hidden",
                        hasError
                            ? "border-destructive bg-destructive/5"
                            : "border-border hover:border-primary/50 bg-muted/5"
                    )}
                >
                    <div className={cn(
                        "p-2 rounded-full transition-colors",
                        hasError ? "bg-destructive/10" : "bg-muted group-hover:bg-primary/10"
                    )}>
                        {loadError ? (
                            <ImageOff className="w-5 h-5 text-muted-foreground" />
                        ) : (
                            <Upload className={cn(
                                "w-5 h-5",
                                hasError ? "text-destructive" : "text-muted-foreground group-hover:text-primary"
                            )} />
                        )}
                    </div>
                    <div className="text-center z-10">
                        <p className={cn(
                            "text-xs font-medium transition-colors",
                            hasError ? "text-destructive" : "text-muted-foreground group-hover:text-primary"
                        )}>
                            {loadError ? t("error_load") : t("drag_drop")}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            {t("file_hint")}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="relative group w-fit">
                    <div className="h-32 w-32 rounded-xl border border-border bg-background flex items-center justify-center overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={value}
                            alt="Logo Preview"
                            className="max-w-full max-h-full object-contain p-2"
                            onError={() => setLoadError(true)}
                        />
                    </div>
                    <Button
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            clearLogo();
                        }}
                    >
                        <X className="w-3 h-3" />
                    </Button>
                </div>
            )}
        </div>
    );
}
