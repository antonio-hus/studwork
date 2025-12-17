/** @format */
'use client';

import React from 'react';
import {useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {toast} from 'sonner';
import {User, UserRole} from '@/lib/domain/user';
import {verifyOrganization} from '@/lib/controller/admin/user-management-controller';
import {
    MoreHorizontal,
    UserCog,
    CheckCircle2,
    ShieldCheck,
    Ban
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {cn} from '@/lib/utils';

interface Props {
    user: User;
    roles: typeof UserRole;
    onSuspendClick: () => void;
}

/**
 * Renders a dropdown menu containing actions for a user.
 *
 * This component provides contextual actions like verifying an organization,
 * viewing a profile, or suspending/unsuspending the user.
 *
 * @param {Props} props The component props.
 * @param {User} props.user The user object for which actions are displayed.
 * @param {typeof UserRole} props.roles The enum of available user roles.
 * @param {() => void} props.onSuspendClick Callback for the suspend/unsuspend action.
 * @returns {React.JSX.Element} A dropdown menu with user-specific actions.
 */
export function UserActionsMenu({user, roles, onSuspendClick}: Props): React.JSX.Element {
    const t = useTranslations('admin.users');
    const router = useRouter();

    const handleVerifyOrg = async () => {
        const result = await verifyOrganization(user.id);
        if (result.success) {
            toast.success(t('success.orgVerified'));
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                >
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-[200px] bg-background border-border shadow-xl z-100"
            >
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('actions.label')}
                </DropdownMenuLabel>

                <DropdownMenuItem className="cursor-pointer focus:bg-muted">
                    <UserCog className="mr-2 h-4 w-4 text-muted-foreground"/>
                    {t('actions.viewProfile')}
                </DropdownMenuItem>

                {user.role === roles.ORGANIZATION && !user.emailVerified && (
                    <>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem
                            onClick={handleVerifyOrg}
                            className="cursor-pointer text-success hover:text-success focus:text-success focus:bg-success/10"
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4"/>
                            {t('actions.verifyOrg')}
                        </DropdownMenuItem>
                    </>
                )}

                <DropdownMenuSeparator/>

                <DropdownMenuItem
                    onClick={onSuspendClick}
                    className={cn(
                        'cursor-pointer',
                        user.isSuspended
                            ? 'text-success focus:text-success focus:bg-success/10'
                            : 'text-error focus:text-error focus:bg-error/10'
                    )}
                >
                    {user.isSuspended ? (
                        <>
                            <ShieldCheck className="mr-2 h-4 w-4"/>
                            {t('actions.unsuspend')}
                        </>
                    ) : (
                        <>
                            <Ban className="mr-2 h-4 w-4"/>
                            {t('actions.suspend')}
                        </>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
