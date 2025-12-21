/** @format */
"use client";

import React, {useState} from "react";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Building2, MapPin, Phone, Globe, Facebook} from "lucide-react";

// Domain & Controller
import type {OrganizationWithUser, OrganizationType} from "@/lib/domain/organization";
import {
    updateMyOrganizationProfile,
    deleteMyOrganizationAccount
} from "@/lib/controller/organization/organization-profile-controller";

// Components
import {BaseProfile, ProfileSection} from "@/components/profile/base-profile";
import {CommonUserFields} from "@/components/profile/common-user-fields";

interface OrganizationProfileProps {
    organization: OrganizationWithUser;
    organizationTypes: typeof OrganizationType;
}

export function OrganizationProfile({organization, organizationTypes}: OrganizationProfileProps) {
    const t = useTranslations("profile.organization");

    const [isSaving, setIsSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<OrganizationWithUser>(organization);
    const [originalData, setOriginalData] = useState<OrganizationWithUser>(organization);

    const handleUserUpdate = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            user: {
                ...prev.user,
                [field]: value
            }
        }));
    };

    const handleOrgUpdate = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
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
                },
                type: formData.type,
                contactPerson: formData.contactPerson,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone,
                websiteUrl: formData.websiteUrl,
                facebookUrl: formData.facebookUrl,
                address: formData.address,
                city: formData.city,
                country: formData.country
            };

            const result = await updateMyOrganizationProfile(updatePayload);

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

    const handleDelete = async () => {
        try {
            const result = await deleteMyOrganizationAccount();
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

            <ProfileSection title={t("sections.organization_details")} icon={Building2}>
                <div className="space-y-2">
                    <Label htmlFor="type" className="text-xs font-medium text-muted-foreground uppercase">
                        {t("fields.type")}
                    </Label>
                    {isEditMode ? (
                        <Select
                            value={formData.type}
                            onValueChange={(val) => handleOrgUpdate("type", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t("placeholders.type")}/>
                            </SelectTrigger>
                            <SelectContent className="bg-background border-background">
                                {Object.values(organizationTypes).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="text-sm font-medium">{formData.type}</div>
                    )}
                </div>
            </ProfileSection>

            <ProfileSection title={t("sections.contact_info")} icon={Phone}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="contactPerson" className="text-xs font-medium text-muted-foreground uppercase">
                            {t("fields.contactPerson")}
                        </Label>
                        {isEditMode ? (
                            <Input
                                id="contactPerson"
                                value={formData.contactPerson || ""}
                                onChange={(e) => handleOrgUpdate("contactPerson", e.target.value)}
                                placeholder={t("placeholders.contactPerson")}
                            />
                        ) : (
                            <div className="text-sm font-medium">{formData.contactPerson || "-"}</div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactEmail" className="text-xs font-medium text-muted-foreground uppercase">
                            {t("fields.contactEmail")}
                        </Label>
                        {isEditMode ? (
                            <Input
                                id="contactEmail"
                                type="email"
                                value={formData.contactEmail || ""}
                                onChange={(e) => handleOrgUpdate("contactEmail", e.target.value)}
                                placeholder={t("placeholders.contactEmail")}
                            />
                        ) : (
                            <div className="text-sm font-medium">{formData.contactEmail || "-"}</div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="contactPhone" className="text-xs font-medium text-muted-foreground uppercase">
                            {t("fields.contactPhone")}
                        </Label>
                        {isEditMode ? (
                            <Input
                                id="contactPhone"
                                value={formData.contactPhone || ""}
                                onChange={(e) => handleOrgUpdate("contactPhone", e.target.value)}
                                placeholder={t("placeholders.contactPhone")}
                            />
                        ) : (
                            <div className="text-sm font-medium">{formData.contactPhone || "-"}</div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-muted-foreground/80"/>
                            <Label htmlFor="websiteUrl" className="text-xs font-medium text-muted-foreground uppercase">
                                {t("fields.websiteUrl")}
                            </Label>
                        </div>
                        {isEditMode ? (
                            <Input
                                id="websiteUrl"
                                value={formData.websiteUrl || ""}
                                onChange={(e) => handleOrgUpdate("websiteUrl", e.target.value)}
                                placeholder={t("placeholders.websiteUrl")}
                            />
                        ) : (
                            formData.websiteUrl ? (
                                <a href={formData.websiteUrl} target="_blank" rel="noopener noreferrer"
                                   className="text-sm text-primary hover:underline truncate block">
                                    {formData.websiteUrl}
                                </a>
                            ) : (
                                <div className="text-sm text-muted-foreground">-</div>
                            )
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <Facebook className="w-3.5 h-3.5 text-muted-foreground/80"/>
                        <Label htmlFor="facebookUrl" className="text-xs font-medium text-muted-foreground uppercase">
                            {t("fields.facebookUrl")}
                        </Label>
                    </div>
                    {isEditMode ? (
                        <Input
                            id="facebookUrl"
                            value={formData.facebookUrl || ""}
                            onChange={(e) => handleOrgUpdate("facebookUrl", e.target.value)}
                            placeholder={t("placeholders.facebookUrl")}
                        />
                    ) : (
                        formData.facebookUrl ? (
                            <a href={formData.facebookUrl} target="_blank" rel="noopener noreferrer"
                               className="text-sm text-primary hover:underline truncate block">
                                {formData.facebookUrl}
                            </a>
                        ) : (
                            <div className="text-sm text-muted-foreground">-</div>
                        )
                    )}
                </div>
            </ProfileSection>

            <ProfileSection title={t("sections.location")} icon={MapPin}>
                <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs font-medium text-muted-foreground uppercase">
                        {t("fields.address")}
                    </Label>
                    {isEditMode ? (
                        <Input
                            id="address"
                            value={formData.address || ""}
                            onChange={(e) => handleOrgUpdate("address", e.target.value)}
                            placeholder={t("placeholders.address")}
                        />
                    ) : (
                        <div className="text-sm font-medium">{formData.address || "-"}</div>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="city" className="text-xs font-medium text-muted-foreground uppercase">
                            {t("fields.city")}
                        </Label>
                        {isEditMode ? (
                            <Input
                                id="city"
                                value={formData.city || ""}
                                onChange={(e) => handleOrgUpdate("city", e.target.value)}
                                placeholder={t("placeholders.city")}
                            />
                        ) : (
                            <div className="text-sm font-medium">{formData.city || "-"}</div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country" className="text-xs font-medium text-muted-foreground uppercase">
                            {t("fields.country")}
                        </Label>
                        {isEditMode ? (
                            <Input
                                id="country"
                                value={formData.country || ""}
                                onChange={(e) => handleOrgUpdate("country", e.target.value)}
                                placeholder={t("placeholders.country")}
                            />
                        ) : (
                            <div className="text-sm font-medium">{formData.country || "-"}</div>
                        )}
                    </div>
                </div>
            </ProfileSection>
        </BaseProfile>
    );
}
