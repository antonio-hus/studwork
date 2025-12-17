/** @format */
'use client';

import React, {useEffect, useState, isValidElement, cloneElement} from 'react';
import {useTranslations} from 'next-intl';
import type {User, UserRole} from '@/lib/domain/user';
import {getUserDetails} from '@/lib/controller/admin/user-management-controller';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from '@/components/ui/dialog';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Separator} from '@/components/ui/separator';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Badge} from '@/components/ui/badge';
import {
    Loader2,
    Mail,
    Calendar,
    Hash,
    MapPin,
    Globe,
    Building,
    BookOpen,
    FileText,
    Award,
    Briefcase,
    Phone,
    Facebook,
    UserCircle,
    CheckCircle2
} from 'lucide-react';
import {RoleBadge} from './role-badge';
import {StatusBadge} from './status-badge';
import {cn} from '@/lib/utils';

interface Props {
    user: User | null;
    open: boolean;
    roles: typeof UserRole;
    onOpenChange: (open: boolean) => void;
}

/**
 * Renders a modal dialog displaying detailed user information.
 *
 * This component handles fetching role-specific data (Student, Coordinator, or Organization)
 * when a user is selected and displays it alongside general account information.
 *
 * @param {Props} props The component props.
 * @param {User | null} props.user The user object to display.
 * @param {boolean} props.open Controls the visibility of the dialog.
 * @param {typeof UserRole} props.roles Enum of available user roles.
 * @param {(open: boolean) => void} props.onOpenChange Callback to update the dialog's open state.
 * @returns {React.JSX.Element | null} The profile dialog or null if no user is selected.
 */
