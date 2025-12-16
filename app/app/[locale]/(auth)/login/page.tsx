/** @format */
import {Suspense} from 'react'
import {getTranslations} from 'next-intl/server'
import Link from 'next/link'
import {LoginForm} from "@/components/auth/login-form";
import {ExpiredSessionNotice} from "@/components/auth/expired-session-notice";

/**
 * Login Page Component.
 *
 * Renders the authentication entry point with a centered card layout,
 * handling session expiration notices and the main login form.
 */
export default async function LoginPage() {
    const t = await getTranslations('pages.auth.login')

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
                        <Suspense fallback={null}>
                            <ExpiredSessionNotice/>
                        </Suspense>

                        <LoginForm/>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-center p-6 bg-muted/20 border-t border-border">
                        <p className="text-sm text-muted-foreground text-center">
                            {t('noAccount')}{' '}
                            <Link
                                href="/register"
                                className="text-primary hover:text-primary-hover font-medium underline-offset-4 hover:underline transition-colors"
                            >
                                {t('createOne')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
