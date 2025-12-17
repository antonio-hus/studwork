"use client"
import {useTranslations} from 'next-intl'
import {User} from '@/lib/domain/user'

export function StudentDashboard({user}: { user: User }) {
    const t = useTranslations('dashboard.student')

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">{t('welcome', {name: user.name})}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
            {/* Student specific widgets go here */}
        </div>
    )
}
