/** @format */
"use client";

import React, {useRef} from "react";
import {
    User as UserIcon,
    Mail,
    Camera,
    Upload,
    Trash2,
    FileText,
    AtSign,
} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {ProfileSection} from "./base-profile";
import type {User} from "@/lib/domain/user";
import {toast} from "sonner";

interface CommonUserFieldsProps {
    data: User;
    onChange: (field: keyof User, value: any) => void;
    isEditMode: boolean;
    t: any;
}

export function CommonUserFields({
                                     data,
                                     onChange,
                                     isEditMode,
                                     t,
                                 }: CommonUserFieldsProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const processFile = (file: File) => {
        if (file.size > 4 * 1024 * 1024) {
            toast.error("File is too large. Max size is 4MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            onChange("profilePictureUrl", result);
        };
        reader.onerror = () => {
            toast.error("Failed to process image.");
        };
        reader.readAsDataURL(file);
    };

    const triggerUpload = () => {
        if (!isEditMode) return;
        inputRef.current?.click();
    };

    const removePhoto = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("profilePictureUrl", null);
    };

    const initials = (data.name || "")
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <ProfileSection title={t("sections.basic_info")} icon={UserIcon}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Hidden Input */}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={!isEditMode}
                />

                {/* Avatar Column */}
                <div className="lg:col-span-3 flex flex-col items-center space-y-4">
                    <div
                        className={`relative group ${
                            isEditMode ? "cursor-pointer" : ""
                        }`}
                        onClick={triggerUpload}
                    >
                        <Avatar className="h-32 w-32 border-2 border-border shadow-sm bg-muted overflow-hidden">
                            <AvatarImage
                                src={data.profilePictureUrl || undefined}
                                className="h-full w-full object-cover"
                                alt={data.name}
                            />
                            <AvatarFallback className="text-2xl font-semibold text-muted-foreground bg-muted">
                                {initials || "U"}
                            </AvatarFallback>
                        </Avatar>

                        {isEditMode && (
                            <div
                                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-[2px]">
                                <Camera className="w-7 h-7 text-white mb-1"/>
                                <span className="text-[10px] font-medium text-white/90 uppercase tracking-wide">
                                  {t("actions.change_photo") ?? "Upload"}
                                </span>
                            </div>
                        )}
                    </div>

                    {isEditMode && (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-xs h-8"
                                onClick={triggerUpload}
                            >
                                <Upload className="w-3 h-3 mr-2"/>
                                {t("actions.change") ?? "Change"}
                            </Button>

                            {data.profilePictureUrl && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={removePhoto}
                                    title={t("actions.remove_photo") ?? "Remove photo"}
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Fields Column */}
                <div className="lg:col-span-9 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                                <UserIcon className="w-3.5 h-3.5 text-muted-foreground/80"/>
                                <Label className="text-xs font-medium text-muted-foreground uppercase">
                                    {t("fields.name")}
                                </Label>
                            </div>
                            {isEditMode ? (
                                <Input
                                    value={data.name}
                                    onChange={(e) => onChange("name", e.target.value)}
                                    className="bg-background"
                                    placeholder="John Doe"
                                />
                            ) : (
                                <div className="border border-transparent font-medium text-base">
                                    {data.name}
                                </div>
                            )}
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                                <AtSign className="w-3.5 h-3.5 text-muted-foreground/80"/>
                                <Label className="text-xs font-medium text-muted-foreground uppercase">
                                    {t("fields.email")}
                                </Label>
                            </div>
                            <div
                                className={`flex items-center gap-2 rounded-md bg-muted/20 ${
                                    isEditMode
                                        ? "p-2 border border-border/50"
                                        : "pt-1 border border-transparent"
                                }`}
                            >
                            <span className="text-sm text-muted-foreground truncate flex-1">
                                {data.email}
                            </span>
                            </div>

                            {isEditMode && (
                                <p className="text-[10px] text-muted-foreground px-1">
                                    {t("hints.email_locked")}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bio Field */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-muted-foreground/80"/>
                            <Label className="text-xs font-medium text-muted-foreground uppercase">
                                {t("fields.bio")}
                            </Label>
                        </div>
                        {isEditMode ? (
                            <Textarea
                                value={data.bio || ""}
                                onChange={(e) => onChange("bio", e.target.value)}
                                className="bg-background min-h-[120px] resize-y"
                                placeholder={t("placeholders.bio")}
                            />
                        ) : (
                            <div
                                className="border border-transparent text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/10 rounded-md">
                                {data.bio || t("placeholders.no_bio") || "No bio provided."}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProfileSection>
    );
}
