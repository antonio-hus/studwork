"use client";

import React, {useState} from "react";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Briefcase} from "lucide-react";

// Domain & Controller
import {CoordinatorWithUser} from "@/lib/domain/coordinator";
import {
    updateMyCoordinatorProfile,
    deleteMyCoordinatorAccount
} from "@/lib/controller/coordinator/coordinator-profile-controller";

// Components
import {BaseProfile, ProfileSection} from "@/components/profile/base-profile";
import {CommonUserFields} from "@/components/profile/common-user-fields";

interface CoordinatorProfileProps {
    coordinator: CoordinatorWithUser;
}

export function CoordinatorProfile({coordinator}: CoordinatorProfileProps) {
    const t = useTranslations("profile.coordinator");

    const [isSaving, setIsSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<CoordinatorWithUser>(coordinator);
    const [originalData, setOriginalData] = useState<CoordinatorWithUser>(coordinator);

    // FIX 1: Add a local state for the raw input string
    const [expertiseInput, setExpertiseInput] = useState(coordinator.areasOfExpertise.join(", "));

    const handleUserUpdate = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            user: {
                ...prev.user,
                [field]: value
            }
        }));
    };

    const handleCoordinatorUpdate = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCancel = () => {
        setFormData(originalData);
        // FIX 2: Reset the string input when cancelling
        setExpertiseInput(originalData.areasOfExpertise.join(", "));
        setIsEditMode(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // FIX 3: Convert the string to an array only when saving
            const finalAreasOfExpertise = expertiseInput
                .split(",")
                .map(s => s.trim())
                .filter(s => s.length > 0);

            const updatePayload = {
                user: {
                    update: {
                        name: formData.user.name,
                        bio: formData.user.bio,
                        profilePictureUrl: formData.user.profilePictureUrl
                    }
                },
                department: formData.department,
                title: formData.title,
                areasOfExpertise: finalAreasOfExpertise // Use the processed array here
            };

            const result = await updateMyCoordinatorProfile(updatePayload);

            if (result.success) {
                window.location.reload();
            } else {
                toast.error(result.error || t("error_message"));
            }
        } catch (e) {
            console.error(e);
            toast.error(t("error_unexpected"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            const result = await deleteMyCoordinatorAccount();
            if (!result.success) {
                toast.error(result.error || t("error_message"));
            }
        } catch (e) {
            console.error(e);
            toast.error(t("error_unexpected"));
        }
    };

    return (
        <BaseProfile
            title={t("title")}
            subtitle={t("subtitle")}
            isEditMode={isEditMode}
            isSaving={isSaving}
            onToggleEdit={() => setIsEditMode(true)}
            onCancel={handleCancel}
            onSave={handleSave}
            onDelete={handleDelete}
        >
            <CommonUserFields
                data={formData.user}
                onChange={handleUserUpdate}
                isEditMode={isEditMode}
                t={t}
            />

            <ProfileSection title={t("sections.coordinator_details")} icon={Briefcase}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="department" className="text-xs font-medium text-muted-foreground uppercase">
                            {t("fields.department")}
                        </Label>
                        {isEditMode ? (
                            <Input
                                id="department"
                                value={formData.department || ""}
                                onChange={(e) => handleCoordinatorUpdate("department", e.target.value)}
                                placeholder={t("placeholders.department")}
                            />
                        ) : (
                            <div className="text-sm font-medium">{formData.department || "-"}</div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-medium text-muted-foreground uppercase">
                            {t("fields.title")}
                        </Label>
                        {isEditMode ? (
                            <Input
                                id="title"
                                value={formData.title || ""}
                                onChange={(e) => handleCoordinatorUpdate("title", e.target.value)}
                                placeholder={t("placeholders.title")}
                            />
                        ) : (
                            <div className="text-sm font-medium">{formData.title || "-"}</div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="areasOfExpertise" className="text-xs font-medium text-muted-foreground uppercase">
                        {t("fields.areasOfExpertise")}
                    </Label>
                    {isEditMode ? (
                        <>
                            <Input
                                id="areasOfExpertise"
                                /* FIX 4: Bind to the raw string state, not the array join */
                                value={expertiseInput}
                                onChange={(e) => setExpertiseInput(e.target.value)}
                                placeholder={t("placeholders.areasOfExpertise")}
                            />
                            <p className="text-[10px] text-muted-foreground">{t("hints.expertise_hint")}</p>
                        </>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {formData.areasOfExpertise.length > 0 ? (
                                formData.areasOfExpertise.map((area, i) => (
                                    <span key={i}
                                          className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium">
                                        {area}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                            )}
                        </div>
                    )}
                </div>
            </ProfileSection>
        </BaseProfile>
    );
}