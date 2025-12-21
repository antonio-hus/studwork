/** @format */
"use client";

import React, {useState} from "react";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {GraduationCap, Link as LinkIcon} from "lucide-react";

// Domain & Controller
import {StudentWithUser} from "@/lib/domain/student";
import {updateMyStudentProfile, deleteMyStudentAccount} from "@/lib/controller/student/student-profile-controller";

// Components
import {BaseProfile, ProfileSection} from "@/components/profile/base-profile";
import {CommonUserFields} from "@/components/profile/common-user-fields";

interface StudentProfileProps {
    student: StudentWithUser;
}

export function StudentProfile({student}: StudentProfileProps) {
    const t = useTranslations("profile.student");

    const [isSaving, setIsSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<StudentWithUser>(student);
    const [originalData, setOriginalData] = useState<StudentWithUser>(student);

    // FIX 1: Add local state for the raw input strings for arrays
    const [skillsInput, setSkillsInput] = useState(student.skills.join(", "));
    const [interestsInput, setInterestsInput] = useState(student.interests.join(", "));

    const handleUserUpdate = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            user: {
                ...prev.user,
                [field]: value
            }
        }));
    };

    const handleStudentUpdate = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCancel = () => {
        setFormData(originalData);
        // FIX 2: Reset the string inputs when cancelling
        setSkillsInput(originalData.skills.join(", "));
        setInterestsInput(originalData.interests.join(", "));
        setIsEditMode(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // FIX 3: Process the strings into arrays only when saving
            const finalSkills = skillsInput
                .split(",")
                .map(s => s.trim())
                .filter(s => s.length > 0);

            const finalInterests = interestsInput
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
                studyProgram: formData.studyProgram,
                yearOfStudy: formData.yearOfStudy ? parseInt(String(formData.yearOfStudy)) : null,
                skills: finalSkills, // Use processed array
                interests: finalInterests, // Use processed array
                linkedinUrl: formData.linkedinUrl
            };

            const result = await updateMyStudentProfile(updatePayload);

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
            const result = await deleteMyStudentAccount();
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

            <ProfileSection title={t("sections.student_details")} icon={GraduationCap}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="studyProgram" className="text-xs font-medium text-muted-foreground uppercase">
                            {t("fields.studyProgram")}
                        </Label>
                        {isEditMode ? (
                            <Input
                                id="studyProgram"
                                value={formData.studyProgram || ""}
                                onChange={(e) => handleStudentUpdate("studyProgram", e.target.value)}
                                placeholder={t("placeholders.studyProgram")}
                            />
                        ) : (
                            <div className="text-sm font-medium">{formData.studyProgram || "-"}</div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="yearOfStudy" className="text-xs font-medium text-muted-foreground uppercase">
                            {t("fields.yearOfStudy")}
                        </Label>
                        {isEditMode ? (
                            <Input
                                id="yearOfStudy"
                                type="number"
                                value={formData.yearOfStudy || ""}
                                onChange={(e) => handleStudentUpdate("yearOfStudy", e.target.value)}
                                placeholder={t("placeholders.yearOfStudy")}
                            />
                        ) : (
                            <div className="text-sm font-medium">{formData.yearOfStudy || "-"}</div>
                        )}
                    </div>
                </div>

                {/* SKILLS SECTION */}
                <div className="space-y-2">
                    <Label htmlFor="skills" className="text-xs font-medium text-muted-foreground uppercase">
                        {t("fields.skills")}
                    </Label>
                    {isEditMode ? (
                        <>
                            <Input
                                id="skills"
                                /* FIX 4: Bind to raw string state */
                                value={skillsInput}
                                onChange={(e) => setSkillsInput(e.target.value)}
                                placeholder={t("placeholders.skills")}
                            />
                            <p className="text-[10px] text-muted-foreground">{t("hints.skills_hint")}</p>
                        </>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {formData.skills.length > 0 ? (
                                formData.skills.map((skill, i) => (
                                    <span key={i}
                                          className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium">
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                            )}
                        </div>
                    )}
                </div>

                {/* INTERESTS SECTION */}
                <div className="space-y-2">
                    <Label htmlFor="interests" className="text-xs font-medium text-muted-foreground uppercase">
                        {t("fields.interests")}
                    </Label>
                    {isEditMode ? (
                        <>
                            <Input
                                id="interests"
                                /* FIX 5: Bind to raw string state */
                                value={interestsInput}
                                onChange={(e) => setInterestsInput(e.target.value)}
                                placeholder={t("placeholders.interests")}
                            />
                            <p className="text-[10px] text-muted-foreground">{t("hints.interests_hint")}</p>
                        </>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {formData.interests.length > 0 ? (
                                formData.interests.map((interest, i) => (
                                    <span key={i}
                                          className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium">
                                        {interest}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-muted-foreground/80"/>
                        <Label htmlFor="linkedinUrl" className="text-xs font-medium text-muted-foreground uppercase">
                            {t("fields.linkedinUrl")}
                        </Label>
                    </div>
                    {isEditMode ? (
                        <Input
                            id="linkedinUrl"
                            value={formData.linkedinUrl || ""}
                            onChange={(e) => handleStudentUpdate("linkedinUrl", e.target.value)}
                            placeholder={t("placeholders.linkedinUrl")}
                        />
                    ) : (
                        formData.linkedinUrl ? (
                            <a href={formData.linkedinUrl} target="_blank" rel="noopener noreferrer"
                               className="text-sm text-primary hover:underline truncate block">
                                {formData.linkedinUrl}
                            </a>
                        ) : (
                            <div className="text-sm text-muted-foreground">-</div>
                        )
                    )}
                </div>
            </ProfileSection>
        </BaseProfile>
    );
}