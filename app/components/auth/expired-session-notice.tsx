/** @format */
'use client'

import {useSearchParams} from 'next/navigation'
import {useTranslations} from 'next-intl'
import {AlertTriangle} from 'lucide-react'

/**
 * Expired Session Notice Component.
 *
 * Displays a warning banner if the user was redirected here due to
 * an expired session (indicated by the `expired=true` query param).
 */
export function ExpiredSessionNotice() {
    const searchParams = useSearchParams()
    const t = useTranslations('pages.auth.session')
    const expired = searchParams.get('expired')

    if (!expired) return null

    return (
        <div
            className="mb-6 rounded-xl border border-warning/30 bg-warning/10 p-4 text-warning flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
            <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0"/>
            <div className="space-y-1">
                <p className="text-sm font-semibold leading-none">
                    {t('expired')}
                </p>
                <p className="text-xs opacity-90 leading-relaxed">
                    {t('pleaseSignIn')}
                </p>
            </div>
        </div>
    )
}
