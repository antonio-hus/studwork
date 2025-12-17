/** @format */
"use client";

import React, {useRef, useState, useEffect} from "react";
import {Upload, X, ImageOff, ImagePlus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {useTranslations} from "next-intl";

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
 * - **Drag & Drop**: Friendly UI for file selection with clear visual feedback.
 */
export function LogoUploader({value, onChange, hasError}: LogoUploaderProps) {
    const t = useTranslations("setup.branding.logo");
    const inputRef = useRef<HTMLInputElement>(null);
    const [loadError, setLoadError] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        setLoadError(false);
    }, [value]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        processFile(file);
    };

    const processFile = (file?: File) => {
        if (!file) return;

        // 2MB Limit
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

    // Drag and Drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        processFile(file);
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <span className={cn(
                    "text-sm font-medium leading-none",
                    hasError ? "text-destructive" : "text-foreground"
                )}>
                    {t("label")} <span className="text-destructive">*</span>
                </span>
                {hasError && <span
                    className="text-xs text-destructive font-medium bg-destructive/10 px-2 py-0.5 rounded-md">{t("required_badge")}</span>}
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
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "relative flex flex-col items-center justify-center h-32 w-full rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden gap-2",
                        hasError
                            ? "border-destructive/50 bg-destructive/5 hover:bg-destructive/10"
                            : isDragging
                                ? "border-primary bg-primary/5 scale-[0.99]"
                                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 bg-muted/20"
                    )}
                >
                    <div className={cn(
                        "p-3 rounded-full transition-colors",
                        hasError
                            ? "bg-destructive/10 text-destructive"
                            : isDragging
                                ? "bg-primary/10 text-primary"
                                : "bg-background shadow-sm text-muted-foreground group-hover:text-primary"
                    )}>
                        {loadError ? (
                            <ImageOff className="w-5 h-5"/>
                        ) : isDragging ? (
                            <ImagePlus className="w-5 h-5"/>
                        ) : (
                            <Upload className="w-5 h-5"/>
                        )}
                    </div>
                    <div className="text-center z-10 px-4">
                        <p className={cn(
                            "text-sm font-medium transition-colors",
                            hasError ? "text-destructive" : "text-foreground"
                        )}>
                            {loadError ? t("error_load") : isDragging ? t("drop_here") : t("drag_drop")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t("file_hint")}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="relative group w-fit">
                    <div
                        className="h-32 w-48 rounded-xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden relative">
                        {/* Checkerboard pattern for transparent images */}
                        <div className="absolute inset-0 opacity-20"
                             style={{
                                 backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                                 backgroundSize: `20px 20px`,
                                 backgroundPosition: `0 0, 0 10px, 10px -10px, -10px 0px`
                             }}
                        />

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={value}
                            alt="Logo Preview"
                            className="max-w-full max-h-full object-contain p-4 relative z-10"
                            onError={() => setLoadError(true)}
                        />
                    </div>
                    <Button
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 ring-2 ring-background"
                        onClick={(e) => {
                            e.stopPropagation();
                            clearLogo();
                        }}
                    >
                        <X className="w-3 h-3"/>
                    </Button>
                </div>
            )}
        </div>
    );
}
