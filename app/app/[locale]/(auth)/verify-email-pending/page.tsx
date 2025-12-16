/** @format */
import {redirect} from 'next/navigation'
import {getTranslations} from 'next-intl/server'
import {verifySession} from '@/lib/controller/auth/session-controller'
import {Mail} from 'lucide-react'
import {VerifyEmailPendingForm} from "@/components/auth/verify-email-pending-form";

/**
 * Verify Email Pending Page Component.
 *
 * Renders the state where a user has registered but needs to verify their email.
 * Guards against unauthenticated access or already verified users.
 */
export default async function VerifyEmailPendingPage() {
    const t = await getTranslations('pages.auth.verifyEmailPending')

    // Verify authentication using session controller
    const user = await verifySession()

    // Must be logged in to see this pending state
    if (!user) {
        redirect('/login')
    }

    // If already verified, redirect to dashboard
    if (user.emailVerified) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen w-full flex justify-center items-center bg-background py-10 px-4">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">

                {/* Main Card Container */}
                <div
                    className="rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden">

                    {/* Header with Icon */}
                    <div
                        className="flex flex-col items-center space-y-4 p-8 pb-6 text-center border-b border-border bg-muted/5">
                        <div
                            className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                            <Mail className="h-8 w-8 text-primary"/>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold leading-none tracking-tight text-foreground">
                                {t('title')}
                            </h1>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                {t('subtitle')} <span className="font-medium text-foreground">{user.email}</span>
                            </p>
                        </div>
                    </div>

                    {/* Content Steps */}
                    <div className="p-8 space-y-6">
                        <div className="rounded-xl border border-border bg-muted/50 p-4">
                            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                {t('nextSteps')}
                            </h2>
                            <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside marker:text-primary marker:font-medium">
                                <li className="pl-1"><span className="pl-1">{t('step1')}</span></li>
                                <li className="pl-1"><span className="pl-1">{t('step2')}</span></li>
                                <li className="pl-1"><span className="pl-1">{t('step3')}</span></li>
                            </ol>
                        </div>

                        {/* Interactive Form Area */}
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    {t('didNotReceive')}
                                </p>
                            </div>
                            <VerifyEmailPendingForm/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
