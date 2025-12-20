/** @format */
"use client";

import React, {useState} from "react";
import {useTranslations} from "next-intl";
import {toast} from "sonner";

// Domain & Controller
import {AdministratorWithUser} from "@/lib/domain/administrator";
import {updateMyAdministratorProfile} from "@/lib/controller/admin/admin-profile-controller";

// Components
import {BaseProfile} from "@/components/profile/base-profile";
import {CommonUserFields} from "@/components/profile/common-user-fields";

interface AdminProfileProps {
    admin: AdministratorWithUser;
}

export function AdminProfile({admin}: AdminProfileProps) {
    const t = useTranslations("profile.admin");

    const [isSaving, setIsSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<AdministratorWithUser>(admin);
    const [originalData, setOriginalData] = useState<AdministratorWithUser>(admin);

    const handleUserUpdate = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            user: {
                ...prev.user,
                [field]: value
            }
        }));
    };

    const handleCancel = () => {
        setFormData(originalData);
        setIsEditMode(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatePayload = {
                user: {
                    update: {
                        name: formData.user.name,
                        bio: formData.user.bio,
                        profilePictureUrl: formData.user.profilePictureUrl
                    }
                }
            };

            const result = await updateMyAdministratorProfile(updatePayload);

            if (result.success) {
                window.location.reload()
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

    return (
        <BaseProfile
            title={t("title")}
            subtitle={t("subtitle")}
            isEditMode={isEditMode}
            isSaving={isSaving}
            onToggleEdit={() => setIsEditMode(true)}
            onCancel={handleCancel}
            onSave={handleSave}
        >
            <CommonUserFields
                data={formData.user}
                onChange={handleUserUpdate}
                isEditMode={isEditMode}
                t={t}
            />
        </BaseProfile>
    );
}
