/** @format */
import {getTranslations} from 'next-intl/server'
import Link from 'next/link'
import {ForgotPasswordForm} from "@/components/auth/forgot-password-form";

/**
 * Forgot Password Page Component.
 *
 * Renders the layout for the password reset request flow,
 * wrapping the form in a centered, styled card.
 */
export default async function ForgotPasswordPage() {
    const t = await getTranslations('pages.auth.forgotPassword')

    return (
        <div className="min-h-screen w-full flex justify-center items-center bg-background py-10 px-4">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">

                {/* Main Card Container */}
                <div
                    className="rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden">

                    {/* Header */}
                    <div className="flex flex-col space-y-1.5 p-8 pb-6 text-center border-b border-border">
                        <h1 className="text-2xl font-bold leading-none tracking-tight text-foreground">
                            {t('title')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('subtitle')}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8 pt-6">
                        <ForgotPasswordForm/>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-center p-6 bg-muted/20 border-t border-border">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6"/>
                            </svg>
                            {t('backToLogin')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