export function UserProfileDialog({user, open, onOpenChange, roles}: Props) {
    const t = useTranslations('admin.users.profile');
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && user) {
            setLoading(true);
            setDetails(null);

            getUserDetails(user.id)
                .then((res) => {
                    if (res.success) setDetails(res.data);
                })
                .finally(() => setLoading(false));
        }
    }, [open, user]);

    if (!user) return null;

    const formatAddress = (addr?: string, city?: string, country?: string) => {
        const parts = [addr, city, country].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : null;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="bg-background border-border shadow-2xl max-w-2xl gap-0 p-0 overflow-hidden z-[100] isolate opacity-100"
                style={{
                    backgroundColor: 'var(--color-background, #ffffff)',
                    opacity: 1
                }}
            >
                {/* Header Banner */}
                <div className="relative h-32 bg-muted/30 border-b border-border">
                    <div className="absolute -bottom-10 left-6">
                        <Avatar className="h-20 w-20 border-4 border-background shadow-sm bg-background">
                            <AvatarImage src={user.profilePictureUrl || undefined}/>
                            <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                {user.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                <div className="px-6 pt-12 pb-6">
                    <DialogHeader className="mb-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <DialogTitle className="text-2xl font-bold">
                                    {user.name}
                                </DialogTitle>
                                <DialogDescription className="flex items-center gap-2 mt-1.5">
                                    <Mail className="w-3.5 h-3.5"/> {user.email}
                                </DialogDescription>
                            </div>
                            <div className="flex gap-2">
                                <RoleBadge role={user.role} roles={roles}/>
                                <StatusBadge user={user}/>
                            </div>
                        </div>
                    </DialogHeader>

                    <Separator className="mb-6"/>

                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-8">
                            {/* General Info Section (Available for all) */}
                            <InfoSection title={t('sections.general')}>
                                <ProfileInfoItem
                                    icon={<Hash/>}
                                    label={t('labels.id')}
                                    value={user.id}
                                    code
                                />
                                <ProfileInfoItem
                                    icon={<Calendar/>}
                                    label={t('labels.joined')}
                                    value={new Date(user.createdAt).toLocaleDateString(
                                        undefined,
                                        {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }
                                    )}
                                />
                                <ProfileInfoItem
                                    icon={<FileText/>}
                                    label={t('labels.bio')}
                                    value={user.bio}
                                    colSpan2
                                    className="italic text-muted-foreground"
                                />
                            </InfoSection>

                            {/* Dynamic Role Specific Info */}
                            {loading ? (
                                <div className="py-12 flex justify-center text-muted-foreground">
                                    <Loader2 className="w-8 h-8 animate-spin opacity-50"/>
                                </div>
                            ) : details ? (
                                <>
                                    {/* STUDENT PROFILE */}
                                    {user.role === roles.STUDENT && (
                                        <InfoSection title={t('sections.studentDetails')}>
                                            <ProfileInfoItem
                                                icon={<BookOpen/>}
                                                label={t('labels.studyProgram')}
                                                value={details.student?.studyProgram}
                                            />
                                            <ProfileInfoItem
                                                icon={<Calendar/>}
                                                label={t('labels.yearOfStudy')}
                                                value={details.student?.yearOfStudy?.toString()}
                                            />
                                            <ProfileInfoItem
                                                icon={<Award/>}
                                                label={t('labels.skills')}
                                                value={details.student?.skills}
                                                isArray
                                                colSpan2
                                            />
                                            <ProfileInfoItem
                                                icon={<UserCircle/>}
                                                label={t('labels.interests')}
                                                value={details.student?.interests}
                                                isArray
                                                colSpan2
                                            />
                                            <ProfileInfoItem
                                                icon={<FileText/>}
                                                label={t('labels.resume')}
                                                value={details.student?.resumeUrl}
                                                isLink
                                                colSpan2
                                            />
                                        </InfoSection>
                                    )}

                                    {/* COORDINATOR PROFILE */}
                                    {user.role === roles.COORDINATOR && (
                                        <InfoSection
                                            title={t('sections.coordinatorDetails')}
                                        >
                                            <ProfileInfoItem
                                                icon={<Briefcase/>}
                                                label={t('labels.title')}
                                                value={details.coordinator?.title}
                                            />
                                            <ProfileInfoItem
                                                icon={<Building/>}
                                                label={t('labels.department')}
                                                value={details.coordinator?.department}
                                            />
                                            <ProfileInfoItem
                                                icon={<Award/>}
                                                label={t('labels.expertise')}
                                                value={details.coordinator?.areasOfExpertise}
                                                isArray
                                                colSpan2
                                            />
                                        </InfoSection>
                                    )}

                                    {/* ORGANIZATION PROFILE */}
                                    {user.role === roles.ORGANIZATION && (
                                        <InfoSection title={t('sections.orgDetails')}>
                                            <ProfileInfoItem
                                                icon={<Building/>}
                                                label={t('labels.type')}
                                                value={details.organization?.type}
                                                className="capitalize"
                                            />
                                            <ProfileInfoItem
                                                icon={<CheckCircle2/>}
                                                label={t('labels.verified')}
                                                value={
                                                    details.organization?.isVerified
                                                        ? 'Verified'
                                                        : 'Unverified'
                                                }
                                                className={
                                                    details.organization?.isVerified
                                                        ? 'text-green-600'
                                                        : 'text-amber-600'
                                                }
                                            />

                                            {/* Contact Info Group */}
                                            <div
                                                className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                                <ProfileInfoItem
                                                    icon={<UserCircle/>}
                                                    label={t('labels.contactPerson')}
                                                    value={details.organization?.contactPerson}
                                                />
                                                <ProfileInfoItem
                                                    icon={<Phone/>}
                                                    label={t('labels.phone')}
                                                    value={details.organization?.contactPhone}
                                                />
                                                <ProfileInfoItem
                                                    icon={<Mail/>}
                                                    label={t('labels.contactEmail')}
                                                    value={details.organization?.contactEmail}
                                                    colSpan2
                                                />
                                            </div>

                                            {/* Links & Location */}
                                            <ProfileInfoItem
                                                icon={<Globe/>}
                                                label={t('labels.website')}
                                                value={details.organization?.websiteUrl}
                                                isLink
                                            />
                                            <ProfileInfoItem
                                                icon={<Facebook/>}
                                                label={t('labels.facebook')}
                                                value={details.organization?.facebookUrl}
                                                isLink
                                            />
                                            <ProfileInfoItem
                                                icon={<MapPin/>}
                                                label={t('labels.address')}
                                                value={formatAddress(
                                                    details.organization?.address,
                                                    details.organization?.city,
                                                    details.organization?.country
                                                )}
                                                colSpan2
                                            />
                                        </InfoSection>
                                    )}
                                </>
                            ) : null}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

/**
 * A layout wrapper for a titled section of profile information.
 *
 * @param {SectionProps} props The component props.
 * @param {string} props.title The title displayed above the section.
 * @param {React.ReactNode} props.children The profile items to render within the grid.
 * @returns {React.JSX.Element} A styled section container.
 */
function InfoSection({title, children}: SectionProps) {
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

interface InfoItemProps {
    icon?: React.ReactNode;
    label: string;
    value?: string | string[] | null;
    code?: boolean;
    colSpan2?: boolean;
    isLink?: boolean;
    isArray?: boolean;
    className?: string;
}

/**
 * Renders a single piece of profile information with various display formats.
 *
 * Handles different value types including strings, arrays (rendered as badges),
 * links, and empty states (rendered as "N/A").
 *
 * @param {InfoItemProps} props The component props.
 * @param {React.ReactNode} [props.icon] Optional icon to display next to the label.
 * @param {string} props.label The label describing the information.
 * @param {string | string[] | null} [props.value] The data to display.
 * @param {boolean} [props.code] Whether to render the text in a monospace font.
 * @param {boolean} [props.colSpan2] Whether to span two columns in the grid.
 * @param {boolean} [props.isLink] Whether to render the value as an external link.
 * @param {boolean} [props.isArray] Whether the value is an array of strings to be rendered as badges.
 * @param {string} [props.className] Additional CSS classes for the value element.
 * @returns {React.JSX.Element} The formatted profile item.
 */
function ProfileInfoItem({icon, label, value, code, colSpan2, isLink, isArray, className}: InfoItemProps) {
    // Logic to determine if we show N/A
    const isEmpty =
        value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0);

    return (
        <div className={cn('flex flex-col gap-1.5', colSpan2 && 'sm:col-span-2')}>
			<span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
				{isValidElement(icon) &&
                    cloneElement(
                        icon as React.ReactElement<{ className?: string }>,
                        {
                            className: 'w-3.5 h-3.5 opacity-70'
                        }
                    )}
                {label}
			</span>

            {isEmpty ? (
                <span className="text-sm text-muted-foreground/40 italic">N/A</span>
            ) : isArray && Array.isArray(value) ? (
                <div className="flex flex-wrap gap-1.5">
                    {value.map((item, i) => (
                        <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs font-normal px-2 py-0 h-6"
                        >
                            {item}
                        </Badge>
                    ))}
                </div>
            ) : isLink && typeof value === 'string' ? (
                <a
                    href={value.startsWith('http') ? value : `https://${value}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-primary hover:underline hover:text-primary/80 truncate w-fit max-w-full block transition-colors"
                >
                    {value}
                </a>
            ) : (
                <span
                    className={cn(
                        'text-sm font-medium text-foreground break-words',
                        code && 'font-mono text-xs bg-muted px-2 py-1 rounded w-fit',
                        className
                    )}
                >
					{String(value)}
				</span>
            )}
        </div>
    );
}
