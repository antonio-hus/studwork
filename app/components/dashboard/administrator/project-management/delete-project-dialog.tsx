/** @format */
"use client";
import React, {useState} from "react";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {ProjectWithDetails} from "@/lib/domain/project";
import {deleteProject} from "@/lib/controller/admin/content-moderation-controller";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {useRouter} from "next/navigation";

interface Props {
    target: ProjectWithDetails | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function DeleteProjectDialog({target, onOpenChange, onSuccess}: Props) {
    const t = useTranslations("admin.projects.table");
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (!target) return;
        setIsSubmitting(true);

        try {
            const result = await deleteProject(target.id);
            if (result.success) {
                toast.success(t("deleteSuccess"));
                router.refresh();
                onSuccess();
            } else {
                toast.error(t("deleteError"));
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
                        {t("delete")}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {t("deleteWarning")}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="mr-2"
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="bg-error hover:bg-error/90"
                    >
                        {t("confirmDelete")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
