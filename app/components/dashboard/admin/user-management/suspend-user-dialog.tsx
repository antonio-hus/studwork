/** @format */
"use client";

import React, {useState, useEffect} from "react";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {User} from "@/lib/domain/user";
import {toggleUserSuspension} from "@/lib/controller/admin/user-management-controller";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {cn} from "@/lib/utils";

interface Props {
    target: User | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

/**
 * Modal to handle user suspension/restoration logic.
 */
export function SuspendUserDialog({target, onOpenChange, onSuccess}: Props) {
    const t = useTranslations("admin.users");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (target) setReason("");
    }, [target]);

    const handleConfirm = async () => {
        if (!target) return;
        setIsSubmitting(true);
        const isSuspending = !target.isSuspended;

        try {
            const result = await toggleUserSuspension(target.id, isSuspending, reason);
            if (result.success) {
                toast.success(isSuspending ? t("success.suspended") : t("success.restored"));
                onSuccess();
            } else {
                toast.error(result.error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={!!target} onOpenChange={onOpenChange}>
            <DialogContent className="bg-background border-border shadow-2xl sm:max-w-[425px] gap-6 z-[100]">
                <DialogHeader className="gap-2">
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        {target?.isSuspended ? t("modals.unsuspendTitle") : t("modals.suspendTitle")}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {t("modals.targetUser")}
                    </DialogDescription>
                </DialogHeader>

                {!target?.isSuspended && (
                    <div className="space-y-3">
                        <label
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {t("modals.reasonLabel")}
                        </label>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={t("modals.reasonPlaceholder")}
                            className="resize-none min-h-[100px] focus-visible:ring-primary/20"
                        />
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="hover:bg-muted"
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        variant={target?.isSuspended ? "default" : "destructive"}
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className={cn(
                            "shadow-sm transition-all",
                            target?.isSuspended
                                ? "bg-primary hover:bg-primary/90"
                                : "bg-error hover:bg-error/90"
                        )}
                    >
                        {target?.isSuspended ? t("confirmUnsuspend") : t("confirmSuspend")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}