/** @format */
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { verifySession } from '@/lib/controller/auth/session-controller'
import { AlertOctagon, ArrowLeft } from 'lucide-react'

/**
 * Props for the AccessDeniedPage component.
 */
interface AccessDeniedPageProps {
    searchParams: Promise<{
        /** Comma-separated list of role identifiers required for access. */
        required?: string
    }>
}

/**
 * Access Denied Page Component.
 *
 * Displays a 403 Forbidden style message for authenticated users who
 * attempt to access a route they are not authorized for.
 */
export default async function AccessDeniedPage({ searchParams }: AccessDeniedPageProps) {
    const t = await getTranslations('pages.auth.accessControl')
    const params = await searchParams

    // Verify session - if not logged in, they should go to login, not access denied
    const user = await verifySession()
    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen w-full flex justify-center items-center bg-background py-10 px-4">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">

                {/* Main Card Container */}
                <div className="rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden text-center">

                    <div className="p-8 pt-10 pb-8 flex flex-col items-center">
                        {/* Error Icon */}
                        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center ring-1 ring-destructive/20 mb-6">
                            <AlertOctagon className="h-10 w-10 text-destructive" />
                        </div>

                        {/* Heading */}
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            {t('accessDenied')}
                        </h1>

                        {/* Description */}
                        <p className="text-muted-foreground mb-6 max-w-[280px] mx-auto">
                            {t('noPermission')}
                        </p>

                        {/* Optional Role Info */}
                        {params.required && (
                            <div className="mb-8 rounded-lg bg-muted/50 px-4 py-2 text-xs font-mono text-muted-foreground border border-border inline-block">
                                <span className="font-semibold mr-2">{t('requiredRoles')}:</span>
                                {params.required.split(',').join(', ')}
                            </div>
                        )}

                        {/* Action Button */}
                        <Link
                            href="/dashboard"
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('goToDashboard')}
                        </Link>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-muted/20 border-t border-border p-4">
                        <p className="text-xs text-muted-foreground">
                            {t('errorId')}: <span className="font-mono">403_FORBIDDEN</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
