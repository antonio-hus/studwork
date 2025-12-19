/** @format */
"use client";
import React, {useState, useEffect, isValidElement, cloneElement} from "react";
import {useTranslations} from "next-intl";
import {ProjectWithDetails, ProjectUpdateType, ProjectStatus} from "@/lib/domain/project";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {updateProject} from "@/lib/controller/admin/content-moderation-controller";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {
    Pencil,
    Save,
    X,
    Hash,
    Calendar,
    FileText,
    Building,
    Globe,
    Phone,
    Mail,
    UserCircle,
    Award,
    Clock,
    Users,
    Tag
} from "lucide-react";
import {Separator} from "@/components/ui/separator";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";

interface Props {
    statuses: typeof ProjectStatus;
    project: ProjectWithDetails | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProjectDetailsDialog({statuses, project, open, onOpenChange}: Props) {
    const t = useTranslations("admin.projects.details");
    const router = useRouter();
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<ProjectUpdateType>({});
    const [activeProject, setActiveProject] = useState<ProjectWithDetails | null>(project);
    const isArchived = project?.status === statuses.ARCHIVED;

    useEffect(() => {
        setActiveProject(project);
        if (project) {
            setFormData({
                title: project.title,
                description: project.description,
                requiredSkills: project.requiredSkills,
                category: project.category,
                estimatedHoursPerWeek: project.estimatedHoursPerWeek,
                estimatedDurationWeeks: project.estimatedDurationWeeks,
                numberOfStudents: project.numberOfStudents,
            });
        }
    }, [project]);

    if (!activeProject) {
        return null;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: parseInt(value)}));
    };

    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;
        setFormData((prev) => ({...prev, requiredSkills: value.split(',').map(skill => skill.trim())}));
    };

    const handleSave = async () => {
        if (!activeProject) return;
        const response = await updateProject(activeProject.id, formData);
        if (response.success) {
            toast.success(t("updateSuccess"));
            setActiveProject(prev => prev ? ({...prev, ...response.data}) : null);
            router.refresh();
            setIsEditMode(false);
        } else {
            toast.error(t("updateError"));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="bg-background border-border shadow-2xl max-w-2xl gap-0 p-0 overflow-hidden z-[100] isolate opacity-100"
                style={{backgroundColor: 'var(--color-background, #ffffff)', opacity: 1}}>
                <div className="px-6 pt-8 pb-6">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold">{activeProject.title}</DialogTitle>
                        <DialogDescription className="flex items-center gap-2 mt-1.5">
                            <Building className="w-3.5 h-3.5"/> {activeProject.organization.user.name}
                        </DialogDescription>
                    </DialogHeader>

                    <Separator className="mb-6"/>

                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-8">
                            <InfoSection title={t("projectDetails")}>
                                {!isArchived && isEditMode ? (
                                    <>
                                        <div className="sm:col-span-2">
                                            <label className="text-sm font-medium">{t("projectTitle")}</label>
                                            <Input name="title" value={formData.title as string || ''}
                                                   onChange={handleInputChange}/>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="text-sm font-medium">{t("projectDescription")}</label>
                                            <Textarea name="description"
                                                      value={formData.description as string || ''}
                                                      onChange={handleInputChange}/>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="text-sm font-medium">{t("requiredSkills")}</label>
                                            <Input name="requiredSkills"
                                                   value={(formData.requiredSkills as string[] || []).join(', ')}
                                                   onChange={handleSkillsChange}/>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">{t("category")}</label>
                                            <Input name="category" value={formData.category as string || ''}
                                                   onChange={handleInputChange}/>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">{t("estHours")}</label>
                                            <Input name="estimatedHoursPerWeek"
                                                   value={formData.estimatedHoursPerWeek as number || ''}
                                                   type="number"
                                                   onChange={handleNumberInputChange}/>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">{t("estWeeks")}</label>
                                            <Input name="estimatedDurationWeeks"
                                                   value={formData.estimatedDurationWeeks as number || ''}
                                                   type="number"
                                                   onChange={handleNumberInputChange}/>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">{t("numStudents")}</label>
                                            <Input name="numberOfStudents"
                                                   value={formData.numberOfStudents as number || ''}
                                                   type="number"
                                                   onChange={handleNumberInputChange}/>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ProfileInfoItem icon={<Hash/>} label="Project ID" value={activeProject.id}
                                                         code/>
                                        <ProfileInfoItem icon={<Calendar/>} label="Created At"
                                                         value={new Date(activeProject.createdAt).toLocaleDateString()}/>
                                        <ProfileInfoItem icon={<FileText/>} label={t("projectDescription")}
                                                         value={activeProject.description} colSpan2/>
                                        <ProfileInfoItem icon={<Award/>} label={t("requiredSkills")}
                                                         value={activeProject.requiredSkills} isArray colSpan2/>
                                        <ProfileInfoItem icon={<Tag/>} label={t("category")}
                                                         value={activeProject.category}/>
                                        <ProfileInfoItem icon={<Clock/>} label={t("estHours")}
                                                         value={activeProject.estimatedHoursPerWeek?.toString()}/>
                                        <ProfileInfoItem icon={<Calendar/>} label={t("estWeeks")}
                                                         value={activeProject.estimatedDurationWeeks?.toString()}/>
                                        <ProfileInfoItem icon={<Users/>} label={t("numStudents")}
                                                         value={activeProject.numberOfStudents?.toString()}/>
                                    </>
                                )}
                            </InfoSection>

                            <InfoSection title={t("organization")}>
                                <ProfileInfoItem icon={<UserCircle/>} label={t("orgName")}
                                                 value={activeProject.organization.user.name}/>
                                <ProfileInfoItem icon={<Mail/>} label={t("orgEmail")}
                                                 value={activeProject.organization.user.email}/>
                                <ProfileInfoItem icon={<Phone/>} label={t("orgPhone")}
                                                 value={activeProject.organization.contactPhone}/>
                                <ProfileInfoItem icon={<Building/>} label={t("orgAddress")}
                                                 value={activeProject.organization.address}/>
                                <ProfileInfoItem icon={<Globe/>} label={t("orgWebsite")}
                                                 value={activeProject.organization.websiteUrl} isLink/>
                            </InfoSection>

                            <InfoSection title={t("coordinator")}>
                                {activeProject.coordinator ? (
                                    <>
                                        <ProfileInfoItem icon={<UserCircle/>} label={t("coordName")}
                                                         value={activeProject.coordinator.user.name}/>
                                        <ProfileInfoItem icon={<Mail/>} label={t("coordEmail")}
                                                         value={activeProject.coordinator.user.email}/>
                                        <ProfileInfoItem icon={<Building/>} label={t("coordDepartment")}
                                                         value={activeProject.coordinator.department}/>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic sm:col-span-2">N/A</p>
                                )}
                            </InfoSection>
                        </div>
                    </ScrollArea>
                </div>
                <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-border">
                    {!isArchived && isEditMode ? (
                        <div className="flex gap-2">
                            <Button variant="outline" className="border-muted" onClick={() => setIsEditMode(false)}>
                                <X className="mr-2 h-4 w-4"/>{t("cancel")}
                            </Button>
                            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/>{t("saveChanges")}</Button>
                        </div>
                    ) : (
                        !isArchived && (
                            <Button onClick={() => setIsEditMode(true)}>
                                <Pencil className="mr-2 h-4 w-4"/>{t("editMode")}
                            </Button>
                        )
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function InfoSection({title, children}: { title: string, children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {title}
            </h4>
            <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 bg-muted/10 p-4 rounded-lg border border-border/50">
                {children}
            </div>
        </div>
    );
}

function ProfileInfoItem({icon, label, value, code, colSpan2, isLink, isArray, className}: {
    icon?: React.ReactNode,
    label: string,
    value?: string | string[] | null,
    code?: boolean,
    colSpan2?: boolean,
    isLink?: boolean,
    isArray?: boolean,
    className?: string
}) {
    const isEmpty = value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);

    return (
        <div className={cn('flex flex-col gap-1.5', colSpan2 && 'sm:col-span-2')}>
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                {isValidElement(icon) && cloneElement(icon as React.ReactElement<{
                    className?: string
                }>, {className: 'w-3.5 h-3.5 opacity-70'})}
                {label}
            </span>
            {isEmpty ? (
                <span className="text-sm text-muted-foreground/40 italic">N/A</span>
            ) : isArray && Array.isArray(value) ? (
                <div className="flex flex-wrap gap-1.5">
                    {value.map((item, i) => (
                        <Badge key={i} variant="secondary"
                               className="text-xs font-normal px-2 py-0 h-6 bg-primary/10 text-primary">
                            {item}
                        </Badge>
                    ))}
                </div>
            ) : isLink && typeof value === 'string' ? (
                <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer"
                   className="text-sm font-medium text-primary hover:underline hover:text-primary/80 truncate w-fit max-w-full block transition-colors">
                    {value}
                </a>
            ) : (
                <span
                    className={cn('text-sm font-medium text-foreground break-words', code && 'font-mono text-xs bg-muted px-2 py-1 rounded w-fit', className)}>
                    {String(value)}
                </span>
            )}
        </div>
    );
}
