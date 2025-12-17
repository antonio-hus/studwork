/** @format */
'use client';

import {useSearchParams} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {AlertTriangle} from 'lucide-react';

/**
 * Expired Session Notice Component.
 *
 * Displays a warning alert when the user is redirected to the login page
 * due to an expired session token.
 */
export function ExpiredSessionNotice() {
    const searchParams = useSearchParams();
    const t = useTranslations('pages.auth.session');
    const expired = searchParams.get('expired');

    if (!expired) return null;

    return (
        <div
            className="mb-6 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4 text-warning shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5"/>
            <div className="grid gap-1">
                <h5 className="font-medium leading-none tracking-tight">
                    {t('expired')}
                </h5>
                <div className="text-sm opacity-90 leading-relaxed">
                    {t('pleaseSignIn')}
                </div>
            </div>
        </div>
    );
}
