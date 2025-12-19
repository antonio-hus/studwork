/** @format */
"use client";

import React, {useState} from "react";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {OrganizationWithUser} from "@/lib/domain/organization";
import {rejectOrganization} from "@/lib/controller/admin/user-management-controller";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

interface Props {
    target: OrganizationWithUser | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function RejectOrganizationDialog({target, onOpenChange, onSuccess}: Props) {
    const t = useTranslations("admin.organizations.modals.reject");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (!target) return;
        if (!reason.trim()) {
            toast.error(t("reasonRequired"));
            return;
        }

        setIsSubmitting(true);
        const result = await rejectOrganization(target.user.id, reason);
        setIsSubmitting(false);

        if (result.success) {
            toast.success(t("success"));
            onSuccess();
        } else {
            toast.error(result.error);
        }
    };

    return (
        <Dialog open={!!target} onOpenChange={onOpenChange}>
            <DialogContent
                className="bg-white dark:bg-zinc-950 border-border shadow-2xl sm:max-w-[425px] z-[100] isolate opacity-100"
                style={{backgroundColor: "var(--color-background, #ffffff)", opacity: 1}}
            >
                <DialogHeader>
                    <DialogTitle className="text-error">{t("title")}</DialogTitle>
                    <DialogDescription>
                        {t("description")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <label className="text-sm font-medium">{t("reasonLabel")}</label>
                    <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={t("reasonPlaceholder")}
                        className="resize-none min-h-[100px]"
                    />
                </div>

                <DialogFooter>
                    <Button variant="ghost" className="border-muted" onClick={() => onOpenChange(false)}>
                        {t("cancel")}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="bg-error hover:bg-error/90"
                    >
                        {isSubmitting ? t("submitting") : t("confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}